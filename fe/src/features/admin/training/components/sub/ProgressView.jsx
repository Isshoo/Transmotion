import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useTrainingStore from "../../store";

export default function ProgressView() {
  const { activeJob, isSubmitting, cancelJob } = useTrainingStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!activeJob) return null;

  const job = activeJob;
  const pct = job.progress || 0;

  const handleCancel = async () => {
    const result = await cancelJob();
    if (result.success) {
      toast.success(result.message);
      setShowCancelConfirm(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Status utama */}
      <div className="relative overflow-hidden rounded-xl border border-(--accent-muted) bg-(--accent-muted)/20 p-6">
        {/* Glow effect background */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />

        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-(--accent)" />
              <p className="text-base font-semibold tracking-tight text-(--text-primary)">
                Training Berjalan...
              </p>
            </div>
            <p className="text-sm font-medium text-(--accent) opacity-90">
              {job.display_name}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-xl font-bold tracking-tight text-(--accent)">
              {pct !== 100 ? pct + "%" : "Evaluating on Test Set..."}
            </p>
            <p className="text-xs font-medium tracking-wider text-(--accent) uppercase opacity-70">
              Epoch {job.current_epoch} / {job.total_epochs}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mb-5 h-2 w-full overflow-hidden rounded-full bg-(--border-strong)">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-(--accent) shadow-(--shadow-accent) transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Info dataset & model */}
        <div className="relative flex flex-wrap gap-4 text-[11px] font-medium tracking-wide text-(--text-secondary)">
          <span className="flex items-center gap-1.5">
            <span className="text-(--text-tertiary)">Dataset</span>
            <strong className="text-(--text-primary)">
              {job.dataset_name}
            </strong>
          </span>
          <span className="text-(--border-strong)">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-(--text-tertiary)">Model</span>
            <strong className="text-(--text-primary)">
              {job.model_type?.toUpperCase()}
            </strong>
          </span>
          {job.split_info && (
            <>
              <span className="text-(--border-strong)">|</span>
              <span className="flex items-center gap-2">
                <span className="text-(--accent)">
                  Train{" "}
                  <strong className="text-(--text-primary)">
                    {job.split_info.train_total?.toLocaleString("id")}
                  </strong>
                </span>
                <span className="text-(--data-2)">
                  Val{" "}
                  <strong className="text-(--text-primary)">
                    {job.split_info.val_total?.toLocaleString("id")}
                  </strong>
                </span>
                <span className="text-(--warning)">
                  Test{" "}
                  <strong className="text-(--text-primary)">
                    {job.split_info.test_total?.toLocaleString("id")}
                  </strong>
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Live metrics dari epoch terbaru */}
      {job.epoch_logs?.length > 0 &&
        (() => {
          const last = job.epoch_logs[job.epoch_logs.length - 1];
          return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Train Loss", last.train_loss?.toFixed(4)],
                ["Val Loss", last.val_loss?.toFixed(4)],
                [
                  "Accuracy",
                  last.val_accuracy !== null
                    ? `${(last.val_accuracy * 100).toFixed(2)}%`
                    : null,
                ],
                [
                  "F1-Score",
                  last.val_f1 !== null
                    ? `${(last.val_f1 * 100).toFixed(2)}%`
                    : null,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-4 py-3 text-center shadow-(--shadow-sm)"
                >
                  <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-(--text-primary)">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

      {/* Log per epoch */}
      {job.epoch_logs?.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
          <div className="border-b border-(--border-default) bg-(--bg-elevated) px-5 py-3">
            <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Log Per Epoch
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-(--border-default) bg-(--bg-surface)">
                  {[
                    "Epoch",
                    "Train Loss",
                    "Val Loss",
                    "Accuracy",
                    "Precision",
                    "Recall",
                    "F1-Score",
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
              <tbody className="divide-y divide-(--border-subtle)">
                {job.epoch_logs.map((log, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      i === job.epoch_logs.length - 1
                        ? "bg-(--accent-muted)/20"
                        : "hover:bg-(--bg-overlay)"
                    }`}
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
                      {log.val_precision !== null
                        ? `${(log.val_precision * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_recall !== null
                        ? `${(log.val_recall * 100).toFixed(2)}%`
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
      )}

      {/* Hyperparameter */}
      {job.hyperparams && (
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-4 shadow-(--shadow-sm)">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Konfigurasi Training
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ["LR", job.hyperparams.learning_rate],
              ["Epochs", job.hyperparams.epochs],
              ["Batch", job.hyperparams.batch_size],
              ["MaxLen", job.hyperparams.max_length],
              ["Dropout", job.hyperparams.dropout],
              ["Optimizer", job.hyperparams.optimizer],
              ["Warmup", job.hyperparams.warmup_steps],
              ["Decay", job.hyperparams.weight_decay],
            ].map(([l, v]) => (
              <span
                key={l}
                className="flex items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-2.5 py-1 text-[11px] text-(--text-tertiary)"
              >
                {l}{" "}
                <span className="font-semibold text-(--text-primary)">{v}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tombol batal */}
      {!showCancelConfirm ? (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-(--error)/30 px-4 py-2 text-sm font-medium text-(--error) transition-all duration-150 hover:bg-(--error-muted)"
          >
            <Ban size={15} /> Batalkan Training
          </button>
        </div>
      ) : (
        <div className="animate-scale-in rounded-xl border border-(--error)/30 bg-(--error-muted)/50 p-4">
          <p className="mb-3 text-sm font-medium text-(--error)">
            Yakin ingin membatalkan training?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-lg bg-(--error) px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#dc2626] disabled:opacity-50"
            >
              {isSubmitting ? "Membatalkan..." : "Ya, Batalkan"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="rounded-lg border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              Tidak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
