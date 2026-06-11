"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  Loader2,
  FileText,
  User,
  Columns,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import RawDataTab from "./RawDataTab";
import PreprocessedTab from "./PreprocessedTab";
import { PreprocessStatusBadge } from "./ui/Badge";
import ClassDistribution from "./ClassDistribution";
import PreprocessModal from "./modal/PreprocessModal";

import { useSSE } from "@/hooks/useSSE";

// ── Komponen utama ─────────────────────────────────────────────

export default function DatasetDetail({ datasetId }) {
  const router = useRouter();
  const {
    currentDataset,
    // isLoadingDetail,
    isSubmitting,
    fetchDataset,
    setColumns,
  } = useDatasetStore();

  const [activeTab, setActiveTab] = useState("raw");
  const [showPreprocessModal, setShowPreprocessModal] = useState(false);

  const [textCol, setTextCol] = useState("");
  const [labelCol, setLabelCol] = useState("");
  const [colChanged, setColChanged] = useState(false);

  // Fetch dataset on mount
  useEffect(() => {
    fetchDataset(datasetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  // Sync kolom dari dataset
  useEffect(() => {
    if (currentDataset) {
      setTextCol(currentDataset.text_column ?? "");
      setLabelCol(currentDataset.label_column ?? "");
      setColChanged(false);
    }
  }, [
    currentDataset,
    currentDataset?.id,
    currentDataset?.text_column,
    currentDataset?.label_column,
  ]);

  // ── SSE: replace polling preprocessing ────────────────────────────────────
  const isPreprocessingRunning =
    currentDataset?.preprocessing_status === "running";

  useSSE(
    // Hanya subscribe saat preprocessing sedang berjalan
    isPreprocessingRunning ? `/api/sse/datasets/${datasetId}` : null,
    {
      enabled: isPreprocessingRunning,
      onMessage: (data, eventType) => {
        if (
          eventType === "update" ||
          eventType === "complete" ||
          eventType === "error_event"
        ) {
          // Update store dengan data terbaru dari SSE
          useDatasetStore.setState({ currentDataset: data });
        }
        if (eventType === "complete") {
          toast.success("Preprocessing completed!");
        }
        if (eventType === "error_event") {
          toast.error(
            "Preprocessing failed: " + (data?.preprocessing_error ?? "")
          );
        }
      },
    }
  );
  // ── end SSE ────────────────────────────────────────────────────────────────

  const handleSaveColumns = async () => {
    if (!textCol || !labelCol) {
      toast.error("Please select text and label columns first");
      return;
    }
    if (textCol === labelCol) {
      toast.error("Text and label columns must be different");
      return;
    }
    const result = await setColumns(datasetId, textCol, labelCol);
    if (result.success) {
      toast.success(result.message);
      setColChanged(false);
    } else {
      toast.error(result.message);
    }
  };

  if (!currentDataset || String(currentDataset.id) !== String(datasetId)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-(--accent)" />
          <p className="text-xs text-(--text-tertiary)">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Database size={36} className="mb-3 text-(--text-disabled)" />
        <p className="text-sm font-medium text-(--text-secondary)">
          Dataset not found.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-(--text-tertiary) transition-colors hover:text-(--accent)"
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    );
  }

  const ds = currentDataset;
  const availableColumns = ds.columns ?? [];
  const hasColumnConfig = ds.columns_configured;
  const showDistribution = hasColumnConfig;

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/admin/datasets")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-(--text-tertiary) transition-all duration-150 hover:text-(--text-primary)"
        >
          <ArrowLeft size={13} /> Back to dataset list
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
              <Database size={18} className="text-(--accent)" />
              {ds.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)"
                title="File Name"
              >
                <FileText size={13} className="text-(--text-tertiary)" />
                {ds.file_name}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)"
                title="Uploaded By"
              >
                <User size={13} className="text-(--text-tertiary)" />
                {ds.uploader_name || "admin"}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)"
                title="Columns"
              >
                <Columns size={13} className="text-(--text-tertiary)" />
                {availableColumns.length} Columns
                {/* {hasColumnConfig && (
                  <span className="ml-0.5 opacity-70">
                    (Teks: {ds.text_column}, Label: {ds.label_column})
                  </span>
                )} */}
              </span>
            </div>
            {ds.description && (
              <p className="mt-3 text-sm text-(--text-secondary)">
                {ds.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <PreprocessStatusBadge status={ds.preprocessing_status} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-4 shadow-(--shadow-sm)">
          <p className="text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            Raw Rows
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-(--text-primary)">
            {ds.num_rows_raw?.toLocaleString("id") ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-4 shadow-(--shadow-sm)">
          <p className="text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            Preprocessed Rows
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-(--text-primary)">
            {ds.num_rows_preprocessed?.toLocaleString("id") ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-4 shadow-(--shadow-sm)">
          <p className="text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            File Size
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-(--text-primary)">
            {ds.file_size
              ? ds.file_size < 1024 * 1024
                ? `${(ds.file_size / 1024).toFixed(1)} KB`
                : `${(ds.file_size / 1024 / 1024).toFixed(1)} MB`
              : "—"}
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Column Settings & Class Distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        {/* Left Column: Column Settings */}
        <div className="flex flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
          <h2 className="mb-1 text-sm font-semibold text-(--text-primary)">
            Column Settings
          </h2>
          <p className="mb-4 text-xs text-(--text-secondary)">
            Determine which column contains text and which contains class
            labels.
          </p>

          {availableColumns.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-(--text-tertiary)">
              No column information.
            </div>
          ) : (
            <div className="flex flex-1 flex-col space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                  Text Column
                </label>
                <select
                  value={textCol}
                  onChange={(e) => {
                    setTextCol(e.target.value);
                    setColChanged(true);
                  }}
                  className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                >
                  <option value="">-- Select column --</option>
                  {availableColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                  Label Column
                </label>
                <select
                  value={labelCol}
                  onChange={(e) => {
                    setLabelCol(e.target.value);
                    setColChanged(true);
                  }}
                  className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                >
                  <option value="">-- Select column --</option>
                  {availableColumns
                    .filter((c) => c !== textCol)
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mt-auto flex justify-end pt-4">
                <button
                  onClick={handleSaveColumns}
                  disabled={
                    isSubmitting || !colChanged || !textCol || !labelCol
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Class Distribution */}
        <div className="flex flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
          <h2 className="mb-4 text-sm font-semibold text-(--text-primary)">
            Class Distribution (Raw vs Preprocessed)
          </h2>
          <div className="flex flex-1 flex-col justify-center">
            {showDistribution ? (
              <ClassDistribution
                rawDistribution={ds.class_distribution_raw}
                preprocessedDistribution={ds.class_distribution_preprocessed}
                status={ds.preprocessing_status}
              />
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-(--text-tertiary)">
                <Database size={32} className="mb-3 text-(--border-strong)" />
                <p className="text-sm">No data distribution yet.</p>
                <p className="mt-1 text-xs">
                  Please save Column Settings first.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
        {/* Tab headers */}
        <div className="flex border-b border-(--border-default)">
          {[
            { key: "raw", label: "Raw Data" },
            { key: "preprocessed", label: "Preprocessed Data" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? "border-(--accent) text-(--accent)"
                  : "border-transparent text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "raw" && (
            <RawDataTab datasetId={datasetId} dataset={ds} />
          )}
          {activeTab === "preprocessed" && (
            <PreprocessedTab datasetId={datasetId} dataset={ds} />
          )}
        </div>
      </div>

      {showPreprocessModal && (
        <PreprocessModal
          datasetId={datasetId}
          dataset={ds}
          onClose={() => setShowPreprocessModal(false)}
        />
      )}
    </div>
  );
}
