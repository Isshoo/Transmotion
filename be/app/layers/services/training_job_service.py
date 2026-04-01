"""TrainingJob service"""

import math
from datetime import datetime, timezone

from sqlalchemy import desc

from app.config.extensions import db
from app.layers.models.dataset import Dataset, PreprocessingStatus
from app.layers.models.trained_model import TrainedModel
from app.layers.models.training_job import JobStatus, ModelType, TrainingJob
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

# Minimal data per kelas di train set agar training bermakna
MIN_SAMPLES_PER_CLASS = 10
MIN_TOTAL_TRAIN = 50


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
    query = query.order_by(desc(TrainingJob.created_at))

    jobs = query.offset((page - 1) * per_page).limit(per_page).all()
    return jobs, total


def compute_split_preview(dataset_id: str, test_size: float) -> dict:
    """
    Hitung preview train/test split dari preprocessed dataset.
    Menggunakan stratified split agar distribusi kelas proporsional.
    """
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")

    if dataset.preprocessing_status != PreprocessingStatus.COMPLETED:
        raise BadRequestError(
            "Dataset belum memiliki data preprocessed. "
            "Lakukan preprocessing terlebih dahulu."
        )

    total = dataset.num_rows_preprocessed or 0
    if total == 0:
        raise BadRequestError("Dataset preprocessed kosong")

    dist = dataset.class_distribution_preprocessed or {}
    if not dist:
        raise BadRequestError("Informasi distribusi kelas tidak tersedia")

    # Hitung split per kelas (stratified)
    train_per_class = {}
    test_per_class = {}
    errors = []

    for label, count in dist.items():
        test_n = max(1, math.floor(count * test_size))
        train_n = count - test_n
        train_per_class[label] = train_n
        test_per_class[label] = test_n

        if train_n < MIN_SAMPLES_PER_CLASS:
            errors.append(
                f"Kelas '{label}': hanya {train_n} data di train set "
                f"(minimal {MIN_SAMPLES_PER_CLASS})"
            )

    train_total = sum(train_per_class.values())
    test_total = sum(test_per_class.values())

    if train_total < MIN_TOTAL_TRAIN:
        errors.append(
            f"Total train set hanya {train_total} data (minimal {MIN_TOTAL_TRAIN})"
        )

    return {
        "dataset_id": dataset_id,
        "dataset_name": dataset.name,
        "test_size": test_size,
        "total": total,
        "train_total": train_total,
        "test_total": test_total,
        "train_per_class": train_per_class,
        "test_per_class": test_per_class,
        "labels": list(dist.keys()),
        "num_labels": len(dist),
        "is_valid": len(errors) == 0,
        "validation_errors": errors,
    }


def create(
    dataset_id: str,
    model_type: str,
    test_size: float,
    hyperparams: dict,
    job_name: str | None,
    user_id: str | None,
) -> TrainingJob:
    # Validasi dataset
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")

    if dataset.preprocessing_status != PreprocessingStatus.COMPLETED:
        raise BadRequestError(
            "Dataset harus sudah melalui preprocessing sebelum bisa digunakan training"
        )

    if not dataset.columns_configured():
        raise BadRequestError("Kolom teks dan label dataset belum dikonfigurasi")

    # Hitung split preview (sekaligus validasi)
    split_info = compute_split_preview(dataset_id, test_size)

    if not split_info["is_valid"]:
        raise BadRequestError(
            "Data tidak cukup untuk pelatihan: "
            + "; ".join(split_info["validation_errors"])
        )

    # Default job name
    if not job_name:
        mt = model_type.upper()
        job_name = f"{mt} — {dataset.name}"

    job = TrainingJob(
        job_name=job_name,
        dataset_id=dataset_id,
        model_type=ModelType(model_type),
        hyperparams=hyperparams,
        split_info=split_info,
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
            f"Job tidak bisa dibatalkan, status saat ini: {job.status.value}"
        )

    job.status = JobStatus.CANCELLED
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()

    logger.info(f"Training job cancelled: {job_id}")
    return job


# ── Colab endpoints ────────────────────────────────────────────────────────────


def get_next_queued_job() -> TrainingJob | None:
    """Colab polling — ambil job berikutnya."""
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
    job = get_by_id(job_id)

    if job.status != JobStatus.RUNNING:
        raise BadRequestError("Job tidak dalam status running")

    job.current_epoch = data["current_epoch"]
    job.total_epochs = data["total_epochs"]
    job.progress = data["progress"]

    if data.get("colab_session_id"):
        job.colab_session_id = data["colab_session_id"]

    epoch_logs = list(job.epoch_logs or [])
    epoch_logs.append(
        {
            "epoch": data["current_epoch"],
            "train_loss": data.get("train_loss"),
            "val_loss": data.get("val_loss"),
            "val_accuracy": data.get("val_accuracy"),
            "val_f1": data.get("val_f1"),
        }
    )
    job.epoch_logs = epoch_logs
    db.session.commit()

    logger.info(
        f"Job {job_id} progress: epoch {data['current_epoch']}/{data['total_epochs']} "
        f"({data['progress']}%)"
    )
    return job


def complete_job(job_id: str, model_file, data: dict) -> TrainedModel:
    import json
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

    model_path = None
    file_size = None

    if model_file and model_file.filename:
        ext = os.path.splitext(model_file.filename)[1] or ".pt"
        model_filename = f"{_uuid.uuid4().hex}{ext}"
        model_path = os.path.join(model_dir, model_filename)
        model_file.save(model_path)
        file_size = os.path.getsize(model_path)

    # Parse label_map
    label_map = data.get("label_map")
    if isinstance(label_map, str):
        try:
            label_map = json.loads(label_map)
        except Exception:
            label_map = {}

    trained_model = TrainedModel(
        name=data.get("model_name", f"Model dari job {job_id[:8]}"),
        model_type=job.model_type.value,
        base_model_name=data.get("base_model_name"),
        label_map=label_map,
        num_labels=len(label_map) if label_map else 0,
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
    job = get_by_id(job_id)
    job.status = JobStatus.FAILED
    job.error_message = error_message
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()
    logger.error(f"Job {job_id} failed: {error_message}")
    return job
