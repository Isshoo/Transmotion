import { useState } from "react";
import { bestModel, fmtPct } from "../ui/Helpers";
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

export default function DatasetSection({ group }) {
  const [activeTab, setActiveTab] = useState("iteration");
  const { mbert, xlmr } = group;
  const hasData = mbert.length > 0 || xlmr.length > 0;

  if (!hasData) return null;

  const bestXlmr = bestModel(xlmr);
  const bestMbert = bestModel(mbert);

  return (
    <div className="space-y-6">
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
            Best XLM-R Accuracy
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--success)">
            {bestXlmr ? fmtPct(bestXlmr.accuracy) : "-"}
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-colors hover:border-(--border-strong)">
          <div className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
            Best MBERT Accuracy
          </div>
          <p className="mt-4 text-3xl font-black tracking-tight text-(--success)">
            {bestMbert ? fmtPct(bestMbert.accuracy) : "-"}
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
                  Iteration Table — Accuracy
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
            <IterationTable mbert={mbert} xlmr={xlmr} metric="accuracy" />
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
                Compared from the model with the highest Accuracy of each type.
              </p>
            </div>
            <ComparisonTable mbert={mbert} xlmr={xlmr} />
          </div>
        )}

        {activeTab === "perclass" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <PerClassComparison mbert={mbert} xlmr={xlmr} />
          </div>
        )}

        {activeTab === "confusion" && (
          <div className="animate-slide-up rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
            <ConfusionMatrixSection mbert={mbert} xlmr={xlmr} />
          </div>
        )}
      </div>
    </div>
  );
}
