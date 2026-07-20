"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import useDatasetStore from "../store";
import { useParams } from "next/navigation";

export default function RawDataTab({ dataset }) {
  const { id: datasetId } = useParams();
  const {
    rawRows,
    rawTotal,
    rawPage,
    rawPerPage,
    rawSearch,
    rawFilterLabel,
    isLoadingRaw,
    fetchRawData,
    setRawPage,
    setRawSearch,
    setRawFilterLabel,
  } = useDatasetStore();

  const [localSearch, setLocalSearch] = useState(rawSearch);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchRawData(datasetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  const handleSearch = (v) => {
    setLocalSearch(v);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setRawSearch(datasetId, v), 400);
  };

  const columns = dataset.columns ?? [];
  const labels = Object.keys(dataset.class_distribution_raw ?? {});
  const totalPages = Math.ceil(rawTotal / rawPerPage);
  const from = rawTotal === 0 ? 0 : (rawPage - 1) * rawPerPage + 1;
  const to = Math.min(rawPage * rawPerPage, rawTotal);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-xs flex-1 sm:max-w-md">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-tertiary)"
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search text..."
            className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) py-1.5 pr-8 pl-8 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setRawSearch(datasetId, "");
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {labels.length > 0 && (
          <select
            value={rawFilterLabel}
            onChange={(e) => setRawFilterLabel(datasetId, e.target.value)}
            className="w-full max-w-[160px] rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-1.5 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          >
            <option value="">All Labels</option>
            {labels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-xs text-(--text-tertiary)">
          {rawTotal.toLocaleString("id")} rows
        </span>
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
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-(--text-tertiary) uppercase"
                  >
                    {col}
                    {col === dataset.text_column && (
                      <span className="ml-1 text-(--accent)">(text)</span>
                    )}
                    {col === dataset.label_column && (
                      <span className="ml-1 text-(--success)">(label)</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoadingRaw ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="h-3 w-6 animate-pulse rounded bg-(--bg-elevated)" />
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-3">
                        <div className="h-3 w-32 animate-pulse rounded bg-(--bg-elevated)" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !rawRows || rawRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-sm text-(--text-disabled)"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                rawRows.map((row, i) => (
                  <tr
                    key={i}
                    className="transition-colors duration-100 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-2.5 text-xs text-(--text-tertiary) tabular-nums">
                      {from + i}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        title={row[col]}
                        className="max-w-[300px] px-4 py-2.5 text-(--text-primary)"
                      >
                        <span className="line-clamp-2 text-xs">
                          {row[col] ?? ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {rawTotal > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-(--text-tertiary)">
            <span className="font-medium text-(--text-secondary)">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-medium text-(--text-secondary)">
              {rawTotal.toLocaleString("id")}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRawPage(datasetId, 1)}
              disabled={rawPage <= 1}
              className="flex h-7 items-center justify-center rounded-md border border-(--border-default) px-2 text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={13} />
              <ChevronLeft size={13} className="-ml-1.5" />
            </button>
            <button
              onClick={() => setRawPage(datasetId, rawPage - 1)}
              disabled={rawPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="min-w-12 text-center text-xs text-(--text-tertiary)">
              {rawPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setRawPage(datasetId, rawPage + 1)}
              disabled={rawPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setRawPage(datasetId, totalPages)}
              disabled={rawPage >= totalPages}
              className="flex h-7 items-center justify-center rounded-md border border-(--border-default) px-2 text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={13} className="-mr-1.5" />
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
