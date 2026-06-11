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

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[200px] flex-col justify-between rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)"
            >
              <div className="space-y-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-(--bg-elevated)" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-(--bg-elevated)" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-(--bg-elevated)" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 animate-pulse rounded-full bg-(--bg-elevated)" />
                <div className="h-8 w-8 animate-pulse rounded-md bg-(--bg-elevated)" />
              </div>
            </div>
          ))}
        </div>
      ) : datasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-(--border-default) bg-(--bg-surface) px-4 py-20 text-center">
          <Database size={40} className="mb-4 text-(--text-disabled)" />
          <p className="text-base font-medium text-(--text-primary)">
            Belum ada dataset
          </p>
          <p className="mt-1.5 text-sm text-(--text-tertiary)">
            Klik &quot;Upload Dataset&quot; untuk mulai menambahkan dataset
            baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              onClick={() => router.push(`/admin/datasets/${ds.id}`)}
              className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm) transition-all duration-200 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:shadow-(--shadow-md)"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3
                      title={ds.name}
                      className="truncate text-base font-semibold tracking-tight text-(--text-primary) transition-colors group-hover:text-(--accent)"
                    >
                      {ds.name}
                    </h3>
                    <p
                      title={ds.file_name}
                      className="mt-1 truncate font-mono text-[11px] text-(--text-tertiary)"
                    >
                      {ds.file_name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(ds);
                    }}
                    title="Hapus"
                    className="shrink-0 rounded-md p-1.5 text-(--text-tertiary) opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-(--error-muted)/30 hover:text-(--error) focus:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {ds.columns_configured ? (
                  <div className="inline-flex flex-wrap items-center gap-1.5 rounded-md border border-(--accent-muted) bg-(--accent-muted)/10 px-2 py-1 text-[11px]">
                    <span className="font-medium text-(--text-secondary)">
                      Teks:
                    </span>
                    <span className="font-semibold text-(--accent)">
                      {ds.text_column}
                    </span>
                    <span className="mx-0.5 text-(--text-tertiary)">·</span>
                    <span className="font-medium text-(--text-secondary)">
                      Label:
                    </span>
                    <span className="font-semibold text-(--accent)">
                      {ds.label_column}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex rounded-md border border-(--warning-muted) bg-(--warning-muted)/10 px-2 py-1 text-[11px] font-medium text-(--warning)">
                    Kolom belum diatur
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                      Raw
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-(--text-primary)">
                      {ds.num_rows_raw !== null
                        ? ds.num_rows_raw.toLocaleString("id") + " rows"
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                      Preprocessed
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-(--text-primary)">
                      {ds.num_rows_preprocessed !== null
                        ? ds.num_rows_preprocessed.toLocaleString("id") +
                          " rows"
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-(--border-subtle) pt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <PreprocessBadge status={ds.preprocessing_status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-(--text-tertiary)">
                    <SizeLabel bytes={ds.file_size} />
                    <span>•</span>
                    <span>
                      {ds.created_at
                        ? formatDate(ds.created_at, "dd MMM yyyy")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-(--border-default) bg-(--bg-surface) px-4 py-3">
          <p className="text-xs text-(--text-tertiary)">
            Menampilkan{" "}
            <span className="font-medium text-(--text-secondary)">
              {from}–{to}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-(--text-secondary)">{total}</span>{" "}
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

      <DatasetUploadModal />
      <DeleteConfirmModal />
    </div>
  );
}
