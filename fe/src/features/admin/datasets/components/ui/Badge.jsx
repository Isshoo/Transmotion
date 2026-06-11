// ── Badge helpers ──────────────────────────────────────────────

import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";

export function PreprocessStatusBadge({ status }) {
  const map = {
    idle: {
      label: "Belum diproses",
      cls: "bg-(--bg-elevated) text-(--text-tertiary)",
      icon: Clock,
    },
    running: {
      label: "Sedang memproses",
      cls: "bg-(--warning-muted) text-(--warning)",
      icon: Loader2,
    },
    completed: {
      label: "Selesai",
      cls: "bg-(--success-muted) text-(--success)",
      icon: CheckCircle,
    },
    error: {
      label: "Gagal",
      cls: "bg-(--error-muted) text-(--error)",
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
    idle: "bg-(--bg-elevated) text-(--text-tertiary)",
    running: "bg-(--warning-muted) text-(--warning)",
    completed: "bg-(--success-muted) text-(--success)",
    error: "bg-(--error-muted) text-(--error)",
  };
  const PREPROCESS_LABEL = {
    idle: "Belum diproses",
    running: "Memproses...",
    completed: "Siap training",
    error: "Error",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PREPROCESS_STYLE[status] ?? "bg-(--bg-elevated) text-(--text-tertiary)"}`}
    >
      {PREPROCESS_LABEL[status] ?? status}
    </span>
  );
}
