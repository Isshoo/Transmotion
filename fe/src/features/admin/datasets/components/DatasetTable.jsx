"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Settings2,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";
import { formatDate } from "@/helpers/formatter";
import DatasetUploadModal from "./DatasetUploadModal";
import DatasetPreprocessModal from "./DatasetPreprocessModal";

// ── Badge helpers ──────────────────────────────────────────────

const STATUS_STYLE = {
  uploaded: "bg-gray-100 text-gray-600",
  preprocessing: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-600",
};
const STATUS_LABEL = {
  uploaded: "Uploaded",
  preprocessing: "Processing",
  ready: "Siap",
  error: "Error",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function SizeLabel({ bytes }) {
  if (!bytes) return <span className="text-gray-400">—</span>;
  if (bytes < 1024 * 1024) return <span>{(bytes / 1024).toFixed(1)} KB</span>;
  return <span>{(bytes / 1024 / 1024).toFixed(1)} MB</span>;
}

// ── Modal hapus ────────────────────────────────────────────────

function DeleteConfirmModal() {
  const {
    isDeleteModalOpen,
    deleteTarget,
    isSubmitting,
    closeDeleteModal,
    deleteDataset,
  } = useDatasetStore();
  if (!isDeleteModalOpen || !deleteTarget) return null;

  const handleConfirm = async () => {
    const result = await deleteDataset(deleteTarget.id);
    if (result.success) {
      toast.success(result.message);
      closeDeleteModal();
    } else toast.error(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-gray-800">
          Hapus Dataset?
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Dataset{" "}
          <span className="font-medium text-gray-700">{deleteTarget.name}</span>{" "}
          akan dihapus permanen beserta filenya.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ─────────────────────────────────────────────

export default function DatasetTable() {
  const {
    datasets,
    total,
    totalPages,
    page,
    perPage,
    search,
    status,
    isLoading,
    fetchDatasets,
    setPage,
    setSearch,
    setStatus,
    openUploadModal,
    openPreprocessModal,
    openDeleteModal,
  } = useDatasetStore();

  const [localSearch, setLocalSearch] = useState(search);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setLocalSearch(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 400);
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Manajemen Dataset
          </h1>
          <p className="text-sm text-gray-500">
            Upload dan kelola dataset untuk training model
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} /> Upload Dataset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Cari dataset..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-9 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setSearch("");
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="preprocessing">Processing</option>
          <option value="ready">Siap</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  "Nama",
                  "Sampel",
                  "Label",
                  "Ukuran File",
                  "Status",
                  "Diupload",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-3 w-40 rounded bg-gray-200" />
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-16 rounded bg-gray-100" />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="ml-auto h-7 w-16 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : datasets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <Database
                      size={32}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      Belum ada dataset
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Klik &quot;Upload Dataset&quot; untuk mulai
                    </p>
                  </td>
                </tr>
              ) : (
                datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="leading-tight font-medium text-gray-800">
                        {ds.name}
                      </p>
                      {ds.description && (
                        <p className="max-w-[200px] truncate text-xs text-gray-400">
                          {ds.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">{ds.file_name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ds.num_samples !== null ? (
                        ds.num_samples.toLocaleString("id")
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ds.labels?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ds.labels.slice(0, 3).map((l) => (
                            <span
                              key={l}
                              className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                            >
                              {l}
                            </span>
                          ))}
                          {ds.labels.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{ds.labels.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <SizeLabel bytes={ds.file_size} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ds.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {ds.created_at
                        ? formatDate(ds.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preprocess — hanya untuk uploaded/error */}
                        {["uploaded", "error", "ready"].includes(ds.status) && (
                          <button
                            onClick={() => openPreprocessModal(ds)}
                            title="Preprocessing"
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Settings2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(ds)}
                          title="Hapus"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <p className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {from}–{to}
              </span>{" "}
              dari <span className="font-medium text-gray-700">{total}</span>{" "}
              dataset
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-xs text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DatasetUploadModal />
      <DatasetPreprocessModal />
      <DeleteConfirmModal />
    </div>
  );
}
