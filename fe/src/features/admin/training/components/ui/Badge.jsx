import { Clock, Loader2, CheckCircle, XCircle, Ban } from "lucide-react";

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
