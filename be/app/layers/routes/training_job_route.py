"""Training job routes"""

from functools import wraps

from flask import Blueprint, current_app, request

from app.layers.controllers import colab_controller, training_job_controller
from app.layers.middlewares.auth_middleware import admin_required, jwt_required_custom
from app.utils.response import error_response

training_job_bp = Blueprint("training_jobs", __name__, url_prefix="/api/training-jobs")
colab_bp = Blueprint("colab", __name__, url_prefix="/api/colab")


def _colab_key_required(fn):
    """Verifikasi X-Colab-Key header."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get("X-Colab-Key", "")
        expected = current_app.config.get("COLAB_API_KEY", "")
        if not expected or api_key != expected:
            return error_response("Akses tidak diizinkan", 401)
        return fn(*args, **kwargs)

    return wrapper


def _backend_key_required(fn):
    """
    Verifikasi X-Backend-Key header.
    Dipakai Colab untuk endpoint yang hanya boleh dipanggil backend.
    Menggunakan COLAB_API_KEY yang sama (shared secret).
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get("X-Backend-Key", "")
        expected = current_app.config.get("COLAB_API_KEY", "")
        if not expected or api_key != expected:
            return error_response("Akses tidak diizinkan", 401)
        return fn(*args, **kwargs)

    return wrapper


# ── User/Admin routes ──────────────────────────────────────────────────────────


@training_job_bp.route("", methods=["GET"])
@jwt_required_custom
def list_jobs():
    return training_job_controller.list_jobs()


@training_job_bp.route("/<job_id>", methods=["GET"])
@jwt_required_custom
def get_job(job_id):
    return training_job_controller.get_job(job_id)


@training_job_bp.route("/split-preview", methods=["POST"])
@admin_required
def split_preview():
    return training_job_controller.split_preview()


@training_job_bp.route("", methods=["POST"])
@admin_required
def create_job():
    return training_job_controller.create_job()


@training_job_bp.route("/<job_id>/cancel", methods=["POST"])
@admin_required
def cancel_job(job_id):
    return training_job_controller.cancel_job(job_id)


# ── Colab management routes ────────────────────────────────────────────────────


@colab_bp.route("/register", methods=["POST"])
@_colab_key_required
def register_colab():
    return colab_controller.register_colab()


@colab_bp.route("/unregister", methods=["POST"])
@_colab_key_required
def unregister_colab():
    return colab_controller.unregister_colab()


@colab_bp.route("/ping", methods=["POST"])
@_colab_key_required
def ping_colab():
    return colab_controller.ping_colab()


@colab_bp.route("/status", methods=["GET"])
@jwt_required_custom
def get_colab_status():
    return colab_controller.get_colab_status()


# ── Colab job callbacks ────────────────────────────────────────────────────────


@colab_bp.route("/jobs/next", methods=["GET"])
@_colab_key_required
def colab_get_next_job():
    """Fallback polling — tetap tersedia."""
    return colab_controller.colab_get_next_job()


@colab_bp.route("/datasets/<dataset_id>/preprocessed", methods=["GET"])
@_colab_key_required
def colab_get_preprocessed_data(dataset_id):
    """
    Endpoint khusus Colab untuk mengambil preprocessed data.
    Menggunakan X-Colab-Key, bukan JWT.
    """
    from app.layers.controllers import dataset_controller
    return dataset_controller.get_preprocessed_data(dataset_id)

@colab_bp.route("/jobs/<job_id>/running", methods=["POST"])
@_colab_key_required
def colab_mark_running(job_id):
    return colab_controller.colab_mark_running(job_id)


@colab_bp.route("/jobs/<job_id>/progress", methods=["POST"])
@_colab_key_required
def colab_update_progress(job_id):
    return colab_controller.colab_update_progress(job_id)


@colab_bp.route("/jobs/<job_id>/complete", methods=["POST"])
@_colab_key_required
def colab_complete_job(job_id):
    return colab_controller.colab_complete_job(job_id)


@colab_bp.route("/jobs/<job_id>/fail", methods=["POST"])
@_colab_key_required
def colab_fail_job(job_id):
    return colab_controller.colab_fail_job(job_id)
