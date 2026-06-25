import { Ban, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import useTrainingStore from "../../store";
import EvaluationResults from "../EvaluationResults";

export default function ResultView() {
  const { activeJob, resetToForm } = useTrainingStore();

  if (!activeJob) return null;

  const job = activeJob;
  const isSuccess = job.status === "completed";
  const isFailed = job.status === "failed";
  const isCancelled = job.status === "cancelled";

  const formatDur = (secs) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header result */}
      <div
        className={`animate-fade-in rounded-xl border p-5 shadow-(--shadow-sm) ${
          isSuccess
            ? "border-(--success)/30 bg-(--success-muted)/30"
            : isFailed
              ? "border-(--error)/30 bg-(--error-muted)/30"
              : "border-(--border-default) bg-(--bg-elevated)"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              {isSuccess && (
                <CheckCircle size={20} className="text-(--success)" />
              )}
              {isFailed && <XCircle size={20} className="text-(--error)" />}
              {isCancelled && (
                <Ban size={20} className="text-(--text-tertiary)" />
              )}
              <p
                className={`text-lg font-semibold tracking-tight ${
                  isSuccess
                    ? "text-(--success)"
                    : isFailed
                      ? "text-(--error)"
                      : "text-(--text-primary)"
                }`}
              >
                {isSuccess
                  ? "Training Complete!"
                  : isFailed
                    ? "Training Failed"
                    : "Training Cancelled"}
              </p>
            </div>
            <p
              className={`text-sm font-medium ${
                isSuccess
                  ? "text-(--success) opacity-80"
                  : isFailed
                    ? "text-(--error) opacity-80"
                    : "text-(--text-secondary)"
              }`}
            >
              {job.display_name}
            </p>
            <div
              className={`mt-2 flex flex-wrap gap-4 text-xs font-medium tracking-wide uppercase ${
                isSuccess
                  ? "text-(--success) opacity-70"
                  : isFailed
                    ? "text-(--error) opacity-70"
                    : "text-(--text-tertiary)"
              }`}
            >
              {job.dataset_name && (
                <span className="flex items-center gap-1.5">
                  Dataset{" "}
                  <strong className="text-(--text-primary)">
                    {job.dataset_name}
                    {job.split_info &&
                      " (" +
                        ((1 - job.split_info.test_size) * 100).toFixed(0) +
                        ":" +
                        (job.split_info.test_size * 100).toFixed(0) +
                        ")"}
                  </strong>
                </span>
              )}
              {job.model_type && (
                <span className="flex items-center gap-1.5">
                  Model{" "}
                  <strong className="text-(--text-primary)">
                    {job.model_type.toUpperCase()}
                  </strong>
                </span>
              )}
              {job.duration_seconds && (
                <span className="flex items-center gap-1.5">
                  Duration{" "}
                  <strong className="text-(--text-primary)">
                    {formatDur(job.duration_seconds)}
                  </strong>
                </span>
              )}
            </div>

            {isFailed && job.error_message && (
              <div className="mt-3 rounded-md border border-(--error)/20 bg-(--error-muted)/50 px-4 py-3">
                <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-(--error)">
                  {job.error_message}
                </p>
              </div>
            )}
          </div>

          {/* New train button */}
          <button
            onClick={resetToForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-semibold tracking-wide text-(--bg-base) transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
          >
            <RotateCcw size={16} />
            New Training
          </button>
        </div>
      </div>

      {/* Evaluation results — only if completed */}
      {isSuccess && <EvaluationResults job={job} />}

      {/* Partial Epoch Logs */}
      {!isSuccess && job.epoch_logs?.length > 0 && (
        <div className="animate-fade-in rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Partial Epoch Logs
          </p>
          <div className="overflow-x-auto rounded-lg border border-(--border-subtle)">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-(--border-subtle) bg-(--bg-elevated)">
                  {[
                    "Epoch",
                    "Loss",
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
                    className="transition-colors hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-3 font-semibold text-(--text-primary)">
                      {log.epoch}
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
              {(() => {
                const calcAvg = (key) => {
                  const valid = job.epoch_logs.filter(
                    (log) => log[key] != null
                  );
                  if (valid.length === 0) return null;
                  return (
                    valid.reduce((acc, log) => acc + log[key], 0) / valid.length
                  );
                };
                const avgAcc = calcAvg("val_accuracy");
                const avgPre = calcAvg("val_precision");
                const avgRec = calcAvg("val_recall");
                const avgF1 = calcAvg("val_f1");
                return (
                  <tfoot className="border-t border-(--border-subtle) bg-(--accent-muted)/10">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-(--text-primary)">
                        Average
                      </td>
                      <td className="px-4 py-3 font-mono text-(--text-secondary)">
                        —
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-(--text-primary)">
                        {avgAcc !== null
                          ? `${(avgAcc * 100).toFixed(2)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-(--text-primary)">
                        {avgPre !== null
                          ? `${(avgPre * 100).toFixed(2)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-(--text-primary)">
                        {avgRec !== null
                          ? `${(avgRec * 100).toFixed(2)}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-(--text-primary)">
                        {avgF1 !== null ? `${(avgF1 * 100).toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
