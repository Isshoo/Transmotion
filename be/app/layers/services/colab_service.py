"""
Colab service — mengelola koneksi ke Colab worker.

Strategi status yang lebih reliable:
1. Colab register saat online (set last_ping)
2. Colab kirim heartbeat tiap 60s (update last_ping)
3. Backend punya dua threshold:
   - WARN_THRESHOLD: belum ping > 90s → status "degraded" (mungkin lambat)
   - OFFLINE_THRESHOLD: belum ping > 180s → status "offline"
   (lebih pendek dari 300s agar tidak terlalu lama terlambat deteksi)
4. Backend bisa aktif health-check ke Colab jika diperlukan
5. SSE broadcast status saat ada perubahan meaningful
"""

import threading
import time
from datetime import datetime, timezone
from typing import Optional

import requests

from app.utils.logger import logger

_colab_sessions: dict = {}
_lock = threading.Lock()

# Threshold yang lebih agresif
WARN_THRESHOLD_SECONDS = 65  # degraded jika belum ping 65s (worker ping tiap 60s)
OFFLINE_THRESHOLD_SECONDS = 90  # offline jika belum ping 90s


def register(url: str, session_id: str) -> dict:
    with _lock:
        _colab_sessions[session_id] = {
            "url": url.rstrip("/"),
            "session_id": session_id,
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "last_ping": time.time(),
            "last_health_check": None,
            "health_check_failed": 0,
        }
    logger.info(f"Colab registered: session={session_id} url={url}")
    _broadcast_status()
    return _colab_sessions[session_id]


def unregister(session_id: str):
    with _lock:
        if session_id in _colab_sessions:
            del _colab_sessions[session_id]
            logger.info(f"Colab unregistered: session={session_id}")
    _broadcast_status()


def ping(session_id: str):
    with _lock:
        if session_id in _colab_sessions:
            _colab_sessions[session_id]["last_ping"] = time.time()
            _colab_sessions[session_id]["health_check_failed"] = 0


def _session_status(session: dict) -> str:
    """
    Tentukan status satu session berdasarkan last_ping.
    Returns: "online" | "degraded" | "offline"
    """
    now = time.time()
    elapsed = now - session["last_ping"]

    if elapsed < WARN_THRESHOLD_SECONDS:
        return "online"
    elif elapsed < OFFLINE_THRESHOLD_SECONDS:
        return "degraded"
    else:
        return "offline"


def get_active_session() -> Optional[dict]:
    """Ambil session yang statusnya online atau degraded."""
    with _lock:
        sessions = list(_colab_sessions.values())

    active = [s for s in sessions if _session_status(s) in ("online", "degraded")]

    if not active:
        return None

    return sorted(active, key=lambda s: s["last_ping"], reverse=True)[0]


def is_available() -> bool:
    return get_active_session() is not None


def get_status() -> dict:
    """
    Status detail untuk SSE dan admin UI.
    Lebih informatif dari sebelumnya.
    """
    with _lock:
        sessions = list(_colab_sessions.values())

    if not sessions:
        return {
            "online": False,
            "status": "offline",
            "message": "Tidak ada Colab worker yang terdaftar",
            "session_id": None,
            "url": None,
            "registered_at": None,
            "last_ping_seconds_ago": None,
        }

    # Ambil session terbaik
    best = sorted(sessions, key=lambda s: s["last_ping"], reverse=True)[0]
    status = _session_status(best)
    elapsed = int(time.time() - best["last_ping"])

    if status == "online":
        message = f"Online — ping {elapsed}s lalu"
    elif status == "degraded":
        message = f"Koneksi tidak stabil — ping terakhir {elapsed}s lalu"
    else:
        message = f"Offline — ping terakhir {elapsed}s lalu"

    return {
        "online": status in ("online", "degraded"),
        "status": status,  # "online" | "degraded" | "offline"
        "message": message,
        "session_id": best["session_id"],
        "url": best["url"],
        "registered_at": best["registered_at"],
        "last_ping_seconds_ago": elapsed,
    }


def health_check(api_key: str) -> bool:
    """
    Aktif cek apakah Colab masih merespons.
    Dipanggil saat status degraded untuk konfirmasi.
    """
    session = get_active_session()
    if not session:
        return False

    url = f"{session['url']}/health"
    try:
        res = requests.get(
            url,
            headers={"X-Backend-Key": api_key},
            timeout=10,
        )
        if res.status_code == 200:
            # Update last_ping karena Colab terbukti hidup
            with _lock:
                sid = session["session_id"]
                if sid in _colab_sessions:
                    _colab_sessions[sid]["last_ping"] = time.time()
                    _colab_sessions[sid]["last_health_check"] = time.time()
                    _colab_sessions[sid]["health_check_failed"] = 0
            logger.info(f"Health check OK: {url}")
            return True
        else:
            logger.warning(
                f"Health check rejected with status {res.status_code}: {url}"
            )
            force_offline(session["session_id"])
            return False
    except Exception as e:
        logger.warning(f"Health check failed (Exception): {url} — {e}")
        force_offline(session["session_id"])
        return False


def _mark_health_check_failed(session_id: str):
    with _lock:
        if session_id in _colab_sessions:
            _colab_sessions[session_id]["health_check_failed"] = (
                _colab_sessions[session_id].get("health_check_failed", 0) + 1
            )
            # Jika gagal 2x berturut-turut → paksa offline
            if _colab_sessions[session_id]["health_check_failed"] >= 2:
                _colab_sessions[session_id]["last_ping"] = 0
                logger.warning(
                    f"Session {session_id} marked offline after 2 failed health checks"
                )
    _broadcast_status()


def force_offline(session_id: str):
    """Secara paksa menandai session offline, misalnya saat dapat 503 dari ngrok."""
    with _lock:
        if session_id in _colab_sessions:
            _colab_sessions[session_id]["last_ping"] = 0
            _colab_sessions[session_id]["health_check_failed"] = 3
            logger.warning(
                f"Session {session_id} forced offline due to explicit connection failure"
            )
    _broadcast_status()


def _broadcast_status():
    try:
        from app.layers.services.sse_service import sse_manager

        sse_manager.publish("colab:status", get_status(), event="update")
    except Exception:
        pass


def call_train(job_data: dict, api_key: str) -> bool:
    session = get_active_session()
    if not session:
        return False

    url = f"{session['url']}/train"
    try:
        res = requests.post(
            url,
            json=job_data,
            headers={"X-Backend-Key": api_key},
            timeout=15,
        )
        if res.status_code == 200:
            logger.info(f"Colab accepted job {job_data.get('id', '')[:8]}")
            return True
        else:
            logger.error(f"Colab rejected: {res.status_code}")
            _mark_health_check_failed(session["session_id"])
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to call Colab /train: {e}")
        force_offline(session["session_id"])
        return False
