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
        toast.success("Training complete!");
      }
      if (eventType === "error_event") {
        useTrainingStore.setState((state) => ({
          currentJob: data,
          jobs: state.jobs.map((j) => (j.id === data.id ? data : j)),
        }));
        toast.error("Training failed: " + (data?.error_message ?? ""));
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
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
              {job.display_name}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-(--text-tertiary)">
              ID: {job.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DetailStatusBadge status={job.status} />
            <button
              onClick={closeDetailModal}
              className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Progress bar — running */}
          {job.status === "running" && (
            <div className="rounded-lg border border-(--accent-muted)/50 bg-(--accent-muted)/10 p-4">
              <div className="mb-2 flex justify-between text-xs font-semibold tracking-wide text-(--accent) uppercase opacity-80">
                <span>
                  Epoch {job.current_epoch} / {job.total_epochs}
                </span>
                <span>{job.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-(--border-strong)">
                <div
                  className="h-2 rounded-full bg-(--accent) shadow-(--shadow-accent) transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {job.status === "failed" && job.error_message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-(--error)/20 bg-(--error-muted)/50 px-4 py-3">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-(--error)"
              />
              <div>
                <p className="text-sm font-semibold text-(--error)">
                  Training failed
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-(--error) opacity-80">
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
                color="text-(--accent)"
              />
              <MetricCard
                label="F1 Score"
                value={job.final_f1}
                suffix="%"
                color="text-(--success)"
              />
              <MetricCard
                label="Precision"
                value={job.final_precision}
                suffix="%"
                color="text-(--data-2)"
              />
              <MetricCard
                label="Recall"
                value={job.final_recall}
                suffix="%"
                color="text-(--warning)"
              />
            </div>
          )}

          {/* Epoch chart */}
          {job.epoch_logs?.length > 0 && (
            <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-sm)">
              <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Learning Curve
              </p>
              <EpochChart logs={job.epoch_logs} />
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Dataset", job.dataset_name ?? "—"],
              ["Model", job.model_type?.toUpperCase()],
              ["Duration", formatDuration(job.duration_seconds)],
              ["Train", split.train_total?.toLocaleString("id") ?? "—"],
              ["Test", split.test_total?.toLocaleString("id") ?? "—"],
              ["Num Classes", split.num_labels ?? "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-3 py-2.5"
              >
                <p className="text-[10px] font-medium tracking-wide text-(--text-tertiary) uppercase">
                  {label}
                </p>
                <p className="mt-1 text-xs font-semibold text-(--text-primary)">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Hyperparameters */}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-sm)">
            <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Hyperparameter
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
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
                  className="rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-2 py-2 text-center"
                >
                  <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-(--text-primary)">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Epoch log table */}
          {job.epoch_logs?.length > 0 && (
            <div>
              <p className="mb-2.5 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Per-Epoch Logs
              </p>
              <div className="overflow-hidden rounded-lg border border-(--border-default)">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                        {[
                          "Epoch",
                          "Train Loss",
                          "Val Loss",
                          "Val Acc",
                          "Val F1",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold whitespace-nowrap text-(--text-secondary)"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-subtle) bg-(--bg-surface)">
                      {job.epoch_logs.map((log, i) => (
                        <tr
                          key={i}
                          className="transition-colors hover:bg-(--bg-overlay)"
                        >
                          <td className="px-4 py-3 font-semibold text-(--text-primary)">
                            {log.epoch}
                          </td>
                          <td className="px-4 py-3 font-mono text-(--text-secondary)">
                            {log.train_loss?.toFixed(4) ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-(--text-secondary)">
                            {log.val_loss?.toFixed(4) ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-(--text-secondary)">
                            {log.val_accuracy !== null
                              ? `${(log.val_accuracy * 100).toFixed(2)}%`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-(--text-secondary)">
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between rounded-b-xl border-t border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <div className="text-[10px] font-medium tracking-wide text-(--text-tertiary) uppercase">
            Created:{" "}
            {job.created_at
              ? new Date(job.created_at).toLocaleString("id-ID")
              : "—"}
          </div>
          <div className="flex gap-2.5">
            {["queued", "running"].includes(job.status) && (
              <button
                onClick={() => {
                  closeDetailModal();
                  openCancelModal(job);
                }}
                className="rounded-md border border-(--error)/30 px-4 py-2 text-sm font-medium text-(--error) transition-all duration-150 hover:bg-(--error-muted)"
              >
                Cancel Job
              </button>
            )}
            <button
              onClick={closeDetailModal}
              className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
