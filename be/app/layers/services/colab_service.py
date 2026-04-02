"""
Colab service — mengelola koneksi ke Colab worker.

Alur baru:
1. Colab start → POST /api/colab/register → simpan URL di sini
2. User buat job → training_job_service memanggil call_train()
3. Flask POST ke Colab URL → Colab mulai training
4. Colab POST progress → Flask simpan + broadcast SSE
"""

import threading
import time
from datetime import datetime, timezone
from typing import Optional

import requests

from app.utils.logger import logger

# ── State in-memory ────────────────────────────────────────────────────────────
# Key: session_id, Value: {url, registered_at, last_ping}
_colab_sessions: dict = {}
_lock = threading.Lock()

# Timeout: session dianggap offline jika tidak ada ping selama N detik
SESSION_TIMEOUT_SECONDS = 300  # 5 menit


def register(url: str, session_id: str) -> dict:
    """Simpan URL Colab yang baru register."""
    with _lock:
        _colab_sessions[session_id] = {
            "url": url.rstrip("/"),
            "session_id": session_id,
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "last_ping": time.time(),
        }
    logger.info(f"Colab registered: session={session_id} url={url}")
    return _colab_sessions[session_id]


def unregister(session_id: str):
    """Hapus session saat Colab shutdown."""
    with _lock:
        if session_id in _colab_sessions:
            del _colab_sessions[session_id]
            logger.info(f"Colab unregistered: session={session_id}")


def ping(session_id: str):
    """Update last_ping timestamp."""
    with _lock:
        if session_id in _colab_sessions:
            _colab_sessions[session_id]["last_ping"] = time.time()


def get_active_session() -> Optional[dict]:
    """
    Ambil satu session Colab yang aktif.
    Prioritaskan session yang paling baru registrasi.
    """
    with _lock:
        now = time.time()
        active = [
            s
            for s in _colab_sessions.values()
            if now - s["last_ping"] < SESSION_TIMEOUT_SECONDS
        ]

    if not active:
        return None

    # Ambil yang paling baru
    return sorted(active, key=lambda s: s["registered_at"], reverse=True)[0]


def is_available() -> bool:
    return get_active_session() is not None


def get_status() -> dict:
    """Status untuk admin UI."""
    session = get_active_session()
    with _lock:
        total = len(_colab_sessions)

    if session:
        return {
            "online": True,
            "session_id": session["session_id"],
            "url": session["url"],
            "registered_at": session["registered_at"],
        }
    return {
        "online": False,
        "total_registered": total,
        "message": "Tidak ada Colab worker yang aktif",
    }


def call_train(job_data: dict, api_key: str) -> bool:
    """
    Panggil endpoint /train di Colab.
    Return True jika berhasil, False jika gagal.
    """
    session = get_active_session()
    if not session:
        logger.warning("No active Colab session — job will stay queued")
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
            logger.error(f"Colab rejected job: {res.status_code} {res.text[:200]}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to call Colab /train: {e}")
        # Tandai session sebagai tidak responsif
        with _lock:
            sid = session["session_id"]
            if sid in _colab_sessions:
                _colab_sessions[sid]["last_ping"] = 0
        return False
