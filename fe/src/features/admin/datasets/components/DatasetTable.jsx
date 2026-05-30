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
    return () => {
      useDatasetStore.setState({ isLoading: true });
    };
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <Database size={20} className="text-(--accent)" />
            Manajemen Dataset
          </h1>
          <p className="mt-0.5 text-sm text-(--text-secondary)">
            Upload dan kelola dataset untuk training model
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={15} /> Upload Dataset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-tertiary)"
          />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Cari dataset..."
            className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) py-2 pr-8 pl-9 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setSearch("");
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">Semua Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="ready">Siap</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default)">
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
                    className="bg-(--bg-elevated) px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-(--text-tertiary) uppercase"
                  >
                    {h}
                  </th>
                ))}
                <th className="bg-(--bg-elevated) px-4 py-3 text-right text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5">
                      <div className="h-3 w-40 animate-pulse rounded bg-(--bg-elevated)" />
                    </td>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3 w-16 animate-pulse rounded bg-(--bg-elevated)" />
                      </td>
                    ))}
                    <td className="px-4 py-3.5">
                      <div className="ml-auto h-7 w-8 animate-pulse rounded bg-(--bg-elevated)" />
                    </td>
                  </tr>
                ))
              ) : datasets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Database
                      size={36}
                      className="mx-auto mb-3 text-(--text-disabled)"
                    />
                    <p className="text-sm font-medium text-(--text-secondary)">
                      Belum ada dataset
                    </p>
                    <p className="mt-1 text-xs text-(--text-tertiary)">
                      Klik &quot;Upload Dataset&quot; untuk mulai
                    </p>
                  </td>
                </tr>
              ) : (
                datasets.map((ds) => (
                  <tr
                    key={ds.id}
                    className="cursor-pointer transition-colors duration-100 hover:bg-(--bg-overlay)"
                    onClick={() => router.push(`/admin/datasets/${ds.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="leading-tight font-medium text-(--text-primary)">
                        {ds.name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-(--text-tertiary)">
                        {ds.file_name}
                      </p>
                      {ds.columns_configured && (
                        <p className="mt-0.5 text-xs text-(--accent)">
                          Teks: {ds.text_column} · Label: {ds.label_column}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-(--text-secondary) tabular-nums">
                      {ds.num_rows_raw !== null
                        ? ds.num_rows_raw.toLocaleString("id")
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-(--text-secondary) tabular-nums">
                      {ds.num_rows_preprocessed !== null
                        ? ds.num_rows_preprocessed.toLocaleString("id")
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-(--text-secondary)">
                      <SizeLabel bytes={ds.file_size} />
                    </td>
                    <td className="px-4 py-3.5">
                      <PreprocessBadge status={ds.preprocessing_status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-(--text-tertiary)">
                      {ds.created_at
                        ? formatDate(ds.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(ds);
                        }}
                        title="Hapus"
                        className="rounded-md p-1.5 text-(--text-tertiary) transition-all duration-150 hover:bg-(--error-muted) hover:text-(--error)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t border-(--border-subtle) bg-(--bg-surface) px-4 py-3">
            <p className="text-xs text-(--text-tertiary)">
              Menampilkan{" "}
              <span className="font-medium text-(--text-secondary)">
                {from}–{to}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-(--text-secondary)">
                {total}
              </span>{" "}
              dataset
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="min-w-12 text-center text-xs text-(--text-tertiary)">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={13} />
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
