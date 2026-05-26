import { TrainingStatusBadge } from "./Badge";

export function ProgressSection({ job }) {
  const pct = job.progress || 0;
  return (
    <div className="animate-scale-in space-y-5 rounded-xl border border-(--accent-muted)/50 bg-(--accent-muted)/10 p-5 shadow-(--shadow-sm)">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold tracking-tight text-(--accent)">
            {job.display_name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium tracking-wide text-(--accent) uppercase opacity-80">
            <span>{job.model_type?.toUpperCase()}</span>
            <span>•</span>
            <span className="max-w-[200px] truncate">
              DS: {job.dataset_name}
            </span>
          </div>
        </div>
        <TrainingStatusBadge status={job.status} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-2 flex justify-between text-xs font-semibold tracking-wide text-(--accent) uppercase">
          <span>
            Epoch {job.current_epoch} / {job.total_epochs}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--border-strong)">
          <div
            className="h-2.5 rounded-full bg-(--accent) shadow-(--shadow-accent) transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
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
                  "Val Accuracy",
                  last.val_accuracy !== null
                    ? `${(last.val_accuracy * 100).toFixed(2)}%`
                    : null,
                ],
                [
                  "Val F1",
                  last.val_f1 !== null
                    ? `${(last.val_f1 * 100).toFixed(2)}%`
                    : null,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2.5 text-center shadow-(--shadow-sm)"
                >
                  <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-(--text-primary)">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

      {/* Log per epoch — tabel mini */}
      {job.epoch_logs?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
                {["Epoch", "Train Loss", "Val Loss", "Val Acc", "Val F1"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {job.epoch_logs.map((log, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-(--bg-overlay)"
                >
                  <td className="px-4 py-2 font-semibold text-(--text-primary)">
                    {log.epoch}
                  </td>
                  <td className="px-4 py-2 font-mono text-(--text-secondary)">
                    {log.train_loss?.toFixed(4) ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-(--text-secondary)">
                    {log.val_loss?.toFixed(4) ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-(--text-secondary)">
                    {log.val_accuracy !== null
                      ? `${(log.val_accuracy * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 font-mono text-(--text-secondary)">
                    {log.val_f1 !== null
                      ? `${(log.val_f1 * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info hyperparameter */}
      {job.hyperparams && (
        <div className="flex flex-wrap gap-2.5">
          {[
            ["Epochs", job.hyperparams.epochs],
            ["Batch", job.hyperparams.batch_size],
            ["LR", job.hyperparams.learning_rate],
            ["MaxLen", job.hyperparams.max_length],
          ].map(([l, v]) => (
            <span
              key={l}
              className="rounded-md border border-(--accent-muted) bg-(--accent-muted)/20 px-2.5 py-1 text-[10px] tracking-wide text-(--accent) uppercase"
            >
              {l}: <span className="font-bold">{v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
