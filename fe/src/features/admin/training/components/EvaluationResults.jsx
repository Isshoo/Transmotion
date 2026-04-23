import ConfusionMatrix from "./ConfusionMatrix";
import EpochLogsTable from "./EpochLogsTable";
import { MetricBar } from "./ui/Bar";
import { MetricsCard } from "./ui/Card";
import { AverageTable, PerClassTable } from "./ui/Table";

export default function EvaluationResults({ job }) {
  if (!job) return null;

  const labels = job.confusion_matrix?.labels || [];

  return (
    <div className="space-y-6">
      {/* Metrik utama */}
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

      {/* Bar chart metrik */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        <MetricBar
          label="Accuracy"
          value={job.final_accuracy}
          color="bg-blue-500"
        />
        <MetricBar label="F1 Score" value={job.final_f1} color="bg-green-500" />
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

      {/* Confusion matrix */}
      {job.confusion_matrix && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ConfusionMatrix data={job.confusion_matrix} />
        </div>
      )}

      {/* Per-class metrics */}
      {job.per_class_metrics && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <PerClassTable perClass={job.per_class_metrics} labels={labels} />
        </div>
      )}

      {/* Average */}
      {(job.macro_avg || job.weighted_avg) && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <AverageTable
            macroAvg={job.macro_avg}
            weightedAvg={job.weighted_avg}
          />
        </div>
      )}

      {/* Epoch logs */}
      {job.epoch_logs?.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <EpochLogsTable logs={job.epoch_logs} />
        </div>
      )}
    </div>
  );
}
