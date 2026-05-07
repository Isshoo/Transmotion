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
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
        <Loader2 size={11} className="animate-spin" />
        Colab
      </span>
    );
  }

  // Sedang reconnect SSE — tampilkan status terakhir dengan indikator
  if (isReconnecting) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500"
        title="Menyambungkan ulang koneksi status..."
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
        className="inline-flex cursor-default items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
        title={`Colab Online — ping ${secondsAgo}s lalu`}
      >
        <Wifi size={11} />
        Colab Online
      </span>
    );
  }

  if (s === "degraded") {
    return (
      <span
        className="inline-flex cursor-default items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
        title={`Koneksi tidak stabil — ping terakhir ${secondsAgo}s lalu`}
      >
        <AlertTriangle size={11} />
        Colab Lambat
      </span>
    );
  }

  return (
    <span
      className="inline-flex cursor-default items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500"
      title={
        secondsAgo
          ? `Colab Offline — ping terakhir ${secondsAgo}s lalu`
          : "Colab Offline"
      }
    >
      <WifiOff size={11} />
      Colab Offline
    </span>
  );
}
