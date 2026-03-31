"""TrainingJob service — business logic untuk manajemen training job"""

from datetime import datetime, timezone

from sqlalchemy import asc, desc

from app.config.extensions import db
from app.layers.models.dataset import DatasetStatus
from app.layers.models.trained_model import TrainedModel
from app.layers.models.training_job import JobStatus, ModelType, TrainingJob
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger


def get_by_id(job_id: str) -> TrainingJob:
    job = db.session.get(TrainingJob, job_id)
    if not job:
        raise NotFoundError("Training job tidak ditemukan")
    return job


def get_all(page=1, per_page=20, status=None, model_type=None, sort_order="desc"):
    query = db.session.query(TrainingJob)

    if status:
        query = query.filter(TrainingJob.status == JobStatus(status))
    if model_type:
        query = query.filter(TrainingJob.model_type == ModelType(model_type))

    total = query.count()

    sort_fn = desc if sort_order == "desc" else asc
    query = query.order_by(sort_fn(TrainingJob.created_at))

    offset = (page - 1) * per_page
    jobs = query.offset(offset).limit(per_page).all()

    return jobs, total


def create(
    dataset_id: str, model_type: str, hyperparams: dict, user_id: str | None
) -> TrainingJob:
    # Validasi dataset
    from app.layers.models.dataset import Dataset

    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")
    if dataset.status != DatasetStatus.READY:
        raise BadRequestError(
            "Dataset belum siap — lakukan preprocessing terlebih dahulu"
        )

    job = TrainingJob(
        dataset_id=dataset_id,
        model_type=ModelType(model_type),
        hyperparams=hyperparams,
        total_epochs=hyperparams.get("epochs", 3),
        status=JobStatus.QUEUED,
        created_by=user_id,
    )
    db.session.add(job)
    db.session.commit()

    logger.info(
        f"Training job created: {job.id} ({model_type}) on dataset {dataset_id}"
    )
    return job


def cancel(job_id: str) -> TrainingJob:
    job = get_by_id(job_id)

    if job.status not in (JobStatus.QUEUED, JobStatus.RUNNING):
        raise BadRequestError(
            f"Job tidak bisa dibatalkan karena status saat ini: {job.status.value}"
        )

    job.status = JobStatus.CANCELLED
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()

    logger.info(f"Training job cancelled: {job_id}")
    return job


# ── Endpoint untuk Colab ──────────────────────────────────────────────────────


def get_next_queued_job() -> TrainingJob | None:
    """Colab memanggil ini untuk mengambil job berikutnya yang menunggu."""
    job = (
        db.session.query(TrainingJob)
        .filter(TrainingJob.status == JobStatus.QUEUED)
        .order_by(TrainingJob.created_at.asc())
        .first()
    )

    if job:
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now(timezone.utc)
        db.session.commit()
        logger.info(f"Job {job.id} picked up by Colab")

    return job


def update_progress(job_id: str, data: dict) -> TrainingJob:
    """Colab memanggil ini setiap akhir epoch untuk update progress."""
    job = get_by_id(job_id)

    if job.status != JobStatus.RUNNING:
        raise BadRequestError("Job tidak dalam status running")

    job.current_epoch = data["current_epoch"]
    job.total_epochs = data["total_epochs"]
    job.progress = data["progress"]

    if data.get("colab_session_id"):
        job.colab_session_id = data["colab_session_id"]

    # Tambahkan log epoch
    epoch_logs = job.epoch_logs or []
    epoch_entry = {
        "epoch": data["current_epoch"],
        "train_loss": data.get("train_loss"),
        "val_loss": data.get("val_loss"),
        "val_accuracy": data.get("val_accuracy"),
        "val_f1": data.get("val_f1"),
    }
    epoch_logs.append(epoch_entry)
    job.epoch_logs = epoch_logs

    db.session.commit()
    logger.info(
        f"Job {job_id} progress: epoch {data['current_epoch']}/{data['total_epochs']} ({data['progress']}%)"
    )
    return job


def complete_job(job_id: str, model_file, data: dict) -> TrainedModel:
    """
    Colab memanggil ini saat training selesai.
    Upload file model dan buat record TrainedModel.
    """
    import os
    import uuid as _uuid

    job = get_by_id(job_id)

    if job.status != JobStatus.RUNNING:
        raise BadRequestError("Job tidak dalam status running")

    # Simpan file model
    model_dir = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "storage", "models"
    )
    os.makedirs(model_dir, exist_ok=True)

    model_filename = f"{_uuid.uuid4().hex}.pt"
    model_path = os.path.join(model_dir, model_filename)

    if model_file:
        model_file.save(model_path)
        file_size = os.path.getsize(model_path)
    else:
        model_path = None
        file_size = None

    # Buat record TrainedModel
    trained_model = TrainedModel(
        name=data.get("model_name", f"Model dari job {job_id[:8]}"),
        model_type=job.model_type.value,
        base_model_name=data.get("base_model_name"),
        label_map=data.get("label_map"),
        num_labels=len(data.get("label_map", {})),
        accuracy=data.get("accuracy"),
        f1_score=data.get("f1_score"),
        precision=data.get("precision"),
        recall=data.get("recall"),
        training_config=job.hyperparams,
        file_path=model_path,
        file_size=file_size,
        job_id=job_id,
        is_active=True,
        is_public=True,
    )
    db.session.add(trained_model)

    # Update job
    job.status = JobStatus.COMPLETED
    job.progress = 100
    job.finished_at = datetime.now(timezone.utc)
    job.final_accuracy = data.get("accuracy")
    job.final_f1 = data.get("f1_score")
    job.final_precision = data.get("precision")
    job.final_recall = data.get("recall")

    if data.get("colab_session_id"):
        job.colab_session_id = data["colab_session_id"]

    db.session.commit()

    logger.info(f"Job {job_id} completed. Model {trained_model.id} saved.")
    return trained_model


def fail_job(job_id: str, error_message: str) -> TrainingJob:
    """Colab memanggil ini jika training gagal."""
    job = get_by_id(job_id)

    job.status = JobStatus.FAILED
    job.error_message = error_message
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()

    logger.error(f"Job {job_id} failed: {error_message}")
    return job
