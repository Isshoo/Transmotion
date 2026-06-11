"use client";

import { useEffect } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import useEvaluationStore from "../store";
import DatasetSection from "./sub/DatasetSection";

export default function EvaluationPage() {
  const {
    datasets,
    isLoadingDatasets,
    selectedDatasetId,
    compareData,
    isLoadingCompare,
    fetchDatasets,
    fetchCompare,
    setSelectedDataset,
  } = useEvaluationStore();

  useEffect(() => {
    setSelectedDataset("");
    fetchDatasets();
    fetchCompare("");
    return () => {
      useEvaluationStore.setState({
        isLoadingDatasets: true,
        isLoadingCompare: true,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasData = compareData.length > 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <BarChart2 size={20} className="text-(--accent)" />
            Performance Evaluation
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Compare XLM-R vs mBERT by dataset and split ratio
          </p>
        </div>
      </div>

      {/* Filter dataset */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
        <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
          Filter Dataset
        </p>
        {isLoadingDatasets ? (
          <div className="flex items-center gap-2 text-sm font-medium text-(--text-tertiary)">
            <Loader2 size={16} className="animate-spin text-(--accent)" />{" "}
            Loading datasets...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDataset("")}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-150 ${
                selectedDatasetId === ""
                  ? "border-(--accent-muted)/50 bg-(--accent-muted)/20 text-(--accent) shadow-(--shadow-sm)"
                  : "border-(--border-default) bg-(--bg-elevated) text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
              }`}
            >
              All Datasets
            </button>
            {datasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => setSelectedDataset(ds.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-150 ${
                  selectedDatasetId === ds.id
                    ? "border-(--accent-muted)/50 bg-(--accent-muted)/20 text-(--accent) shadow-(--shadow-sm)"
                    : "border-(--border-default) bg-(--bg-elevated) text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                }`}
              >
                {ds.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoadingCompare && (
        <div className="flex animate-pulse flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-elevated) shadow-(--shadow-sm)">
            <Loader2 size={24} className="animate-spin text-(--accent)" />
          </div>
          <span className="text-sm font-semibold text-(--text-tertiary)">
            Loading evaluation data...
          </span>
        </div>
      )}

      {/* No data */}
      {!isLoadingCompare && !hasData && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--border-default) bg-(--bg-surface) py-20 text-center transition-colors hover:border-(--border-strong)">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-elevated)">
            <BarChart2 size={32} className="text-(--text-tertiary)" />
          </div>
          <p className="mb-2 text-base font-bold text-(--text-primary)">
            No comparison data yet
          </p>
          <p className="max-w-sm text-sm leading-relaxed font-medium text-(--text-secondary)">
            Train XLM-R and mBERT with the same dataset to see a performance comparison.
          </p>
        </div>
      )}

      {/* Data per dataset */}
      {!isLoadingCompare &&
        compareData.map((group) => (
          <div key={group.dataset_id} className="animate-slide-up space-y-6">
            {/* Header dataset */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-(--border-strong) to-(--border-strong)" />
              <h2 className="rounded-full border border-(--border-default) bg-(--bg-surface) px-5 py-2 text-xs font-black tracking-widest text-(--text-primary) uppercase shadow-(--shadow-sm)">
                {group.dataset_name}
              </h2>
              <div className="h-px flex-1 bg-linear-to-l from-transparent via-(--border-strong) to-(--border-strong)" />
            </div>

            <DatasetSection group={group} />
          </div>
        ))}
    </div>
  );
}
