"""
SSE (Server-Sent Events) channel manager.
Menggunakan in-memory queue per channel.
Catatan: hanya cocok untuk single-process deployment.
Untuk multi-worker gunicorn, ganti dengan Redis Pub/Sub.
"""

import json
import queue
import threading
from typing import Dict, List


class SSEManager:
    def __init__(self):
        self._listeners: Dict[str, List[queue.Queue]] = {}
        self._lock = threading.Lock()

    def subscribe(self, channel: str) -> queue.Queue:
        """Buat queue baru untuk channel tertentu."""
        q = queue.Queue(maxsize=100)
        with self._lock:
            self._listeners.setdefault(channel, []).append(q)
        return q

    def unsubscribe(self, channel: str, q: queue.Queue):
        """Hapus queue dari channel saat client disconnect."""
        with self._lock:
            listeners = self._listeners.get(channel, [])
            try:
                listeners.remove(q)
            except ValueError:
                pass
            if not listeners and channel in self._listeners:
                del self._listeners[channel]

    def publish(self, channel: str, data: dict, event: str = "update"):
        """Kirim data ke semua subscriber channel."""
        with self._lock:
            listeners = list(self._listeners.get(channel, []))

        if not listeners:
            return

        msg = self._format(data, event)
        for q in listeners:
            try:
                q.put_nowait(msg)
            except queue.Full:
                pass  # client lambat, skip

    def publish_to_all(self, prefix: str, data: dict, event: str = "update"):
        """
        Publish ke semua channel yang dimulai dengan prefix tertentu.
        Contoh: publish_to_all("job:", data) → kirim ke semua subscriber job.
        """
        with self._lock:
            matched = [ch for ch in self._listeners if ch.startswith(prefix)]
            listeners_map = {ch: list(self._listeners[ch]) for ch in matched}

        msg = self._format(data, event)
        for listeners in listeners_map.values():
            for q in listeners:
                try:
                    q.put_nowait(msg)
                except queue.Full:
                    pass

    def _format(self, data: dict, event: str = None) -> str:
        lines = []
        if event:
            lines.append(f"event: {event}")
        lines.append(f"data: {json.dumps(data, ensure_ascii=False)}")
        lines.append("")
        return "\n".join(lines) + "\n"

    def ping(self) -> str:
        return "event: ping\ndata: {}\n\n"

    def subscriber_count(self, channel: str) -> int:
        with self._lock:
            return len(self._listeners.get(channel, []))


# Singleton — diimpor oleh services lain
sse_manager = SSEManager()
