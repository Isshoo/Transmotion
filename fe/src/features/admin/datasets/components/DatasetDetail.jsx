"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import RawDataTab from "./RawDataTab";
import PreprocessedTab from "./PreprocessedTab";

// ── Badge helpers ──────────────────────────────────────────────

function PreprocessStatusBadge({ status }) {
  const map = {
    idle: {
      label: "Belum diproses",
      cls: "bg-gray-100 text-gray-600",
      icon: Clock,
    },
    running: {
      label: "Sedang memproses",
      cls: "bg-yellow-100 text-yellow-700",
      icon: Loader2,
    },
    completed: {
      label: "Selesai",
      cls: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    error: {
      label: "Gagal",
      cls: "bg-red-100 text-red-600",
      icon: AlertCircle,
    },
  };
  const { label, cls, icon: Icon } = map[status] ?? map.idle;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}
    >
      <Icon size={12} className={status === "running" ? "animate-spin" : ""} />
      {label}
    </span>
  );
}

// ── Distribusi kelas ───────────────────────────────────────────

function ClassDistribution({ title, distribution, colorClass }) {
  if (!distribution || Object.keys(distribution).length === 0) return null;
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {title}
      </p>
      <div className="space-y-2">
        {Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => {
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div key={label}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {count.toLocaleString("id")} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        <p className="pt-1 text-xs text-gray-400">
          Total: {total.toLocaleString("id")} baris
        </p>
      </div>
    </div>
  );
}

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
    refreshDataset,
  } = useDatasetStore();

  const [activeTab, setActiveTab] = useState("raw");
  const [textCol, setTextCol] = useState("");
  const [labelCol, setLabelCol] = useState("");
  const [colChanged, setColChanged] = useState(false);
  const pollingRef = useRef(null);

  // Fetch dataset on mount
  useEffect(() => {
    fetchDataset(datasetId);
    return () => clearInterval(pollingRef.current);
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

  // Polling saat preprocessing running
  useEffect(() => {
    clearInterval(pollingRef.current);
    if (currentDataset?.preprocessing_status === "running") {
      pollingRef.current = setInterval(async () => {
        const updated = await refreshDataset(datasetId);
        if (updated?.preprocessing_status !== "running") {
          clearInterval(pollingRef.current);
          if (updated?.preprocessing_status === "completed") {
            toast.success("Preprocessing selesai!");
          } else if (updated?.preprocessing_status === "error") {
            toast.error("Preprocessing gagal: " + updated.preprocessing_error);
          }
        }
      }, 3000);
    }
    return () => clearInterval(pollingRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDataset?.preprocessing_status]);

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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!currentDataset) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Dataset tidak ditemukan.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          ← Kembali
        </button>
      </div>
    );
  }

  const ds = currentDataset;
  const availableColumns = ds.columns ?? [];
  const hasColumnConfig = ds.columns_configured;
  const showDistribution = hasColumnConfig;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/admin/datasets")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Kembali ke daftar dataset
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Database size={20} className="text-blue-600" />
              {ds.name}
            </h1>
            {ds.description && (
              <p className="mt-1 text-sm text-gray-500">{ds.description}</p>
            )}
          </div>
          <PreprocessStatusBadge status={ds.preprocessing_status} />
        </div>
      </div>

      {/* Info Umum */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-4">
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
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-gray-700">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Pengaturan Kolom */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold text-gray-800">
          Pengaturan Kolom
        </h2>
        <p className="mb-4 text-xs text-gray-500">
          Tentukan kolom mana yang berisi teks dan kolom mana yang berisi label
          kelas. Pengaturan ini akan digunakan saat preprocessing dan training.
        </p>

        {availableColumns.length === 0 ? (
          <p className="text-sm text-gray-400">Tidak ada informasi kolom.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Kolom Teks
              </label>
              <select
                value={textCol}
                onChange={(e) => {
                  setTextCol(e.target.value);
                  setColChanged(true);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Kolom Label
              </label>
              <select
                value={labelCol}
                onChange={(e) => {
                  setLabelCol(e.target.value);
                  setColChanged(true);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        )}
      </div>

      {/* Distribusi Kelas */}
      {showDistribution && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">
            Distribusi Kelas
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ClassDistribution
              title="Dataset Raw"
              distribution={ds.class_distribution_raw}
              colorClass="bg-blue-400"
            />
            {ds.preprocessing_status === "completed" && (
              <ClassDistribution
                title="Dataset Preprocessed"
                distribution={ds.class_distribution_preprocessed}
                colorClass="bg-green-400"
              />
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Tab headers */}
        <div className="flex border-b">
          {[
            { key: "raw", label: "Data Asli (Raw)" },
            { key: "preprocessed", label: "Data Preprocessed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
