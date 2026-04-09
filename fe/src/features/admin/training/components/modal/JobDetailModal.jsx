"use client";

import { X, AlertCircle } from "lucide-react";
import useTrainingStore from "../../store";
import { useSSE } from "@/hooks/useSSE";
import { toast } from "sonner";
import { DetailStatusBadge } from "../ui/Badge";
import { MetricCard } from "../ui/Card";
import { EpochChart } from "../ui/Chart";

export default function JobDetailModal() {
  const { isDetailModalOpen, currentJob, closeDetailModal, openCancelModal } =
    useTrainingStore();

  // ── SSE: replace polling job detail ───────────────────────────────────────
  const isActive =
    currentJob && ["queued", "running"].includes(currentJob.status);

  useSSE(isActive ? `/api/sse/training-jobs/${currentJob?.id}` : null, {
    enabled: isDetailModalOpen && isActive,
    onMessage: (data, eventType) => {
      if (eventType === "update" || eventType === "init") {
        useTrainingStore.setState({ currentJob: data });
        // Update juga di list
        useTrainingStore.setState((state) => ({
          jobs: state.jobs.map((j) => (j.id === data.id ? data : j)),
        }));
      }
      if (eventType === "complete") {
        useTrainingStore.setState({ currentJob: data });
        useTrainingStore.setState((state) => ({
          jobs: state.jobs.map((j) => (j.id === data.id ? data : j)),
        }));
        toast.success("Training selesai!");
      }
      if (eventType === "error_event") {
        useTrainingStore.setState({ currentJob: data });
        toast.error("Training gagal: " + (data?.error_message ?? ""));
      }
    },
  });
  // ── end SSE ────────────────────────────────────────────────────────────────

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
            <DetailStatusBadge status={job.status} />
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
