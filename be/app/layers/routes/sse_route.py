"""SSE (Server-Sent Events) routes — real-time push ke browser."""

import queue
from functools import wraps

from flask import Blueprint, Response, request, stream_with_context

from app.config.extensions import db
from app.layers.models.dataset import Dataset
from app.layers.models.training_job import JobStatus, TrainingJob
from app.layers.services.sse_service import sse_manager
from app.utils.response import error_response

sse_bp = Blueprint("sse", __name__, url_prefix="/api/sse")

PING_TIMEOUT = 20  # detik sebelum kirim ping keepalive


def _get_token_from_request() -> str | None:
    """
    SSE tidak bisa kirim custom header, token diambil dari:
    1. Query param ?token=...
    2. Authorization header (fallback)
    """
    token = request.args.get("token")
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def sse_auth_required(fn):
    """Auth decorator khusus SSE yang baca token dari query param."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        from flask_jwt_extended import decode_token

        token = _get_token_from_request()
        if not token:
            return error_response("Token diperlukan", 401)

        try:
            decoded = decode_token(token)
            user_id = decoded.get("sub")
            from app.layers.models.user import User

            user = db.session.get(User, user_id)
            if not user or not user.is_active:
                return error_response("Akun tidak valid", 401)
            request.current_user = user
        except Exception:
            return error_response("Token tidak valid", 401)

        return fn(*args, **kwargs)

    return wrapper


def _make_sse_response(generator_fn):
    """Bungkus generator sebagai SSE Response dengan header yang benar."""
    response = Response(
        stream_with_context(generator_fn()),
        mimetype="text/event-stream",
    )
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    response.headers["X-Accel-Buffering"] = "no"  # penting untuk nginx
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# ── Dataset preprocessing stream ──────────────────────────────────────────────


@sse_bp.route("/datasets/<dataset_id>")
@sse_auth_required
def stream_dataset(dataset_id):
    """
    Stream status preprocessing dataset.
    Event types: init, update, complete, error_event, ping
    """

    def generate():
        # Kirim state awal
        dataset = db.session.get(Dataset, dataset_id)
        if not dataset:
            yield sse_manager._format(
                {"error": "Dataset tidak ditemukan"}, "error_event"
            )
            return

        yield sse_manager._format(dataset.to_dict(), "init")

        # Jika sudah selesai, langsung tutup
        from app.layers.models.dataset import PreprocessingStatus

        if dataset.preprocessing_status in (
            PreprocessingStatus.COMPLETED,
            PreprocessingStatus.ERROR,
        ):
            return

        # Langganan channel
        channel = f"dataset:{dataset_id}"
        q = sse_manager.subscribe(channel)
        try:
            while True:
                try:
                    msg = q.get(timeout=PING_TIMEOUT)
                    yield msg
                    # Tutup stream jika event adalah complete atau error
                    if "event: complete" in msg or "event: error_event" in msg:
                        break
                except queue.Empty:
                    yield sse_manager.ping()
        finally:
            sse_manager.unsubscribe(channel, q)

    return _make_sse_response(generate)


# ── Training job detail stream ─────────────────────────────────────────────────


@sse_bp.route("/training-jobs/<job_id>")
@sse_auth_required
def stream_job(job_id):
    """
    Stream progress training job tertentu.
    Event types: init, update, complete, error_event, ping
    """

    def generate():
        job = db.session.get(TrainingJob, job_id)
        if not job:
            yield sse_manager._format({"error": "Job tidak ditemukan"}, "error_event")
            return

        yield sse_manager._format(job.to_dict(include_model=True), "init")

        # Jika sudah terminal, tidak perlu subscribe
        if job.status in (
            JobStatus.COMPLETED,
            JobStatus.FAILED,
            JobStatus.CANCELLED,
        ):
            return

        channel = f"job:{job_id}"
        q = sse_manager.subscribe(channel)
        try:
            while True:
                try:
                    msg = q.get(timeout=PING_TIMEOUT)
                    yield msg
                    if "event: complete" in msg or "event: error_event" in msg:
                        break
                except queue.Empty:
                    yield sse_manager.ping()
        finally:
            sse_manager.unsubscribe(channel, q)

    return _make_sse_response(generate)


@sse_bp.route("/training-active")
@sse_auth_required
def stream_active_job():
    """
    Stream untuk halaman training.
    Otomatis follow job yang aktif.
    """

    def generate():
        from sqlalchemy import desc

        from app.layers.models.training_job import JobStatus, TrainingJob

        # Kirim state awal
        active = (
            db.session.query(TrainingJob)
            .filter(TrainingJob.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]))
            .order_by(TrainingJob.created_at.desc())
            .first()
        )
        latest = active or (
            db.session.query(TrainingJob).order_by(desc(TrainingJob.created_at)).first()
        )

        yield sse_manager._format(
            latest.to_dict(include_model=True) if latest else {}, "init"
        )

        if latest and latest.status in (
            JobStatus.COMPLETED,
            JobStatus.FAILED,
            JobStatus.CANCELLED,
        ):
            return

        channel = "jobs:list"
        q = sse_manager.subscribe(channel)
        try:
            while True:
                try:
                    msg = q.get(timeout=PING_TIMEOUT)
                    yield msg
                except queue.Empty:
                    yield sse_manager.ping()
        finally:
            sse_manager.unsubscribe(channel, q)

    return _make_sse_response(generate)


# ── Training jobs list stream ──────────────────────────────────────────────────


@sse_bp.route("/training-jobs")
@sse_auth_required
def stream_jobs_list():
    """
    Stream update untuk tabel list training jobs.
    Browser subscribe sekali, server push tiap ada job yang berubah status.
    Event types: init, update, ping
    """

    def generate():
        # State awal: kirim semua job (5 terbaru)
        from sqlalchemy import desc

        from app.layers.models.training_job import TrainingJob

        recent = (
            db.session.query(TrainingJob)
            .order_by(desc(TrainingJob.created_at))
            .limit(5)
            .all()
        )
        yield sse_manager._format(
            {"jobs": [j.to_dict() for j in recent]},
            "init",
        )

        channel = "jobs:list"
        q = sse_manager.subscribe(channel)
        try:
            while True:
                try:
                    msg = q.get(timeout=PING_TIMEOUT)
                    yield msg
                except queue.Empty:
                    yield sse_manager.ping()
        finally:
            sse_manager.unsubscribe(channel, q)

    return _make_sse_response(generate)


# ── Colab status stream ────────────────────────────────────────────────────────


@sse_bp.route("/colab-status")
@sse_auth_required
def stream_colab_status():
    """
    Stream status Colab.
    - Langsung kirim status terkini saat connect (bukan hanya saat ada event)
    - Kirim ulang status terkini setiap ping timeout
    """

    def generate():
        from app.layers.services import colab_service

        # Kirim status terkini saat pertama connect
        yield sse_manager._format(colab_service.get_status(), "init")

        channel = "colab:status"
        q = sse_manager.subscribe(channel)
        try:
            while True:
                try:
                    msg = q.get(timeout=PING_TIMEOUT)
                    yield msg
                except queue.Empty:
                    # Saat timeout, kirim status terkini (bukan ping kosong)
                    # Ini memastikan badge selalu sinkron meski tidak ada event
                    current_status = colab_service.get_status()
                    yield sse_manager._format(current_status, "ping")
        finally:
            sse_manager.unsubscribe(channel, q)

    return _make_sse_response(generate)
