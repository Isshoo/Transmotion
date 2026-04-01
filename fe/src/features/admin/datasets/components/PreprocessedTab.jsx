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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import { useParams } from "next/navigation";

// ── Modal Preprocessing ────────────────────────────────────────

function PreprocessModal({ dataset, onClose }) {
  const { id } = useParams();
  const { isSubmitting, startPreprocessing } = useDatasetStore();
  const isRepreprocess = (dataset.num_rows_preprocessed ?? 0) > 0;

  const handleStart = async () => {
    const result = await startPreprocessing(id);
    if (result.success) {
      toast.info("Preprocessing dimulai, mohon tunggu...");
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isRepreprocess ? "Preprocessing Ulang" : "Mulai Preprocessing"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {isRepreprocess && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-xs text-amber-700">
                Data preprocessed yang ada (
                {dataset.num_rows_preprocessed?.toLocaleString("id")} baris)
                akan dihapus dan diganti dengan hasil preprocessing baru.
              </p>
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              Konfigurasi yang akan digunakan:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-500">Kolom Teks:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.text_column}
                </span>
              </div>
              <div>
                <span className="text-blue-500">Kolom Label:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.label_column}
                </span>
              </div>
              <div>
                <span className="text-blue-500">Total Data Raw:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.num_rows_raw?.toLocaleString("id")} baris
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-gray-500">
            <p className="font-medium text-gray-700">
              Proses yang akan dijalankan:
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-gray-500">
              <li>Hapus URL, email, mention (@), hashtag (#), tag HTML</li>
              <li>Normalisasi whitespace berlebih</li>
              <li>Hapus baris yang hasilnya kosong setelah preprocessing</li>
              <li>Hapus duplikat (berdasarkan teks + label)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Cpu size={14} />
              )}
              {isSubmitting ? "Memulai..." : "Mulai Preprocessing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Tambah/Edit Row ──────────────────────────────────────

function RowFormModal({ datasetId, dataset, editRow, onClose }) {
  const { isSubmitting, addPreprocessedRow, updatePreprocessedRow } =
    useDatasetStore();
  const isEdit = !!editRow;
  const labels = Object.keys(dataset.class_distribution_preprocessed ?? {});

  const [form, setForm] = useState({
    raw_text: editRow?.raw_text ?? "",
    preprocessed_text: editRow?.preprocessed_text ?? "",
    label: editRow?.label ?? labels[0] ?? "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.raw_text.trim()) e.raw_text = "Teks asli harus diisi";
    if (!form.preprocessed_text.trim())
      e.preprocessed_text = "Teks preprocessed harus diisi";
    if (!form.label) e.label = "Label harus dipilih";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = isEdit
      ? await updatePreprocessedRow(datasetId, editRow.id, {
          preprocessed_text: form.preprocessed_text.trim(),
          label: form.label,
        })
      : await addPreprocessedRow(datasetId, {
          raw_text: form.raw_text.trim(),
          preprocessed_text: form.preprocessed_text.trim(),
          label: form.label,
        });

    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit Data" : "Tambah Data"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Raw text (hanya saat tambah) */}
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Teks Asli
              </label>
              <textarea
                value={form.raw_text}
                onChange={(e) => {
                  setForm((p) => ({ ...p, raw_text: e.target.value }));
                  setErrors((p) => ({ ...p, raw_text: undefined }));
                }}
                rows={2}
                placeholder="Teks sebelum preprocessing..."
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.raw_text ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors.raw_text && (
                <p className="mt-1 text-xs text-red-500">{errors.raw_text}</p>
              )}
            </div>
          )}

          {/* Preprocessed text */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teks Preprocessed
            </label>
            <textarea
              value={form.preprocessed_text}
              onChange={(e) => {
                setForm((p) => ({ ...p, preprocessed_text: e.target.value }));
                setErrors((p) => ({ ...p, preprocessed_text: undefined }));
              }}
              rows={2}
              placeholder="Teks setelah preprocessing..."
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.preprocessed_text ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
            />
            {errors.preprocessed_text && (
              <p className="mt-1 text-xs text-red-500">
                {errors.preprocessed_text}
              </p>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Label
            </label>
            {labels.length > 0 ? (
              <select
                value={form.label}
                onChange={(e) => {
                  setForm((p) => ({ ...p, label: e.target.value }));
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {labels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.label}
                onChange={(e) => {
                  setForm((p) => ({ ...p, label: e.target.value }));
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                placeholder="Nama label..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.label ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
            )}
            {errors.label && (
              <p className="mt-1 text-xs text-red-500">{errors.label}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Cpu size={28} className="text-blue-600" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-gray-800">
          Dataset Belum Dipreprocess
        </h3>
        <p className="mb-1 max-w-sm text-sm text-gray-500">
          Lakukan preprocessing untuk membersihkan teks dari noise (URL,
          mention, dll) dan menghasilkan dataset siap training.
        </p>
        {isNotConfigured && (
          <p className="mb-4 text-xs text-amber-600">
            ⚠ Atur kolom teks dan label terlebih dahulu di bagian
            &quot;Pengaturan Kolom&quot; di atas.
          </p>
        )}
        <button
          onClick={() => setShowPreprocessModal(true)}
          disabled={isNotConfigured}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 size={36} className="mb-4 animate-spin text-blue-500" />
        <h3 className="mb-1 text-base font-semibold text-gray-800">
          Preprocessing Berjalan
        </h3>
        <p className="max-w-sm text-sm text-gray-500">
          Sedang memproses {dataset.num_rows_raw?.toLocaleString("id")} baris
          data. Halaman ini akan otomatis diperbarui saat selesai.
        </p>
      </div>
    );
  }

  // ── Tab data preprocessed ──────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari teks..."
            className="w-full rounded-lg border border-gray-300 py-1.5 pr-8 pl-8 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setPreprocessedSearch(datasetId, "");
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <span className="text-xs text-gray-400">
            {preprocessedTotal.toLocaleString("id")} baris
          </span>
          <button
            onClick={() => setShowPreprocessModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RefreshCw size={12} /> Preprocess Ulang
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={12} /> Tambah Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                  Teks Asli
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                  Teks Preprocessed
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                  Label
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingPreprocessed ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-3 py-2">
                        <div className="h-3 w-24 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : preprocessedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-10 text-center text-sm text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                preprocessedRows.map((row, i) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {from + i}
                    </td>
                    <td className="max-w-[220px] px-3 py-2">
                      <span className="line-clamp-2 text-xs text-gray-500">
                        {row.raw_text}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-3 py-2">
                      <span className="line-clamp-2 text-xs text-gray-700">
                        {row.preprocessed_text}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {row.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditRow(row)}
                          title="Edit"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(row)}
                          title="Hapus"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
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
          <p className="text-xs text-gray-500">
            {from}–{to} dari {preprocessedTotal.toLocaleString("id")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreprocessedPage(datasetId, 1)}
              disabled={preprocessedPage <= 1}
              className="flex h-7 items-center justify-center rounded-md border border-gray-200 px-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() =>
                setPreprocessedPage(datasetId, preprocessedPage - 1)
              }
              disabled={preprocessedPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-2 text-xs text-gray-600">
              {preprocessedPage} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPreprocessedPage(datasetId, preprocessedPage + 1)
              }
              disabled={preprocessedPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setPreprocessedPage(datasetId, totalPages)}
              disabled={preprocessedPage >= totalPages}
              className="flex h-7 items-center justify-center rounded-md border border-gray-200 px-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={13} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h2 className="mb-1 text-base font-semibold text-gray-800">
              Hapus Data?
            </h2>
            <p className="mb-2 text-sm text-gray-500">
              Data berikut akan dihapus:
            </p>
            <p className="mb-5 line-clamp-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {deleteTarget.preprocessed_text}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
