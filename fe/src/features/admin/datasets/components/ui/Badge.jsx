// ── Badge helpers ──────────────────────────────────────────────

import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";

export function PreprocessStatusBadge({ status }) {
  const map = {
    idle: {
      label: "Belum diproses",
      cls: "bg-gray-100 text-gray-600",
      icon: Clock,
    },
    running: {
      label: "Sedang memproses",
      cls: "bg-yellow-100 text-yellow-700",
      icon: Loader2,
    },
    completed: {
      label: "Selesai",
      cls: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    error: {
      label: "Gagal",
      cls: "bg-red-100 text-red-600",
      icon: AlertCircle,
    },
  };
  const { label, cls, icon: Icon } = map[status] ?? map.idle;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      <Icon size={12} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

export function PreprocessBadge({ status }) {
  const PREPROCESS_STYLE = {
    idle: "bg-gray-100 text-gray-500",
    running: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    error: "bg-red-100 text-red-600",
  };
  const PREPROCESS_LABEL = {
    idle: "Belum diproses",
    running: "Memproses...",
    completed: "Siap training",
    error: "Error",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PREPROCESS_STYLE[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {PREPROCESS_LABEL[status] ?? status}
    </span>
  );
}
