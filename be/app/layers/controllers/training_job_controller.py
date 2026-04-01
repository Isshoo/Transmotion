"""TrainingJob controller"""

from flask import request
from marshmallow import ValidationError

from app.layers.schemas.training_job_schema import (
    CompleteJobSchema,
    CreateTrainingJobSchema,
    JobListQuerySchema,
    SplitPreviewSchema,
    UpdateJobProgressSchema,
)
from app.layers.services import training_job_service
from app.utils.response import error_response, paginated_response, success_response


def _parse_err(err: ValidationError):
    return error_response(
        message=f"Validasi gagal: {', '.join([v[0] for v in err.messages.values()])}",
        errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
        status_code=422,
    )


def list_jobs():
    try:
        params = JobListQuerySchema().load(request.args)
    except ValidationError as err:
        return _parse_err(err)

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


def split_preview():
    """GET/POST — hitung preview split sebelum buat job."""
    try:
        data = SplitPreviewSchema().load(request.get_json() or request.args.to_dict())
    except ValidationError as err:
        return _parse_err(err)

    preview = training_job_service.compute_split_preview(
        dataset_id=data["dataset_id"],
        test_size=data["test_size"],
    )
    return success_response(data=preview, message="Preview split berhasil dihitung")


def create_job():
    try:
        data = CreateTrainingJobSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

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
        test_size=data["test_size"],
        hyperparams=hyperparams,
        job_name=data.get("job_name"),
        user_id=request.current_user.id,
    )
    return success_response(
        data=job.to_dict(), message="Training job berhasil dibuat", status_code=201
    )


def cancel_job(job_id):
    job = training_job_service.cancel(job_id)
    return success_response(
        data=job.to_dict(), message="Training job berhasil dibatalkan"
    )


# ── Colab ──────────────────────────────────────────────────────────────────────


def colab_get_next_job():
    job = training_job_service.get_next_queued_job()
    if not job:
        return success_response(data=None, message="Tidak ada job yang menunggu")

    job_data = job.to_dict()

    # Sertakan info yang dibutuhkan Colab
    if job.dataset:
        job_data["dataset_file_path"] = job.dataset.file_path
        job_data["dataset_text_column"] = job.dataset.text_column
        job_data["dataset_label_column"] = job.dataset.label_column
        job_data["dataset_labels"] = job.dataset.class_distribution_preprocessed or {}

    return success_response(data=job_data, message="Job ditemukan")


def colab_update_progress(job_id):
    try:
        data = UpdateJobProgressSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _parse_err(err)

    job = training_job_service.update_progress(job_id, data)
    return success_response(data=job.to_dict(), message="Progress diperbarui")


def colab_complete_job(job_id):
    try:
        form_data = CompleteJobSchema().load(request.form.to_dict())
    except ValidationError as err:
        return _parse_err(err)

    model_file = request.files.get("model_file")
    result = training_job_service.complete_job(
        job_id=job_id, model_file=model_file, data=form_data
    )
    return success_response(
        data=result.to_dict(), message="Training selesai, model berhasil disimpan"
    )


def colab_fail_job(job_id):
    body = request.get_json() or {}
    error_message = body.get("error_message", "Unknown error")
    job = training_job_service.fail_job(job_id, error_message)
    return success_response(data=job.to_dict(), message="Job ditandai gagal")
