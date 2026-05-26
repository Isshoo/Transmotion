"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Database, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import RawDataTab from "./RawDataTab";
import PreprocessedTab from "./PreprocessedTab";
import { PreprocessStatusBadge } from "./ui/Badge";
import ClassDistribution from "./ClassDistribution";

import { useSSE } from "@/hooks/useSSE";

// ── Komponen utama ─────────────────────────────────────────────

export default function DatasetDetail() {
  const router = useRouter();
  const { id: datasetId } = useParams();
  const {
    currentDataset,
    isLoadingDetail,
    isSubmitting,
    fetchDataset,
    setColumns,
  } = useDatasetStore();

  const [activeTab, setActiveTab] = useState("raw");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDataset?.id]);

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
          toast.success("Preprocessing selesai!");
        }
        if (eventType === "error_event") {
          toast.error(
            "Preprocessing gagal: " + (data?.preprocessing_error ?? "")
          );
        }
      },
    }
  );
  // ── end SSE ────────────────────────────────────────────────────────────────

  const handleSaveColumns = async () => {
    if (!textCol || !labelCol) {
      toast.error("Pilih kolom teks dan kolom label terlebih dahulu");
      return;
    }
    if (textCol === labelCol) {
      toast.error("Kolom teks dan label harus berbeda");
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

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-(--accent)" />
          <p className="text-xs text-(--text-tertiary)">Memuat dataset...</p>
        </div>
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Database size={36} className="mb-3 text-(--text-disabled)" />
        <p className="text-sm font-medium text-(--text-secondary)">
          Dataset tidak ditemukan.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-(--text-tertiary) transition-colors hover:text-(--accent)"
        >
          <ArrowLeft size={13} /> Kembali
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
          <ArrowLeft size={13} /> Kembali ke daftar dataset
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
              <Database size={18} className="text-(--accent)" />
              {ds.name}
            </h1>
            {ds.description && (
              <p className="mt-1 text-sm text-(--text-secondary)">
                {ds.description}
              </p>
            )}
          </div>
          <PreprocessStatusBadge status={ds.preprocessing_status} />
        </div>
      </div>

      {/* Info Umum */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-(--border-default) bg-(--border-subtle) sm:grid-cols-4">
        {[
          ["File", ds.file_name],
          ["Baris Raw", ds.num_rows_raw?.toLocaleString("id") ?? "—"],
          [
            "Baris Preprocessed",
            ds.num_rows_preprocessed?.toLocaleString("id") ?? "—",
          ],
          [
            "Ukuran File",
            ds.file_size
              ? ds.file_size < 1024 * 1024
                ? `${(ds.file_size / 1024).toFixed(1)} KB`
                : `${(ds.file_size / 1024 / 1024).toFixed(1)} MB`
              : "—",
          ],
          ["Jumlah Kolom", availableColumns.length || "—"],
          ["Kolom Teks", ds.text_column ?? "Belum diatur"],
          ["Kolom Label", ds.label_column ?? "Belum diatur"],
          ["Diupload Oleh", ds.uploader_name ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-(--bg-surface) px-4 py-3.5">
            <p className="text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
              {label}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-(--text-primary)">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Pengaturan Kolom */}
      <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
        <h2 className="mb-0.5 text-sm font-semibold text-(--text-primary)">
          Pengaturan Kolom
        </h2>
        <p className="mb-4 text-xs text-(--text-secondary)">
          Tentukan kolom mana yang berisi teks dan kolom mana yang berisi label
          kelas. Pengaturan ini akan digunakan saat preprocessing dan training.
        </p>

        {availableColumns.length === 0 ? (
          <p className="text-sm text-(--text-tertiary)">
            Tidak ada informasi kolom.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                Kolom Teks
              </label>
              <select
                value={textCol}
                onChange={(e) => {
                  setTextCol(e.target.value);
                  setColChanged(true);
                }}
                className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              >
                <option value="">-- Pilih kolom --</option>
                {availableColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                Kolom Label
              </label>
              <select
                value={labelCol}
                onChange={(e) => {
                  setLabelCol(e.target.value);
                  setColChanged(true);
                }}
                className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              >
                <option value="">-- Pilih kolom --</option>
                {availableColumns
                  .filter((c) => c !== textCol)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={handleSaveColumns}
              disabled={isSubmitting || !colChanged || !textCol || !labelCol}
              className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={13} />
              {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        )}
      </div>

      {/* Distribusi Kelas */}
      {showDistribution && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h2 className="mb-4 text-sm font-semibold text-(--text-primary)">
            Distribusi Kelas
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ClassDistribution
              title="Dataset Raw"
              distribution={ds.class_distribution_raw}
              colorClass="bg-(--data-1)"
            />
            {ds.preprocessing_status === "completed" && (
              <ClassDistribution
                title="Dataset Preprocessed"
                distribution={ds.class_distribution_preprocessed}
                colorClass="bg-(--data-2)"
              />
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
        {/* Tab headers */}
        <div className="flex border-b border-(--border-default)">
          {[
            { key: "raw", label: "Data Asli (Raw)" },
            { key: "preprocessed", label: "Data Preprocessed" },
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
    </div>
  );
}
