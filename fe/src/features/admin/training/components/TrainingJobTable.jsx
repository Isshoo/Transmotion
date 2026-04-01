"use client";

import { useEffect, useRef } from "react";
import {
  Plus,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Ban,
  Eye,
} from "lucide-react";
import { formatDate } from "@/helpers/formatter";
import useTrainingStore from "../store";
import CreateJobModal from "./modal/CreateJobModal";
import JobDetailModal from "./modal/JobDetailModal";
import CancelConfirmModal from "./modal/CancelConfirmModal";
import { ProgressBar } from "./ui/Bar";
import { StatusBadge } from "./ui/Badge";

export default function TrainingJobTable() {
  const {
    jobs,
    total,
    totalPages,
    page,
    statusFilter,
    modelTypeFilter,
    isLoading,
    fetchJobs,
    setPage,
    setStatusFilter,
    setModelTypeFilter,
    openCreateModal,
    openDetailModal,
    openCancelModal,
  } = useTrainingStore();

  // Auto-refresh saat ada job yang running/queued
  const autoRefreshRef = useRef(null);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearInterval(autoRefreshRef.current);
    const hasActive = jobs.some((j) =>
      ["queued", "running"].includes(j.status)
    );
    if (hasActive) {
      autoRefreshRef.current = setInterval(() => fetchJobs(), 300000);
    }
    return () => clearInterval(autoRefreshRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const from = total === 0 ? 0 : (page - 1) * 15 + 1;
  const to = Math.min(page * 15, total);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Training Job</h1>
          <p className="text-sm text-gray-500">
            Pantau dan kelola proses pelatihan model
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} /> Buat Training Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="queued">Menunggu</option>
          <option value="running">Berjalan</option>
          <option value="completed">Selesai</option>
          <option value="failed">Gagal</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <select
          value={modelTypeFilter}
          onChange={(e) => setModelTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Model</option>
          <option value="mbert">mBERT</option>
          <option value="xlmr">XLM-R</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  "Nama Job",
                  "Model",
                  "Dataset",
                  "Split",
                  "Progress",
                  "Status",
                  "Dibuat",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 rounded bg-gray-100" />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="h-7 w-14 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <BrainCircuit
                      size={32}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      Belum ada training job
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Klik &quot;Buat Training Job&quot; untuk mulai
                    </p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate leading-tight font-medium text-gray-800">
                        {job.display_name}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                        {job.id.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${job.model_type === "xlmr" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}
                      >
                        {job.model_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-xs text-gray-600">
                      {job.dataset_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {job.split_info ? (
                        <>
                          <span>
                            {job.split_info.train_total?.toLocaleString("id")}{" "}
                            train
                          </span>
                          <br />
                          <span>
                            {job.split_info.test_total?.toLocaleString("id")}{" "}
                            test
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="min-w-[120px] px-4 py-3">
                      {job.status === "running" ? (
                        <div>
                          <span className="text-xs text-gray-500">
                            Epoch {job.current_epoch}/{job.total_epochs}
                          </span>
                          <ProgressBar
                            progress={job.progress}
                            status={job.status}
                          />
                        </div>
                      ) : job.status === "completed" ? (
                        <span className="text-xs text-gray-700">
                          {job.final_accuracy !== null
                            ? `Acc: ${(job.final_accuracy * 100).toFixed(1)}%`
                            : "—"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {job.created_at
                        ? formatDate(job.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(job)}
                          title="Lihat detail"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={15} />
                        </button>
                        {["queued", "running"].includes(job.status) && (
                          <button
                            onClick={() => openCancelModal(job)}
                            title="Batalkan"
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-gray-500">
              {from}–{to} dari{" "}
              <span className="font-medium text-gray-700">{total}</span> job
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

      <CreateJobModal />
      <JobDetailModal />
      <CancelConfirmModal />
    </div>
  );
}
