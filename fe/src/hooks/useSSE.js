/**
 * useSSE — React hook untuk Server-Sent Events.
 *
 * SSE tidak support custom header, jadi token JWT dikirim via query param.
 * Auto-reconnect jika koneksi putus.
 */

import { useEffect, useRef } from "react";

const SSE_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, ""); // hapus /api di akhir → base URL

/**
 * @param {string|null} path - SSE path relatif, contoh: "/api/sse/training-jobs/abc"
 * @param {object} options
 * @param {function} options.onMessage - callback(data, eventType)
 * @param {function} [options.onError] - callback saat error/disconnect
 * @param {function} [options.onClose] - callback saat stream ditutup server
 * @param {boolean} [options.enabled=true] - matikan hook tanpa unmount
 */
export function useSSE(
  path,
  { onMessage, onError, onClose, enabled = true } = {}
) {
  // Gunakan ref untuk callbacks agar tidak perlu dimasukkan ke deps
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onCloseRef = useRef(onClose);
  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isClosedManually = useRef(false);

  // Selalu update ref ke nilai terbaru
  useEffect(() => {
    onMessageRef.current = onMessage;
  });
  useEffect(() => {
    onErrorRef.current = onError;
  });
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!path || !enabled) return;

    isClosedManually.current = false;

    function connect() {
      if (isClosedManually.current) return;

      // Ambil token untuk query param auth
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const url = new URL(`${SSE_BASE}${path}`);
      if (token) url.searchParams.set("token", token);

      const es = new EventSource(url.toString());
      esRef.current = es;

      // Event awal dari server (state saat ini)
      es.addEventListener("init", (e) => {
        try {
          onMessageRef.current?.(JSON.parse(e.data), "init");
        } catch {}
      });

      // Update berkala
      es.addEventListener("update", (e) => {
        try {
          onMessageRef.current?.(JSON.parse(e.data), "update");
        } catch {}
      });

      // Server selesai stream (job complete, preprocessing done)
      es.addEventListener("complete", (e) => {
        try {
          onMessageRef.current?.(JSON.parse(e.data), "complete");
          onCloseRef.current?.();
        } catch {}
        // Tidak reconnect — server memang menutup stream
        es.close();
      });

      // Error dari server (bukan disconnect)
      es.addEventListener("error_event", (e) => {
        try {
          onMessageRef.current?.(JSON.parse(e.data), "error_event");
          onCloseRef.current?.();
        } catch {}
        es.close();
      });

      // Ping keepalive — abaikan
      es.addEventListener("ping", () => {});

      // Network error / disconnect → reconnect
      es.onerror = () => {
        es.close();
        onErrorRef.current?.();
        if (!isClosedManually.current) {
          reconnectTimerRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isClosedManually.current = true;
      clearTimeout(reconnectTimerRef.current);
      esRef.current?.close();
    };
  }, [path, enabled]);
}
