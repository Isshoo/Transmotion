import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { bestModel, fmt } from "../ui/Helpers";
import ComparisonTable from "./ComparisonTable";
import ConfusionMatrixSection from "./ConfusionMatrixSection";
import IterationTable from "./IterationTable";
import PerClassComparison from "./PerClassComparison";
import InfoPopup from "@/components/ui/InfoPopup";
import {
  ITERATION_TABLE_INFO,
  METRIC_COMPARISON_INFO,
} from "@/components/ui/InfoContents";

const TABS = [
  { id: "iteration", label: "Iteration History" },
  { id: "comparison", label: "Metric Comparison" },
  { id: "perclass", label: "Class Performance" },
  { id: "confusion", label: "Confusion Matrix" },
];

const METRIC_OPTIONS = [
  { value: "accuracy", label: "Accuracy", raw: false },
  { value: "precision", label: "Precision", raw: false },
  { value: "recall", label: "Recall", raw: false },
  { value: "f1_score", label: "F1-Score", raw: false },
  { value: "mcc", label: "MCC", raw: true },
  { value: "roc_auc", label: "ROC-AUC", raw: true },
];

export default function DatasetSection({ group }) {
  const [activeTab, setActiveTab] = useState("iteration");
  const [selectedMetric, setSelectedMetric] = useState("accuracy");
  const { mbert, xlmr } = group;
  const hasData = mbert.length > 0 || xlmr.length > 0;

  if (!hasData) return null;

  const bestXlmr = bestModel(xlmr, selectedMetric);
  const bestMbert = bestModel(mbert, selectedMetric);

  const selectedMetricDef = METRIC_OPTIONS.find(
    (m) => m.value === selectedMetric
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="tracking-md ml-1 text-lg font-bold text-(--text-primary)">
          {group.dataset_name}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Best Model Metric:
          </span>
          <div className="relative w-48">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-(--border-default) bg-(--bg-surface) py-1.5 pr-8 pl-3 text-xs font-semibold text-(--text-primary) shadow-(--shadow-sm) transition-all duration-200 outline-none hover:border-(--border-strong) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)/30"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-(--text-tertiary)">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
      {/* Mini Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-(--data-4)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-4) uppercase">
              XLM-R
            </span>
            <span className="text-xs font-semibold text-(--text-tertiary)">
              Models Trained
            </span>
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--text-primary)">
            {xlmr.length}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-(--data-1)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-1) uppercase">
              MBERT
            </span>
            <span className="text-xs font-semibold text-(--text-tertiary)">
              Models Trained
            </span>
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--text-primary)">
            {mbert.length}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-colors hover:border-(--border-strong)">
          <div className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
            Best XLM-R {selectedMetricDef.label}
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--success)">
            {bestXlmr
              ? fmt(bestXlmr[selectedMetric], selectedMetricDef.raw)
              : "-"}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-colors hover:border-(--border-strong)">
          <div className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
            Best MBERT {selectedMetricDef.label}
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--success)">
            {bestMbert
              ? fmt(bestMbert[selectedMetric], selectedMetricDef.raw)
              : "-"}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="scrollbar-none flex overflow-x-auto rounded-xl border border-(--border-default) bg-(--bg-surface) p-1.5 shadow-(--shadow-sm)">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-(--bg-elevated) text-(--text-primary) shadow-(--shadow-sm) ring-1 ring-(--border-strong)"
                : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in min-h-[400px]">
        {activeTab === "iteration" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <div className="mb-5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold tracking-tight text-(--text-primary)">
                  Iteration Table — {selectedMetricDef.label}
                </p>
                <InfoPopup title="Iteration Table — Guide">
                  {ITERATION_TABLE_INFO}
                </InfoPopup>
              </div>
              <p className="mt-1 text-xs font-medium text-(--text-secondary)">
                Each row = training iteration N with the same split. The average
                is calculated from all iterations per column.
              </p>
            </div>
            <IterationTable
              mbert={mbert}
              xlmr={xlmr}
              metric={selectedMetric}
              raw={selectedMetricDef.raw}
            />
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <div className="mb-5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold tracking-tight text-(--text-primary)">
                  Metric Comparison — Best Model
                </p>
                <InfoPopup title="Metric Comparison — Guide">
                  {METRIC_COMPARISON_INFO}
                </InfoPopup>
              </div>
              <p className="mt-1 text-xs font-medium text-(--text-secondary)">
                Compared from the model with the highest{" "}
                {selectedMetricDef.label} of each type.
              </p>
            </div>
            <ComparisonTable
              mbert={mbert}
              xlmr={xlmr}
              metric={selectedMetric}
              metricLabel={selectedMetricDef.label}
            />
          </div>
        )}

        {activeTab === "perclass" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <PerClassComparison
              mbert={mbert}
              xlmr={xlmr}
              metric={selectedMetric}
            />
          </div>
        )}

        {activeTab === "confusion" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <ConfusionMatrixSection
              mbert={mbert}
              xlmr={xlmr}
              metric={selectedMetric}
            />
          </div>
        )}
      </div>
    </div>
  );
}
