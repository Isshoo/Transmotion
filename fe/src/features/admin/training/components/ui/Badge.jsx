"use client";

import { Loader2, CheckCircle, XCircle, Clock, Ban } from "lucide-react";

export function StatusBadge({ status }) {
  const STATUS_CONFIG = {
    queued: {
      label: "Queued",
      cls: "bg-(--bg-elevated) text-(--text-secondary) border border-(--border-strong)",
      dot: "bg-(--text-tertiary)",
      icon: Clock,
    },
    running: {
      label: "Running",
      cls: "bg-(--accent-muted)/20 text-(--accent) border border-(--accent-muted)/50",
      dot: "bg-(--accent)",
      icon: Loader2,
    },
    completed: {
      label: "Completed",
      cls: "bg-(--success-muted)/20 text-(--success) border border-(--success-muted)/50",
      dot: "bg-(--success)",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      cls: "bg-(--error-muted)/20 text-(--error) border border-(--error-muted)/50",
      dot: "bg-(--error)",
      icon: XCircle,
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-(--bg-overlay) text-(--text-tertiary) border border-(--border-subtle)",
      dot: "bg-(--text-disabled)",
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${cls}`}
    >
      <Icon size={12} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

export function DetailStatusBadge({ status }) {
  const STATUS_CONFIG = {
    queued: {
      label: "Queued",
      cls: "bg-(--bg-elevated) text-(--text-secondary) border border-(--border-strong)",
      icon: Clock,
    },
    running: {
      label: "Running",
      cls: "bg-(--accent-muted)/20 text-(--accent) border border-(--accent-muted)/50 shadow-(--shadow-sm)",
      icon: Loader2,
    },
    completed: {
      label: "Completed",
      cls: "bg-(--success-muted)/20 text-(--success) border border-(--success-muted)/50 shadow-(--shadow-sm)",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      cls: "bg-(--error-muted)/20 text-(--error) border border-(--error-muted)/50 shadow-(--shadow-sm)",
      icon: XCircle,
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-(--bg-overlay) text-(--text-tertiary) border border-(--border-subtle)",
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
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase ${cls}`}
    >
      <Icon size={14} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

const TRAINING_STATUS_CONFIG = {
  queued: {
    label: "Waiting for Colab",
    cls: "bg-(--bg-elevated) text-(--text-secondary) border border-(--border-strong)",
    icon: Clock,
  },
  running: {
    label: "Training",
    cls: "bg-(--accent-muted)/20 text-(--accent) border border-(--accent-muted)/50",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    cls: "bg-(--success-muted)/20 text-(--success) border border-(--success-muted)/50",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    cls: "bg-(--error-muted)/20 text-(--error) border border-(--error-muted)/50",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-(--bg-overlay) text-(--text-tertiary) border border-(--border-subtle)",
    icon: Ban,
  },
};

export function TrainingStatusBadge({ status }) {
  const {
    label,
    cls,
    icon: Icon,
  } = TRAINING_STATUS_CONFIG[status] ?? TRAINING_STATUS_CONFIG.queued;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide ${cls}`}
    >
      <Icon size={14} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}
