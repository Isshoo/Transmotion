"""Colab controller — register, status, dan job callbacks."""

from flask import request
from marshmallow import ValidationError

from app.layers.schemas.training_job_schema import (
    CompleteJobSchema,
    UpdateJobProgressSchema,
)
from app.layers.services import colab_service, training_job_service
from app.layers.services.sse_service import sse_manager
from app.utils.response import error_response, success_response


def register_colab():
    """
    POST /api/colab/register
    Colab memanggil ini saat pertama kali online.
    Body: { url, session_id }
    """
    data = request.get_json() or {}
    url = data.get("url", "").strip()
    session_id = data.get("session_id", "").strip()

    if not url:
        return error_response("URL harus diisi", 400)
    if not session_id:
        return error_response("Session ID harus diisi", 400)

    session = colab_service.register(url, session_id)

    # Broadcast ke admin UI
    sse_manager.publish("colab:status", colab_service.get_status(), event="update")

    return success_response(
        data=session,
        message=f"Colab berhasil terdaftar: {url}",
        status_code=201,
    )


def unregister_colab():
    """
    POST /api/colab/unregister
    Colab memanggil ini saat shutdown graceful.
    """
    data = request.get_json() or {}
    session_id = data.get("session_id", "")
    colab_service.unregister(session_id)

    sse_manager.publish("colab:status", colab_service.get_status(), event="update")

    return success_response(message="Colab berhasil unregister")


def ping_colab():
    """
    POST /api/colab/ping
    Colab kirim heartbeat berkala agar tidak dianggap offline.
    """
    data = request.get_json() or {}
    session_id = data.get("session_id", "")
    colab_service.ping(session_id)
    return success_response(message="OK")


def get_colab_status():
    """GET /api/colab/status — untuk admin UI."""
    return success_response(
        data=colab_service.get_status(),
        message="Status Colab berhasil diambil",
    )


def colab_get_next_job():
    """
    GET /api/colab/jobs/next
    Fallback polling — masih tersedia jika Colab tidak pakai ngrok.
    """
    job = training_job_service.get_next_queued_job()
    if not job:
        return success_response(data=None, message="Tidak ada job yang menunggu")

    job_data = job.to_dict()
    if job.dataset:
        job_data["dataset_file_path"] = job.dataset.file_path
        job_data["dataset_text_column"] = job.dataset.text_column
        job_data["dataset_label_column"] = job.dataset.label_column
        job_data["dataset_labels"] = job.dataset.class_distribution_preprocessed or {}

    return success_response(data=job_data, message="Job ditemukan")


def colab_mark_running(job_id):
    """
    POST /api/colab/jobs/<job_id>/running
    Colab konfirmasi job sudah mulai (saat pakai mode push/ngrok).
    """
    data = request.get_json() or {}
    job = training_job_service.mark_running(
        job_id, colab_session_id=data.get("colab_session_id")
    )
    return success_response(data=job.to_dict(), message="Job ditandai running")


def colab_update_progress(job_id):
    """POST /api/colab/jobs/<job_id>/progress"""
    try:
        data = UpdateJobProgressSchema().load(request.get_json() or {})
    except ValidationError as err:
        return error_response(
            message="Validasi gagal",
            errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
            status_code=422,
        )
    job = training_job_service.update_progress(job_id, data)
    return success_response(data=job.to_dict(), message="Progress diperbarui")


def colab_complete_job(job_id):
    """POST /api/colab/jobs/<job_id>/complete"""
    try:
        form_data = CompleteJobSchema().load(request.form.to_dict())
    except ValidationError as err:
        return error_response(
            message="Validasi gagal",
            errors=[{"field": k, "message": v[0]} for k, v in err.messages.items()],
            status_code=422,
        )
    model_file = request.files.get("model_file")
    result = training_job_service.complete_job(
        job_id=job_id, model_file=model_file, data=form_data
    )
    return success_response(
        data=result.to_dict(), message="Training selesai, model berhasil disimpan"
    )


def colab_fail_job(job_id):
    """POST /api/colab/jobs/<job_id>/fail"""
    body = request.get_json() or {}
    error_message = body.get("error_message", "Unknown error")
    job = training_job_service.fail_job(job_id, error_message)
    return success_response(data=job.to_dict(), message="Job ditandai gagal")
