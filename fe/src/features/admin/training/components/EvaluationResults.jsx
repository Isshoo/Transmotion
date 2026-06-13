import { useState } from "react";
import ConfusionMatrix from "./ConfusionMatrix";
import EpochLogsTable from "./EpochLogsTable";
import { MetricsCard } from "./ui/Card";
import InfoPopup from "@/components/ui/InfoPopup";
import {
  METRICS_INFO,
  PER_CLASS_INFO,
  CONFUSION_MATRIX_INFO,
  EPOCH_LOGS_INFO,
} from "@/components/ui/InfoContents";

export default function EvaluationResults({ job }) {
  const [activeSplit, setActiveSplit] = useState("test");

  if (!job) return null;

  const testLabels = job.confusion_matrix?.labels || [];
  const evalLabels = job.val_confusion_matrix?.labels || [];
  const hasEvalMetrics = job.val_accuracy != null || job.val_f1 != null;

  // Metrik aktif berdasarkan tab
  const metrics =
    activeSplit === "test"
      ? {
          accuracy: job.final_accuracy,
          f1: job.final_f1,
          precision: job.final_precision,
          recall: job.final_recall,
          mcc: job.final_mcc,
          roc_auc: job.final_roc_auc,
          mean_std: job.final_mean_std,
          perClass: job.per_class_metrics,
          macroAvg: job.macro_avg,
          weightedAvg: job.weighted_avg,
          cm: job.confusion_matrix,
          labels: testLabels,
        }
      : {
          accuracy: job.val_accuracy,
          f1: job.val_f1,
          precision: job.val_precision,
          recall: job.val_recall,
          mcc: null,
          roc_auc: null,
          mean_std: null,
          perClass: job.val_per_class_metrics,
          macroAvg: job.val_macro_avg,
          weightedAvg: job.val_weighted_avg,
          cm: job.val_confusion_matrix,
          labels: evalLabels,
        };

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Satu container dengan tab global Test/Val ─────── */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        {/* Tab switcher */}
        {hasEvalMetrics && (
          <div className="flex border-b border-(--border-default)">
            {[
              {
                key: "test",
                label: "Test Set (Final)",
                color: "text-(--warning)",
              },
              {
                key: "eval",
                label: "Val Set (Validation)",
                color: "text-(--data-2)",
              },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveSplit(key)}
                className={`border-b-2 px-5 py-3.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${
                  activeSplit === key
                    ? `border-current ${color}`
                    : "border-transparent text-(--text-tertiary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Metrik KPI Cards */}
          <div>
            <div className="mb-4 flex items-center gap-1.5">
              <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Evaluation Metrics
              </p>
              <InfoPopup title="Evaluation Metrics — Guide">
                {METRICS_INFO}
              </InfoPopup>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricsCard
                label="Accuracy"
                value={metrics.accuracy}
                color="text-(--accent)"
              />
              <MetricsCard
                label="F1 Score"
                value={metrics.f1}
                color="text-(--success)"
              />
              <MetricsCard
                label="Precision"
                value={metrics.precision}
                color="text-(--data-2)"
              />
              <MetricsCard
                label="Recall"
                value={metrics.recall}
                color="text-(--warning)"
              />
            </div>

            {/* MCC, ROC-AUC, Mean Std sebagai KPI card kecil */}
            {(metrics.mcc != null ||
              metrics.roc_auc != null ||
              metrics.mean_std != null) && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  ["MCC", metrics.mcc],
                  ["ROC-AUC", metrics.roc_auc],
                  ["Mean Std", metrics.mean_std],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-4 py-3 text-center"
                  >
                    <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-black text-(--text-primary) tabular-nums">
                      {value !== null && value !== undefined
                        ? typeof value === "number" && value <= 1
                          ? `${(value * 100).toFixed(2)}%`
                          : value
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeSplit === "eval" &&
              metrics.mcc == null &&
              metrics.roc_auc == null && (
                <p className="mt-4 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3 text-[11px] font-medium tracking-wide text-(--text-tertiary)">
                  💡 MCC, ROC-AUC, and Mean Std metrics are calculated from the
                  test set.
                </p>
              )}
          </div>

          {/* Metrik Per Kelas + Rata-rata (footer tabel) */}
          {metrics.perClass && Object.keys(metrics.perClass).length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-1.5">
                <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Per-Class Metrics
                </p>
                <InfoPopup title="Per-Class Metrics — Guide">
                  {PER_CLASS_INFO}
                </InfoPopup>
              </div>
              <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                        {[
                          "Class",
                          "Precision",
                          "Recall",
                          "F1-Score",
                          "Support",
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
                      {(metrics.labels.length > 0
                        ? metrics.labels
                        : Object.keys(metrics.perClass)
                      ).map((cls) => {
                        const pc = metrics.perClass[cls];
                        if (!pc) return null;
                        return (
                          <tr
                            key={cls}
                            className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                          >
                            <td className="px-4 py-3 font-semibold text-(--text-primary)">
                              {cls}
                            </td>
                            <td className="px-4 py-3 font-mono text-(--text-secondary)">
                              {(pc.precision * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono text-(--text-secondary)">
                              {(pc.recall * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                              {(pc.f1 * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono text-(--text-tertiary)">
                              {pc.support}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* Rata-rata sebagai tfoot */}
                    {(metrics.macroAvg || metrics.weightedAvg) && (
                      <tfoot className="border-t-2 border-(--border-default) bg-(--bg-elevated)">
                        {metrics.macroAvg && (
                          <tr className="border-b border-(--border-subtle)">
                            <td className="px-4 py-3 text-xs font-bold text-(--text-primary)">
                              Macro Avg
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                              {(metrics.macroAvg.precision * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                              {(metrics.macroAvg.recall * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-(--accent)">
                              {(metrics.macroAvg.f1 * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-(--text-tertiary)">
                              —
                            </td>
                          </tr>
                        )}
                        {metrics.weightedAvg && (
                          <tr>
                            <td className="px-4 py-3 text-xs font-bold text-(--text-primary)">
                              Weighted Avg
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                              {(metrics.weightedAvg.precision * 100).toFixed(2)}
                              %
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                              {(metrics.weightedAvg.recall * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-(--accent)">
                              {(metrics.weightedAvg.f1 * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-(--text-tertiary)">
                              —
                            </td>
                          </tr>
                        )}
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Confusion Matrix */}
          {metrics.cm && (
            <div>
              <div className="mb-4 flex items-center gap-1.5">
                <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Confusion Matrix
                </p>
                <InfoPopup title="Confusion Matrix — Guide">
                  {CONFUSION_MATRIX_INFO}
                </InfoPopup>
              </div>
              <div className="animate-fade-in">
                <ConfusionMatrix data={metrics.cm} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Epoch Logs ────────────────────────────────────────── */}
      {job.epoch_logs?.length > 0 && (
        <div className="">
          <div className="">
            <div className="mb-4 ml-1 flex items-center gap-1.5">
              <h3 className="text-[13px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Per-Epoch Logs
              </h3>
              <InfoPopup title="Per-Epoch Logs — Guide">
                {EPOCH_LOGS_INFO}
              </InfoPopup>
            </div>
          </div>
          <div className="">
            <EpochLogsTable logs={job.epoch_logs} />
          </div>
        </div>
      )}
    </div>
  );
}
