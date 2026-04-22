import { TrainingStatusBadge } from "./Badge";

export function ProgressSection({ job }) {
  const pct = job.progress || 0;
  return (
    <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-800">
            {job.display_name}
          </p>
          <p className="mt-0.5 text-xs text-blue-600">
            {job.model_type?.toUpperCase()} · Dataset: {job.dataset_name}
          </p>
        </div>
        <TrainingStatusBadge status={job.status} />
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-blue-700">
          <span>
            Epoch {job.current_epoch} / {job.total_epochs}
          </span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-blue-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-500"
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
                  className="rounded-lg bg-white px-3 py-2 text-center"
                >
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

      {/* Log per epoch — tabel mini */}
      {job.epoch_logs?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-blue-200 bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Epoch", "Train Loss", "Val Loss", "Val Acc", "Val F1"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {job.epoch_logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-1.5 font-medium text-gray-700">
                    {log.epoch}
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">
                    {log.train_loss?.toFixed(4) ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">
                    {log.val_loss?.toFixed(4) ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">
                    {log.val_accuracy !== null
                      ? `${(log.val_accuracy * 100).toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-gray-600">
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
        <div className="flex flex-wrap gap-2">
          {[
            ["Epochs", job.hyperparams.epochs],
            ["Batch", job.hyperparams.batch_size],
            ["LR", job.hyperparams.learning_rate],
            ["MaxLen", job.hyperparams.max_length],
          ].map(([l, v]) => (
            <span
              key={l}
              className="rounded-md bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
            >
              {l}: <span className="font-semibold">{v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
