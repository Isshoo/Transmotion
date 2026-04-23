"""TrainingJob service"""

import math
from datetime import datetime, timezone

from sqlalchemy import desc

from app.config.extensions import db
from app.layers.models.dataset import Dataset, PreprocessingStatus
from app.layers.models.trained_model import TrainedModel
from app.layers.models.training_job import JobStatus, ModelType, TrainingJob
from app.layers.services.sse_service import sse_manager
from app.utils.exceptions import BadRequestError, NotFoundError
from app.utils.logger import logger

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
    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")
    if dataset.preprocessing_status != PreprocessingStatus.COMPLETED:
        raise BadRequestError("Dataset belum memiliki data preprocessed")

    total = dataset.num_rows_preprocessed or 0
    if total == 0:
        raise BadRequestError("Dataset preprocessed kosong")

    dist = dataset.class_distribution_preprocessed or {}
    if not dist:
        raise BadRequestError("Informasi distribusi kelas tidak tersedia")

    train_per_class, test_per_class, errors = {}, {}, []
    for label, count in dist.items():
        test_n = max(1, math.floor(count * test_size))
        train_n = count - test_n
        train_per_class[label] = train_n
        test_per_class[label] = test_n
        if train_n < MIN_SAMPLES_PER_CLASS:
            errors.append(
                f"Kelas '{label}': hanya {train_n} data di train set (minimal {MIN_SAMPLES_PER_CLASS})"
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
    from flask import current_app

    dataset = db.session.get(Dataset, dataset_id)
    if not dataset:
        raise NotFoundError("Dataset tidak ditemukan")
    if dataset.preprocessing_status != PreprocessingStatus.COMPLETED:
        raise BadRequestError("Dataset harus sudah melalui preprocessing")
    if not dataset.columns_configured():
        raise BadRequestError("Kolom teks dan label belum dikonfigurasi")

    split_info = compute_split_preview(dataset_id, test_size)
    if not split_info["is_valid"]:
        raise BadRequestError(
            "Data tidak cukup: " + "; ".join(split_info["validation_errors"])
        )

    if not job_name:
        job_name = f"{model_type.upper()} — {dataset.name}"

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

    logger.info(f"Training job created: {job.id}")

    # ── Broadcast ke list view SSE ─────────────────────────────
    _broadcast_job(job)

    # ── Coba panggil Colab langsung ────────────────────────────
    from app.layers.services import colab_service

    api_key = current_app.config.get("COLAB_API_KEY", "")
    if colab_service.is_available():
        job_data = job.to_dict()
        job_data["dataset_file_path"] = dataset.file_path
        job_data["dataset_text_column"] = dataset.text_column
        job_data["dataset_label_column"] = dataset.label_column
        job_data["dataset_labels"] = dataset.class_distribution_preprocessed or {}

        success = colab_service.call_train(job_data, api_key)
        if not success:
            logger.warning(f"Colab tidak merespons, job {job.id[:8]} tetap queued")
    else:
        logger.info("Colab tidak terdaftar — job akan menunggu Colab online")

    return job


def cancel(job_id: str) -> TrainingJob:
    job = get_by_id(job_id)
    if job.status not in (JobStatus.QUEUED, JobStatus.RUNNING):
        raise BadRequestError(f"Job tidak bisa dibatalkan: status {job.status.value}")

    job.status = JobStatus.CANCELLED
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()

    _broadcast_job(job)
    logger.info(f"Job cancelled: {job_id}")
    return job


# ── Colab push endpoints ───────────────────────────────────────────────────────


def get_next_queued_job() -> TrainingJob | None:
    """Fallback: Colab masih bisa polling jika tidak ada ngrok."""
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
        _broadcast_job(job)
        logger.info(f"Job {job.id} picked up via polling")
    return job


def mark_running(job_id: str, colab_session_id: str = None) -> TrainingJob:
    """Colab konfirmasi job sudah mulai diproses."""
    job = get_by_id(job_id)
    if job.status == JobStatus.QUEUED:
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now(timezone.utc)
        if colab_session_id:
            job.colab_session_id = colab_session_id
        db.session.commit()
        _broadcast_job(job)
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

    # ── Broadcast progress via SSE ─────────────────────────────
    _broadcast_job(job)

    logger.info(
        f"Job {job_id[:8]} epoch {data['current_epoch']}/{data['total_epochs']} "
        f"({data['progress']}%)"
    )
    return job


def complete_job(job_id: str, model_file, data: dict) -> TrainedModel:
    import json
    import os
    import uuid as _uuid

    job = get_by_id(job_id)

    model_dir = os.path.join(
        os.path.dirname(__file__), "..", "..", "storage", "uploads", "models"
    )
    os.makedirs(model_dir, exist_ok=True)

    model_path = data.get("file_path") or None
    file_size = None

    if model_file and model_file.filename:
        ext = os.path.splitext(model_file.filename)[1] or ".pt"
        local_path = os.path.join(model_dir, f"{_uuid.uuid4().hex}{ext}")
        model_file.save(local_path)
        file_size = os.path.getsize(local_path)
        # Jika tidak ada file_path dari Drive, pakai local path
        if not model_path:
            model_path = local_path

    label_map = data.get("label_map")
    if isinstance(label_map, str):
        try:
            label_map = json.loads(label_map)
        except Exception:
            label_map = {}

    # Parse JSON fields evaluasi
    def parse_json_field(val):
        if not val:
            return None
        if isinstance(val, (dict, list)):
            return val
        try:
            return json.loads(val)
        except Exception:
            return None

    confusion_matrix = parse_json_field(data.get("confusion_matrix"))
    per_class_metrics = parse_json_field(data.get("per_class_metrics"))
    macro_avg = parse_json_field(data.get("macro_avg"))
    weighted_avg = parse_json_field(data.get("weighted_avg"))

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
    job.confusion_matrix = confusion_matrix
    job.per_class_metrics = per_class_metrics
    job.macro_avg = macro_avg
    job.weighted_avg = weighted_avg
    if data.get("colab_session_id"):
        job.colab_session_id = data["colab_session_id"]

    db.session.commit()

    # ── Broadcast complete via SSE ─────────────────────────────
    job_dict = job.to_dict(include_model=True)
    sse_manager.publish(f"job:{job_id}", job_dict, event="complete")
    sse_manager.publish("jobs:list", job_dict, event="update")

    logger.info(f"Job {job_id} completed. Model {trained_model.id} saved.")
    return trained_model


def fail_job(job_id: str, error_message: str) -> TrainingJob:
    job = get_by_id(job_id)
    job.status = JobStatus.FAILED
    job.error_message = error_message
    job.finished_at = datetime.now(timezone.utc)
    db.session.commit()

    # ── Broadcast fail via SSE ─────────────────────────────────
    job_dict = job.to_dict()
    sse_manager.publish(f"job:{job_id}", job_dict, event="error_event")
    sse_manager.publish("jobs:list", job_dict, event="update")

    logger.error(f"Job {job_id} failed: {error_message}")
    return job


# ── Internal helper ────────────────────────────────────────────────────────────


def _broadcast_job(job: TrainingJob):
    """Broadcast update ke SSE channel job detail dan list."""
    job_dict = job.to_dict()
    sse_manager.publish(f"job:{job.id}", job_dict, event="update")
    sse_manager.publish("jobs:list", job_dict, event="update")
