import { useState } from "react";
import ConfusionMatrix from "./ConfusionMatrix";
import EpochLogsTable from "./EpochLogsTable";
import { MetricBar } from "./ui/Bar";
import { MetricsCard } from "./ui/Card";
import { AverageTable, PerClassTable } from "./ui/Table";

function TabSection({ tabs, activeTab, setActiveTab, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
      <div className="no-scrollbar flex overflow-x-auto border-b border-(--border-default) bg-(--bg-elevated)">
        {tabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`border-b-2 px-5 py-3.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${
              activeTab === key
                ? `border-current ${color}`
                : "border-transparent text-(--text-tertiary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function EvaluationResults({ job }) {
  const [activeMetricTab, setActiveMetricTab] = useState("test");
  const [activeCMTab, setActiveCMTab] = useState("test");
  const [activePerClassTab, setActivePerClassTab] = useState("test");

  if (!job) return null;

  const testLabels = job.confusion_matrix?.labels || [];
  const evalLabels = job.val_confusion_matrix?.labels || [];

  const hasEvalMetrics = job.val_accuracy != null || job.val_f1 != null;

  const splitTabs = [
    { key: "test", label: "Test Set (Final)", color: "text-(--warning)" },
    ...(hasEvalMetrics
      ? [
          {
            key: "eval",
            label: "Val Set (Validation)",
            color: "text-(--data-2)",
          },
        ]
      : []),
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Metrik Utama (dengan tab eval/test) ─────────────── */}
      <TabSection
        tabs={splitTabs}
        activeTab={activeMetricTab}
        setActiveTab={setActiveMetricTab}
      >
        {activeMetricTab === "test" ? (
          <div className="animate-fade-in space-y-6">
            {/* Kartu metrik utama */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricsCard
                label="Accuracy"
                value={job.final_accuracy}
                color="text-(--accent)"
              />
              <MetricsCard
                label="F1 Score"
                value={job.final_f1}
                color="text-(--success)"
              />
              <MetricsCard
                label="Precision"
                value={job.final_precision}
                color="text-(--data-2)"
              />
              <MetricsCard
                label="Recall"
                value={job.final_recall}
                color="text-(--warning)"
              />
            </div>

            {/* Bar chart */}
            <div className="space-y-3.5 pt-2">
              <MetricBar
                label="MCC"
                value={job.final_mcc}
                color="bg-(--accent)"
              />
              <MetricBar
                label="ROC-AUC"
                value={job.final_roc_auc}
                color="bg-(--success)"
              />
              <MetricBar
                label="Mean Std"
                value={job.final_mean_std}
                color="bg-(--warning)"
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricsCard
                label="Accuracy"
                value={job.val_accuracy}
                color="text-(--accent)"
              />
              <MetricsCard
                label="F1 Score"
                value={job.val_f1}
                color="text-(--success)"
              />
              <MetricsCard
                label="Precision"
                value={job.val_precision}
                color="text-(--data-2)"
              />
              <MetricsCard
                label="Recall"
                value={job.val_recall}
                color="text-(--warning)"
              />
            </div>

            <p className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3 text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              💡 Metrik validation set dihitung dari validation set selama
              training per epoch, bukan test set akhir.
            </p>
          </div>
        )}
      </TabSection>

      {/* ── Confusion Matrix ─────────────────────────────────── */}
      {(job.confusion_matrix || job.val_confusion_matrix) && (
        <TabSection
          tabs={[
            { key: "test", label: "Test Set", color: "text-(--warning)" },
            ...(job.val_confusion_matrix
              ? [
                  {
                    key: "eval",
                    label: "Val Set",
                    color: "text-(--data-2)",
                  },
                ]
              : []),
          ]}
          activeTab={activeCMTab}
          setActiveTab={setActiveCMTab}
        >
          <div className="animate-fade-in">
            {activeCMTab === "test" && job.confusion_matrix && (
              <ConfusionMatrix data={job.confusion_matrix} />
            )}
            {activeCMTab === "eval" && job.val_confusion_matrix && (
              <ConfusionMatrix data={job.val_confusion_matrix} />
            )}
          </div>
        </TabSection>
      )}

      {/* ── Per-Class Metrics ─────────────────────────────────── */}
      {(job.per_class_metrics || job.val_per_class_metrics) && (
        <TabSection
          tabs={[
            { key: "test", label: "Test Set", color: "text-(--warning)" },
            ...(job.val_per_class_metrics
              ? [
                  {
                    key: "eval",
                    label: "Val Set",
                    color: "text-(--data-2)",
                  },
                ]
              : []),
          ]}
          activeTab={activePerClassTab}
          setActiveTab={setActivePerClassTab}
        >
          <div className="animate-fade-in">
            {activePerClassTab === "test" && (
              <>
                <PerClassTable
                  perClass={job.per_class_metrics}
                  labels={testLabels}
                />
                {(job.macro_avg || job.weighted_avg) && (
                  <div className="mt-6 border-t border-(--border-default) pt-5">
                    <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                      Average Metrics
                    </p>
                    <AverageTable
                      macroAvg={job.macro_avg}
                      weightedAvg={job.weighted_avg}
                    />
                  </div>
                )}
              </>
            )}
            {activePerClassTab === "eval" && (
              <>
                <PerClassTable
                  perClass={job.val_per_class_metrics}
                  labels={evalLabels}
                />
                {(job.val_macro_avg || job.val_weighted_avg) && (
                  <div className="mt-6 border-t border-(--border-default) pt-5">
                    <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                      Average Metrics
                    </p>
                    <AverageTable
                      macroAvg={job.val_macro_avg}
                      weightedAvg={job.val_weighted_avg}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </TabSection>
      )}

      {/* ── Epoch Logs ────────────────────────────────────────── */}
      {job.epoch_logs?.length > 0 && (
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Epoch Logs
          </p>
          <EpochLogsTable logs={job.epoch_logs} />
        </div>
      )}
    </div>
  );
}
