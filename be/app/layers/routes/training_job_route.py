"""Training job routes"""

from functools import wraps

from flask import Blueprint, current_app, request

from app.layers.controllers import training_job_controller
from app.layers.middlewares.auth_middleware import admin_required, jwt_required_custom
from app.utils.response import error_response

training_job_bp = Blueprint("training_jobs", __name__, url_prefix="/api/training-jobs")
colab_bp = Blueprint("colab", __name__, url_prefix="/api/colab")


# ── Middleware khusus Colab (pakai API key, bukan JWT) ─────────────────────────
def colab_api_key_required(fn):
    """
    Colab tidak punya JWT. Kita pakai secret API key yang di-set di .env:
    COLAB_API_KEY=your-secret-key
    Header: X-Colab-Key: your-secret-key
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        api_key = request.headers.get("X-Colab-Key", "")
        expected = current_app.config.get("COLAB_API_KEY", "")
        if not expected or api_key != expected:
            return error_response(message="Akses tidak diizinkan", status_code=401)
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


@training_job_bp.route("", methods=["POST"])
@admin_required
def create_job():
    return training_job_controller.create_job()


@training_job_bp.route("/<job_id>/cancel", methods=["POST"])
@admin_required
def cancel_job(job_id):
    return training_job_controller.cancel_job(job_id)


# ── Colab-only routes ──────────────────────────────────────────────────────────


@colab_bp.route("/jobs/next", methods=["GET"])
@colab_api_key_required
def colab_get_next_job():
    return training_job_controller.colab_get_next_job()


@colab_bp.route("/jobs/<job_id>/progress", methods=["POST"])
@colab_api_key_required
def colab_update_progress(job_id):
    return training_job_controller.colab_update_progress(job_id)


@colab_bp.route("/jobs/<job_id>/complete", methods=["POST"])
@colab_api_key_required
def colab_complete_job(job_id):
    return training_job_controller.colab_complete_job(job_id)


@colab_bp.route("/jobs/<job_id>/fail", methods=["POST"])
@colab_api_key_required
def colab_fail_job(job_id):
    return training_job_controller.colab_fail_job(job_id)
