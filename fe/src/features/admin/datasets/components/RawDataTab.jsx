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
    <div className="space-y-3">
      {/* Filters */}
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
                setRawSearch(datasetId, "");
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        {labels.length > 0 && (
          <select
            value={rawFilterLabel}
            onChange={(e) => setRawFilterLabel(datasetId, e.target.value)}
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
        <span className="ml-auto text-xs text-gray-400">
          {rawTotal.toLocaleString("id")} baris
        </span>
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
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-xs font-semibold whitespace-nowrap text-gray-500 uppercase"
                  >
                    {col}
                    {col === dataset.text_column && (
                      <span className="ml-1 text-blue-400">(teks)</span>
                    )}
                    {col === dataset.label_column && (
                      <span className="ml-1 text-green-500">(label)</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingRaw ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 py-2">
                      <div className="h-3 w-6 rounded bg-gray-200" />
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2">
                        <div className="h-3 w-32 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rawRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-3 py-10 text-center text-sm text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                rawRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {from + i}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="max-w-[300px] px-3 py-2 text-gray-700"
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
          <p className="text-xs text-gray-500">
            {from}–{to} dari {rawTotal.toLocaleString("id")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRawPage(datasetId, 1)}
              disabled={rawPage <= 1}
              className="flex h-7 items-center justify-center rounded-md border border-gray-200 px-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setRawPage(datasetId, rawPage - 1)}
              disabled={rawPage <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-2 text-xs text-gray-600">
              {rawPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setRawPage(datasetId, rawPage + 1)}
              disabled={rawPage >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setRawPage(datasetId, totalPages)}
              disabled={rawPage >= totalPages}
              className="flex h-7 items-center justify-center rounded-md border border-gray-200 px-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={13} />
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
