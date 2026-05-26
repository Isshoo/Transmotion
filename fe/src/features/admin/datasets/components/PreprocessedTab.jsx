"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import { useParams } from "next/navigation";
import PreprocessModal from "./modal/PreprocessModal";
import RowFormModal from "./modal/RowFormModal";

// ── Komponen utama ─────────────────────────────────────────────

export default function PreprocessedTab({ dataset }) {
  const { id: datasetId } = useParams();
  const {
    preprocessedRows,
    preprocessedTotal,
    preprocessedPage,
    preprocessedPerPage,
    preprocessedSearch,
    preprocessedFilterLabel,
    isLoadingPreprocessed,
    isSubmitting,
    fetchPreprocessedData,
    setPreprocessedPage,
    setPreprocessedSearch,
    setPreprocessedFilterLabel,
    deletePreprocessedRow,
  } = useDatasetStore();

  const [localSearch, setLocalSearch] = useState(preprocessedSearch);
  const [showPreprocessModal, setShowPreprocessModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const searchTimeout = useRef(null);

  const hasPreprocessed = (dataset.num_rows_preprocessed ?? 0) > 0;
  const isRunning = dataset.preprocessing_status === "running";
  const isNotConfigured = !dataset.columns_configured;

  useEffect(() => {
    if (hasPreprocessed) {
      fetchPreprocessedData(datasetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, hasPreprocessed]);

  const handleSearch = (v) => {
    setLocalSearch(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(
      () => setPreprocessedSearch(datasetId, v),
      400
    );
  };

  const handleDelete = async (row) => {
    const result = await deletePreprocessedRow(datasetId, row.id);
    if (result.success) {
      toast.success("Data berhasil dihapus");
      setDeleteTarget(null);
    } else toast.error(result.message);
  };

  const labels = Object.keys(dataset.class_distribution_preprocessed ?? {});
  const totalPages = Math.ceil(preprocessedTotal / preprocessedPerPage);
  const from =
    preprocessedTotal === 0
      ? 0
      : (preprocessedPage - 1) * preprocessedPerPage + 1;
  const to = Math.min(
    preprocessedPage * preprocessedPerPage,
    preprocessedTotal
  );

  // ── Banner: belum dipreprocess ─────────────────────────────────
  if (!hasPreprocessed && !isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-(--accent-muted) shadow-(--shadow-accent)">
          <Cpu size={28} className="text-(--accent)" />
        </div>
        <h3 className="mb-2 text-base font-semibold tracking-tight text-(--text-primary)">
          Dataset Belum Dipreprocess
        </h3>
        <p className="mb-1 max-w-sm text-sm text-(--text-secondary)">
          Lakukan preprocessing untuk membersihkan teks dari noise (URL,
          mention, dll) dan menghasilkan dataset siap training.
        </p>
        {isNotConfigured && (
          <p className="mb-4 text-xs font-medium text-(--warning)">
            ⚠ Atur kolom teks dan label terlebih dahulu di bagian
            &quot;Pengaturan Kolom&quot; di atas.
          </p>
        )}
        <button
          onClick={() => setShowPreprocessModal(true)}
          disabled={isNotConfigured}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-(--accent) px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Cpu size={15} /> Mulai Preprocessing
        </button>
        {showPreprocessModal && (
          <PreprocessModal
            datasetId={datasetId}
            dataset={dataset}
            onClose={() => setShowPreprocessModal(false)}
          />
        )}
      </div>
    );
  }

  // ── Banner: sedang preprocessing ───────────────────────────────
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 size={36} className="mb-5 animate-spin text-(--accent)" />
        <h3 className="mb-1 text-base font-semibold tracking-tight text-(--text-primary)">
          Preprocessing Berjalan
        </h3>
        <p className="max-w-sm text-sm text-(--text-secondary)">
          Sedang memproses {dataset.num_rows_raw?.toLocaleString("id")} baris
          data. Halaman ini akan otomatis diperbarui saat selesai.
        </p>
      </div>
    );
  }

  // ── Tab data preprocessed ──────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-tertiary)"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari teks..."
            className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) py-1.5 pr-8 pl-8 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setPreprocessedSearch(datasetId, "");
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {labels.length > 0 && (
          <select
            value={preprocessedFilterLabel}
            onChange={(e) =>
              setPreprocessedFilterLabel(datasetId, e.target.value)
            }
            className="rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-1.5 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          >
            <option value="">Semua Label</option>
            {labels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="mr-2 text-xs text-(--text-tertiary)">
            {preprocessedTotal.toLocaleString("id")} baris
          </span>
          <button
            onClick={() => setShowPreprocessModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) px-3 py-1.5 text-xs font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <RefreshCw size={12} /> Preprocess Ulang
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
          >
            <Plus size={12} /> Tambah Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                <th className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  #
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  Teks Asli
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  Teks Preprocessed
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  Label
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoadingPreprocessed ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-24 animate-pulse rounded bg-(--bg-elevated)" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : preprocessedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-(--text-disabled)"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                preprocessedRows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="transition-colors duration-100 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-2.5 text-xs text-(--text-tertiary) tabular-nums">
                      {from + i}
                    </td>
                    <td className="max-w-[220px] px-4 py-2.5">
                      <span className="line-clamp-2 text-xs text-(--text-secondary)">
                        {row.raw_text}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-4 py-2.5">
                      <span className="line-clamp-2 text-xs font-medium text-(--text-primary)">
                        {row.preprocessed_text}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-(--accent-muted) px-2 py-0.5 text-[10px] font-semibold tracking-wider text-(--accent) uppercase">
                        {row.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditRow(row)}
                          title="Edit"
                          className="rounded-md p-1.5 text-(--text-tertiary) transition-all duration-150 hover:bg-(--accent-muted) hover:text-(--accent)"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(row)}
                          title="Hapus"
                          className="rounded-md p-1.5 text-(--text-tertiary) transition-all duration-150 hover:bg-(--error-muted) hover:text-(--error)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {preprocessedTotal > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-(--text-tertiary)">
            <span className="font-medium text-(--text-secondary)">
              {from}–{to}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-(--text-secondary)">
              {preprocessedTotal.toLocaleString("id")}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreprocessedPage(datasetId, 1)}
              disabled={preprocessedPage <= 1}
              className="flex h-7 items-center justify-center rounded-md border border-(--border-default) px-2 text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={13} />
              <ChevronLeft size={13} className="-ml-1.5" />
            </button>
            <button
              onClick={() =>
                setPreprocessedPage(datasetId, preprocessedPage - 1)
              }
              disabled={preprocessedPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="min-w-12 text-center text-xs text-(--text-tertiary)">
              {preprocessedPage} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPreprocessedPage(datasetId, preprocessedPage + 1)
              }
              disabled={preprocessedPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setPreprocessedPage(datasetId, totalPages)}
              disabled={preprocessedPage >= totalPages}
              className="flex h-7 items-center justify-center rounded-md border border-(--border-default) px-2 text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={13} className="-mr-1.5" />
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPreprocessModal && (
        <PreprocessModal
          datasetId={datasetId}
          dataset={dataset}
          onClose={() => setShowPreprocessModal(false)}
        />
      )}
      {(showAddModal || editRow) && (
        <RowFormModal
          datasetId={datasetId}
          dataset={dataset}
          editRow={editRow ?? null}
          onClose={() => {
            setShowAddModal(false);
            setEditRow(null);
          }}
        />
      )}
      {deleteTarget && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-sm rounded-xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-lg)">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-(--error-muted)">
              <Trash2 size={20} className="text-(--error)" />
            </div>
            <h2 className="mb-1.5 text-base font-semibold tracking-tight text-(--text-primary)">
              Hapus Data?
            </h2>
            <p className="mb-3 text-sm text-(--text-secondary)">
              Data berikut akan dihapus secara permanen:
            </p>
            <div className="mb-5 line-clamp-3 rounded-lg border border-(--border-default) bg-(--bg-elevated) p-3 text-xs leading-relaxed text-(--text-secondary)">
              {deleteTarget.preprocessed_text}
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isSubmitting}
                className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isSubmitting}
                className="rounded-md bg-(--error) px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#dc2626] disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
