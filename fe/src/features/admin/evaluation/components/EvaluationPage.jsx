"use client";

import { useEffect } from "react";
import { BarChart2, Loader2, ChevronDown } from "lucide-react";
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
      {/* Header & Filter */}
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

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Dataset:
          </span>
          {isLoadingDatasets ? (
            <div className="flex items-center gap-2 text-xs font-medium text-(--text-tertiary)">
              <Loader2 size={14} className="animate-spin text-(--accent)" />{" "}
              Loading...
            </div>
          ) : (
            <div className="relative w-48">
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full appearance-none rounded-lg border border-(--border-default) bg-(--bg-surface) py-1.5 pl-3 pr-8 text-xs font-semibold text-(--text-primary) shadow-(--shadow-sm) outline-none transition-all duration-200 hover:border-(--border-strong) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)/30 cursor-pointer"
              >
                <option value="">All Datasets</option>
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-(--text-tertiary)">
                <ChevronDown size={14} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingCompare && (
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-(--border-default)" />
            <div className="h-8 w-32 rounded-full bg-(--bg-elevated)" />
            <div className="h-px flex-1 bg-(--border-default)" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-24 rounded-full bg-(--bg-elevated)" />
              <div className="h-8 w-24 rounded-full bg-(--bg-elevated)" />
              <div className="h-8 w-40 rounded-full bg-(--bg-elevated)" />
              <div className="h-8 w-40 rounded-full bg-(--bg-elevated)" />
            </div>
            <div className="h-10 w-full max-w-xl rounded-full bg-(--bg-elevated)" />
            <div className="h-64 rounded-2xl bg-(--bg-elevated)" />
          </div>
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
            Train XLM-R and mBERT with the same dataset to see a performance
            comparison.
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
