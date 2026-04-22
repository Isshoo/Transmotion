"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import useDatasetStore from "../store";
import { formatDate } from "@/helpers/formatter";
import DatasetUploadModal from "./modal/DatasetUploadModal";
import DeleteConfirmModal from "./modal/DeleteConfirmModal";
import { SizeLabel } from "./ui/Label";
import { PreprocessBadge } from "./ui/Badge";

export default function DatasetTable() {
  const router = useRouter();
  const {
    datasets,
    total,
    totalPages,
    page,
    perPage,
    search,
    statusFilter,
    isLoading,
    fetchDatasets,
    setPage,
    setSearch,
    setStatusFilter,
    openUploadModal,
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="uploaded">Uploaded</option>
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
                  "Nama Dataset",
                  "Baris (Raw)",
                  "Baris (Preprocessed)",
                  "Ukuran",
                  "Status",
                  "Diupload",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase"
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
                      <div className="ml-auto h-7 w-8 rounded bg-gray-100" />
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
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => router.push(`/admin/datasets/${ds.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="leading-tight font-medium text-gray-800">
                        {ds.name}
                      </p>
                      <p className="text-xs text-gray-400">{ds.file_name}</p>
                      {ds.columns_configured && (
                        <p className="mt-0.5 text-xs text-blue-500">
                          Teks: {ds.text_column} · Label: {ds.label_column}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ds.num_rows_raw !== null
                        ? ds.num_rows_raw.toLocaleString("id")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ds.num_rows_preprocessed !== null
                        ? ds.num_rows_preprocessed.toLocaleString("id")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <SizeLabel bytes={ds.file_size} />
                    </td>
                    <td className="px-4 py-3">
                      <PreprocessBadge status={ds.preprocessing_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {ds.created_at
                        ? formatDate(ds.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(ds);
                        }}
                        title="Hapus"
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-xs text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <DatasetUploadModal />
      <DeleteConfirmModal />
    </div>
  );
}
