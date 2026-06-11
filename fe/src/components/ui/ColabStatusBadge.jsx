"use client";

import { useState, useRef } from "react";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

export default function ColabStatusBadge() {
  const [status, setStatus] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimer = useRef(null);

  useSSE("/api/sse/colab-status", {
    onMessage: (data, eventType) => {
      if (
        eventType === "init" ||
        eventType === "update" ||
        eventType === "ping"
      ) {
        setStatus(data);
        setIsReconnecting(false);
        clearTimeout(reconnectTimer.current);
      }
    },
    onError: () => {
      // SSE putus — tampilkan reconnecting, jangan langsung "offline"
      // karena bisa jadi Colab masih online, hanya koneksi SSE yang putus
      setIsReconnecting(true);

      // Jika 30s tidak ada update, baru anggap perlu perhatian
      reconnectTimer.current = setTimeout(() => {
        setIsReconnecting(false);
        // Status terakhir yang diketahui tetap ditampilkan
        // tidak di-reset ke offline
      }, 30000);
    },
  });

  // Belum ada data sama sekali
  if (!status && !isReconnecting) {
    return (
      <span className="inline-flex w-full items-center gap-1.5 rounded-md bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-disabled)">
        <Loader2 size={11} className="animate-spin" />
        Colab
      </span>
    );
  }

  // Sedang reconnect SSE — tampilkan status terakhir dengan indikator
  if (isReconnecting) {
    return (
      <span
        className="inline-flex w-full items-center gap-1.5 rounded-md bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-tertiary)"
        title="Reconnecting status connection..."
      >
        <Loader2 size={11} className="animate-spin" />
        {status?.status === "online" ? "Colab Online" : "Colab..."}
      </span>
    );
  }

  const s = status.status; // "online" | "degraded" | "offline"
  const secondsAgo = status.last_ping_seconds_ago;

  if (s === "online") {
    return (
      <span
        className="inline-flex w-full cursor-default items-center gap-1.5 rounded-md bg-(--success-muted) px-2.5 py-1.5 text-xs font-medium text-(--success)"
        title={`Colab Online — ping ${secondsAgo}s ago`}
      >
        <Wifi size={11} />
        Colab Online
      </span>
    );
  }

  if (s === "degraded") {
    return (
      <span
        className="inline-flex w-full cursor-default items-center gap-1.5 rounded-md bg-(--warning-muted) px-2.5 py-1.5 text-xs font-medium text-(--warning)"
        title={`Unstable connection — last ping ${secondsAgo}s ago`}
      >
        <AlertTriangle size={11} />
        Colab Slow
      </span>
    );
  }

  return (
    <span
      className="inline-flex w-full cursor-default items-center gap-1.5 rounded-md bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)"
      title={
        secondsAgo
          ? `Colab Offline — last ping ${secondsAgo}s ago`
          : "Colab Offline"
      }
    >
      <WifiOff size={11} />
      Colab Offline
    </span>
  );
}
