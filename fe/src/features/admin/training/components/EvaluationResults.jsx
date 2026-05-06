import { useState } from "react";
import ConfusionMatrix from "./ConfusionMatrix";
import EpochLogsTable from "./EpochLogsTable";
import { MetricBar } from "./ui/Bar";
import { MetricsCard } from "./ui/Card";
import { AverageTable, PerClassTable } from "./ui/Table";

function TabSection({ tabs, activeTab, setActiveTab, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex border-b">
        {tabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`border-b-2 px-5 py-3 text-xs font-semibold transition ${
              activeTab === key
                ? `border-current ${color}`
                : "border-transparent text-gray-400 hover:text-gray-600"
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
  const evalLabels = job.eval_confusion_matrix?.labels || [];

  const hasEvalMetrics = job.eval_accuracy != null || job.eval_f1 != null;

  const splitTabs = [
    { key: "test", label: "Test Set (Final)", color: "text-amber-600" },
    ...(hasEvalMetrics
      ? [
          {
            key: "eval",
            label: "Val Set (Validation)",
            color: "text-purple-600",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* ── Metrik Utama (dengan tab eval/test) ─────────────── */}
      <TabSection
        tabs={splitTabs}
        activeTab={activeMetricTab}
        setActiveTab={setActiveMetricTab}
      >
        {activeMetricTab === "test" ? (
          <div className="space-y-5">
            {/* Kartu metrik utama */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricsCard
                label="Accuracy"
                value={job.final_accuracy}
                color="text-blue-600"
              />
              <MetricsCard
                label="F1 Score"
                value={job.final_f1}
                color="text-green-600"
              />
              <MetricsCard
                label="Precision"
                value={job.final_precision}
                color="text-purple-600"
              />
              <MetricsCard
                label="Recall"
                value={job.final_recall}
                color="text-amber-600"
              />
            </div>

            {/* Metrik lanjutan */}
            <div className="grid grid-cols-3 gap-3">
              <MetricsCard
                label="MCC"
                value={job.final_mcc}
                suffix="raw"
                color="text-blue-800"
              />
              <MetricsCard
                label="ROC-AUC"
                value={job.final_roc_auc}
                suffix="raw"
                color="text-green-800"
              />
              <MetricsCard
                label="Mean Std"
                value={job.final_mean_std}
                suffix="raw"
                color="text-gray-600"
              />
            </div>

            {/* Bar chart */}
            <div className="space-y-2.5">
              <MetricBar
                label="Accuracy"
                value={job.final_accuracy}
                color="bg-blue-500"
              />
              <MetricBar
                label="F1 Score"
                value={job.final_f1}
                color="bg-green-500"
              />
              <MetricBar
                label="Precision"
                value={job.final_precision}
                color="bg-purple-500"
              />
              <MetricBar
                label="Recall"
                value={job.final_recall}
                color="bg-amber-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricsCard
                label="Accuracy"
                value={job.eval_accuracy}
                color="text-blue-600"
              />
              <MetricsCard
                label="F1 Score"
                value={job.eval_f1}
                color="text-green-600"
              />
              <MetricsCard
                label="Precision"
                value={job.eval_precision}
                color="text-purple-600"
              />
              <MetricsCard
                label="Recall"
                value={job.eval_recall}
                color="text-amber-600"
              />
            </div>
            <div className="space-y-2.5">
              <MetricBar
                label="Accuracy"
                value={job.eval_accuracy}
                color="bg-blue-400"
              />
              <MetricBar
                label="F1 Score"
                value={job.eval_f1}
                color="bg-green-400"
              />
              <MetricBar
                label="Precision"
                value={job.eval_precision}
                color="bg-purple-400"
              />
              <MetricBar
                label="Recall"
                value={job.eval_recall}
                color="bg-amber-400"
              />
            </div>
            <p className="text-xs text-gray-400">
              Metrik eval set dihitung dari validation set selama training,
              bukan test set akhir.
            </p>
          </div>
        )}
      </TabSection>

      {/* ── Confusion Matrix ─────────────────────────────────── */}
      {(job.confusion_matrix || job.eval_confusion_matrix) && (
        <TabSection
          tabs={[
            { key: "test", label: "Test Set", color: "text-amber-600" },
            ...(job.eval_confusion_matrix
              ? [{ key: "eval", label: "Val Set", color: "text-purple-600" }]
              : []),
          ]}
          activeTab={activeCMTab}
          setActiveTab={setActiveCMTab}
        >
          {activeCMTab === "test" && job.confusion_matrix && (
            <ConfusionMatrix data={job.confusion_matrix} />
          )}
          {activeCMTab === "eval" && job.eval_confusion_matrix && (
            <ConfusionMatrix data={job.eval_confusion_matrix} />
          )}
        </TabSection>
      )}

      {/* ── Per-Class Metrics ─────────────────────────────────── */}
      {(job.per_class_metrics || job.eval_per_class_metrics) && (
        <TabSection
          tabs={[
            { key: "test", label: "Test Set", color: "text-amber-600" },
            ...(job.eval_per_class_metrics
              ? [{ key: "eval", label: "Val Set", color: "text-purple-600" }]
              : []),
          ]}
          activeTab={activePerClassTab}
          setActiveTab={setActivePerClassTab}
        >
          {activePerClassTab === "test" && (
            <>
              <PerClassTable
                perClass={job.per_class_metrics}
                labels={testLabels}
              />
              {(job.macro_avg || job.weighted_avg) && (
                <div className="mt-4">
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
                perClass={job.eval_per_class_metrics}
                labels={evalLabels}
              />
              {(job.eval_macro_avg || job.eval_weighted_avg) && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Average Metrics
                  </p>
                  <AverageTable
                    macroAvg={job.eval_macro_avg}
                    weightedAvg={job.eval_weighted_avg}
                  />
                </div>
              )}
            </>
          )}
        </TabSection>
      )}

      {/* ── Epoch Logs ────────────────────────────────────────── */}
      {job.epoch_logs?.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Epoch Logs
          </p>
          <EpochLogsTable logs={job.epoch_logs} />
        </div>
      )}
    </div>
  );
}
