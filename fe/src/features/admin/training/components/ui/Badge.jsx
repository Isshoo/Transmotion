"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import { Wifi, WifiOff } from "lucide-react";
import { useSSE } from "@/hooks/useSSE";

export function ColabStatusBadge() {
  const [status, setStatus] = useState(null);

  useSSE("/api/sse/colab-status", {
    onMessage: (data, eventType) => {
      if (
        eventType === "init" ||
        eventType === "update" ||
        eventType === "ping"
      ) {
        setStatus(data);
      }
    },
  });

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
        <Loader2 size={11} className="animate-spin" />
        Colab
      </span>
    );
  }

  if (status.online) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        <Wifi size={11} />
        Colab Online
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
      <WifiOff size={11} />
      Colab Offline
    </span>
  );
}

export function StatusBadge({ status }) {
  const STATUS_CONFIG = {
    queued: {
      label: "Menunggu",
      cls: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
      icon: Clock,
    },
    running: {
      label: "Berjalan",
      cls: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
      icon: Loader2,
    },
    completed: {
      label: "Selesai",
      cls: "bg-green-100 text-green-700",
      dot: "bg-green-500",
      icon: CheckCircle,
    },
    failed: {
      label: "Gagal",
      cls: "bg-red-100 text-red-600",
      dot: "bg-red-500",
      icon: XCircle,
    },
    cancelled: {
      label: "Dibatalkan",
      cls: "bg-gray-100 text-gray-400",
      dot: "bg-gray-300",
      icon: Ban,
    },
  };

  const {
    label,
    cls,
    icon: Icon,
  } = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      <Icon size={11} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

export function DetailStatusBadge({ status }) {
  const STATUS_CONFIG = {
    queued: {
      label: "Menunggu",
      cls: "bg-gray-100 text-gray-600",
      icon: Clock,
    },
    running: {
      label: "Berjalan",
      cls: "bg-blue-100 text-blue-700",
      icon: Loader2,
    },
    completed: {
      label: "Selesai",
      cls: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    failed: { label: "Gagal", cls: "bg-red-100 text-red-600", icon: XCircle },
    cancelled: {
      label: "Dibatalkan",
      cls: "bg-gray-100 text-gray-500",
      icon: Ban,
    },
  };
  const {
    label,
    cls,
    icon: Icon,
  } = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cls}`}
    >
      <Icon size={12} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}
