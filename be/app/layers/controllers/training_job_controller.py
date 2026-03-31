"""TrainingJob controller — request handlers"""

from flask import request
from marshmallow import ValidationError

from app.layers.schemas.training_job_schema import (
    CompleteJobSchema,
    CreateTrainingJobSchema,
    JobListQuerySchema,
    UpdateJobProgressSchema,
)
from app.layers.services import training_job_service
from app.utils.response import error_response, paginated_response, success_response


def _parse_validation_error(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


def list_jobs():
    try:
        params = JobListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_validation_error(err)

    jobs, total = training_job_service.get_all(
        page=params["page"],
        per_page=params["per_page"],
        status=params.get("status"),
        model_type=params.get("model_type"),
        sort_order=params.get("sort_order", "desc"),
    )
    return paginated_response(
        data=[j.to_dict() for j in jobs],
        total=total,
        page=params["page"],
        per_page=params["per_page"],
        message="Daftar training job berhasil diambil",
    )


def get_job(job_id):
    job = training_job_service.get_by_id(job_id)
    return success_response(
        data=job.to_dict(include_model=True),
        message="Detail job berhasil diambil",
    )


def create_job():
    try:
        data = CreateTrainingJobSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_validation_error(err)

    hyperparams = {
        "learning_rate": data["learning_rate"],
        "epochs": data["epochs"],
        "batch_size": data["batch_size"],
        "max_length": data["max_length"],
        "warmup_steps": data["warmup_steps"],
        "weight_decay": data["weight_decay"],
    }

    job = training_job_service.create(
        dataset_id=data["dataset_id"],
        model_type=data["model_type"],
        hyperparams=hyperparams,
        user_id=request.current_user.id,
    )
    return success_response(
        data=job.to_dict(),
        message="Training job berhasil dibuat",
        status_code=201,
    )


def cancel_job(job_id):
    job = training_job_service.cancel(job_id)
    return success_response(
        data=job.to_dict(), message="Training job berhasil dibatalkan"
    )


# ── Endpoint khusus Colab ──────────────────────────────────────────────────────


def colab_get_next_job():
    """GET /api/colab/jobs/next — Colab polling untuk job berikutnya."""
    job = training_job_service.get_next_queued_job()
    if not job:
        return success_response(data=None, message="Tidak ada job yang menunggu")

    # Sertakan info dataset supaya Colab tahu path file-nya
    job_data = job.to_dict()
    if job.dataset:
        job_data["dataset_file_path"] = job.dataset.file_path
        job_data["dataset_text_column"] = job.dataset.text_column
        job_data["dataset_label_column"] = job.dataset.label_column
        job_data["dataset_labels"] = job.dataset.labels

    return success_response(data=job_data, message="Job ditemukan")


def colab_update_progress(job_id):
    """POST /api/colab/jobs/<job_id>/progress — Colab update progress per epoch."""
    try:
        data = UpdateJobProgressSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_validation_error(err)

    job = training_job_service.update_progress(job_id, data)
    return success_response(data=job.to_dict(), message="Progress diperbarui")


def colab_complete_job(job_id):
    """POST /api/colab/jobs/<job_id>/complete — Colab upload model setelah selesai."""
    try:
        form_data = CompleteJobSchema().load(request.form.to_dict())
    except ValidationError as err:
        return _parse_validation_error(err)

    # label_map perlu di-parse manual karena dari form data
    import json

    raw_label_map = request.form.get("label_map", "{}")
    try:
        label_map = json.loads(raw_label_map)
    except Exception:
        return error_response(
            message="Format label_map tidak valid (harus JSON string)", status_code=422
        )

    form_data["label_map"] = label_map

    model_file = request.files.get("model_file")

    trained_model = training_job_service.complete_job(
        job_id=job_id,
        model_file=model_file,
        data=form_data,
    )
    return success_response(
        data=trained_model.to_dict(),
        message="Training selesai, model berhasil disimpan",
    )


def colab_fail_job(job_id):
    """POST /api/colab/jobs/<job_id>/fail — Colab laporan error."""
    body = request.get_json() or {}
    error_message = body.get("error_message", "Unknown error")
    job = training_job_service.fail_job(job_id, error_message)
    return success_response(data=job.to_dict(), message="Job ditandai gagal")
