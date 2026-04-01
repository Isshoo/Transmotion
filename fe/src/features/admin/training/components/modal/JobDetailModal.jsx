"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import useTrainingStore from "../../store";

const STATUS_CONFIG = {
  queued: { label: "Menunggu", cls: "bg-gray-100 text-gray-600", icon: Clock },
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

function StatusBadge({ status }) {
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

function MetricCard({ label, value, suffix = "" }) {
  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-800">
        {value !== null ? `${(value * 100).toFixed(2)}${suffix}` : "—"}
      </p>
    </div>
  );
}

function EpochChart({ logs }) {
  if (!logs || logs.length === 0) return null;

  const maxVal = 1;
  const chartH = 80;
  const chartW = 280;
  const padLeft = 24;
  const padBottom = 20;
  const innerW = chartW - padLeft;
  const innerH = chartH - padBottom;

  const toX = (i) => padLeft + (i / (logs.length - 1 || 1)) * innerW;
  const toY = (v) => (v !== null ? innerH - (v / maxVal) * innerH : null);

  const pathD = (key) => {
    const points = logs
      .map((l, i) => {
        const y = toY(l[key]);
        return y !== null ? `${toX(i)},${y}` : null;
      })
      .filter(Boolean);
    if (points.length < 2) return null;
    return "M " + points.join(" L ");
  };

  const accPath = pathD("val_accuracy");
  const lossPath = pathD("val_loss");

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Training Progress
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line
                x1={padLeft}
                y1={y}
                x2={chartW}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padLeft - 4}
                y={y + 4}
                fontSize="8"
                fill="#9ca3af"
                textAnchor="end"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Epoch labels */}
        {logs.map((l, i) => (
          <text
            key={i}
            x={toX(i)}
            y={chartH - 4}
            fontSize="8"
            fill="#9ca3af"
            textAnchor="middle"
          >
            {l.epoch}
          </text>
        ))}

        {/* Lines */}
        {accPath && (
          <path
            d={accPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {lossPath && (
          <path
            d={lossPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots — last point */}
        {logs.slice(-1).map((l, i) => {
          const accY = toY(l.val_accuracy);
          const lossY = toY(l.val_loss);
          return (
            <g key={i}>
              {accY !== null && (
                <circle
                  cx={toX(logs.length - 1)}
                  cy={accY}
                  r="3"
                  fill="#3b82f6"
                />
              )}
              {lossY !== null && (
                <circle
                  cx={toX(logs.length - 1)}
                  cy={lossY}
                  r="3"
                  fill="#f59e0b"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-1 flex gap-4">
        {[
          ["#3b82f6", "Val Accuracy"],
          ["#f59e0b", "Val Loss"],
        ].map(([color, label]) => (
          <span
            key={label}
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <span
              className="inline-block h-2 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobDetailModal() {
  const {
    isDetailModalOpen,
    currentJob,
    closeDetailModal,
    refreshJob,
    openCancelModal,
  } = useTrainingStore();

  const pollingRef = useRef(null);

  useEffect(() => {
    clearInterval(pollingRef.current);
    if (currentJob && ["queued", "running"].includes(currentJob.status)) {
      pollingRef.current = setInterval(() => {
        refreshJob(currentJob.id);
      }, 300000);
    }
    return () => clearInterval(pollingRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJob?.status, currentJob?.id]);

  if (!isDetailModalOpen || !currentJob) return null;

  const job = currentJob;
  const hp = job.hyperparams || {};
  const split = job.split_info || {};

  const formatDuration = (secs) => {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              {job.display_name}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">{job.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <button
              onClick={closeDetailModal}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Progress bar — running */}
          {job.status === "running" && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>
                  Epoch {job.current_epoch} / {job.total_epochs}
                </span>
                <span>{job.progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-2.5 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {job.status === "failed" && job.error_message && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  Training gagal
                </p>
                <p className="mt-0.5 text-xs text-red-600">
                  {job.error_message}
                </p>
              </div>
            </div>
          )}

          {/* Final metrics */}
          {job.status === "completed" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard
                label="Accuracy"
                value={job.final_accuracy}
                suffix="%"
              />
              <MetricCard label="F1 Score" value={job.final_f1} suffix="%" />
              <MetricCard
                label="Precision"
                value={job.final_precision}
                suffix="%"
              />
              <MetricCard label="Recall" value={job.final_recall} suffix="%" />
            </div>
          )}

          {/* Epoch chart */}
          {job.epoch_logs?.length > 0 && <EpochChart logs={job.epoch_logs} />}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Dataset", job.dataset_name ?? "—"],
              ["Model", job.model_type?.toUpperCase()],
              ["Durasi", formatDuration(job.duration_seconds)],
              ["Train", split.train_total?.toLocaleString("id") ?? "—"],
              ["Test", split.test_total?.toLocaleString("id") ?? "—"],
              ["Jumlah Kelas", split.num_labels ?? "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <p className="text-xs text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-700">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Hyperparameters */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Hyperparameter
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                ["Epochs", hp.epochs],
                ["Batch", hp.batch_size],
                ["LR", hp.learning_rate],
                ["Max Len", hp.max_length],
                ["Warmup", hp.warmup_steps],
                ["Decay", hp.weight_decay],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 px-2 py-2 text-center"
                >
                  <p className="text-[10px] text-gray-400">{label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Epoch log table */}
          {job.epoch_logs?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Log Per Epoch
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {[
                        "Epoch",
                        "Train Loss",
                        "Val Loss",
                        "Val Acc",
                        "Val F1",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-semibold text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {job.epoch_logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">
                          {log.epoch}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {log.train_loss?.toFixed(4) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {log.val_loss?.toFixed(4) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {log.val_accuracy !== null
                            ? `${(log.val_accuracy * 100).toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {log.val_f1 !== null
                            ? `${(log.val_f1 * 100).toFixed(2)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-between border-t px-6 py-4">
          <div className="text-xs text-gray-400">
            Dibuat:{" "}
            {job.created_at
              ? new Date(job.created_at).toLocaleString("id-ID")
              : "—"}
          </div>
          <div className="flex gap-2">
            {["queued", "running"].includes(job.status) && (
              <button
                onClick={() => {
                  closeDetailModal();
                  openCancelModal(job);
                }}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Batalkan Job
              </button>
            )}
            <button
              onClick={closeDetailModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
