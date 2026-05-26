"use client";

import { useEffect } from "react";
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
import { useSSE } from "@/hooks/useSSE";

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

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SSE: replace auto-refresh interval ────────────────────────────────────
  useSSE("/api/sse/training-jobs", {
    onMessage: (data, eventType) => {
      if (eventType === "init") {
        // State awal: update jobs yang ada di list
        const incoming = data.jobs || [];
        if (incoming.length > 0) {
          useTrainingStore.setState((state) => {
            const updated = [...state.jobs];
            incoming.forEach((newJob) => {
              const idx = updated.findIndex((j) => j.id === newJob.id);
              if (idx >= 0) updated[idx] = newJob;
            });
            return { jobs: updated };
          });
        }
      }

      if (eventType === "update") {
        // Update satu job di list
        useTrainingStore.setState((state) => {
          const exists = state.jobs.some((j) => j.id === data.id);
          if (exists) {
            return {
              jobs: state.jobs.map((j) => (j.id === data.id ? data : j)),
            };
          }
          // Job baru (baru saja dibuat) — tambahkan ke awal dan fetch ulang untuk total
          fetchJobs();
          return {};
        });
      }
    },
  });
  // ── end SSE ────────────────────────────────────────────────────────────────

  const from = total === 0 ? 0 : (page - 1) * 15 + 1;
  const to = Math.min(page * 15, total);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-(--text-primary)">
            Training Job
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Pantau dan kelola proses pelatihan model
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          <Plus size={16} /> Buat Training Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
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
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">Semua Model</option>
          <option value="mbert">mBERT</option>
          <option value="xlmr">XLM-R</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
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
                    className="px-4 py-3.5 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 w-20 rounded-md bg-(--bg-elevated)" />
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <div className="h-7 w-14 rounded-md bg-(--bg-elevated)" />
                    </td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-elevated)">
                      <BrainCircuit
                        size={32}
                        className="text-(--text-tertiary)"
                      />
                    </div>
                    <p className="text-sm font-semibold text-(--text-primary)">
                      Belum ada training job
                    </p>
                    <p className="mt-1 text-xs text-(--text-tertiary)">
                      Klik &quot;Buat Training Job&quot; untuk mulai
                    </p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group transition-colors duration-150 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-4">
                      <p className="max-w-[180px] truncate leading-tight font-medium text-(--text-primary) transition-colors group-hover:text-(--accent)">
                        {job.display_name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-(--text-tertiary)">
                        {job.id.slice(0, 8)}...
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          job.model_type === "xlmr"
                            ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                            : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                        }`}
                      >
                        {job.model_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-4 text-xs font-medium text-(--text-secondary)">
                      {job.dataset_name ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[11px] text-(--text-secondary)">
                      {job.split_info ? (
                        <div className="flex flex-col gap-1 tracking-wide uppercase">
                          <span>
                            <strong className="text-(--text-primary)">
                              {job.split_info.train_total?.toLocaleString("id")}
                            </strong>{" "}
                            train
                          </span>
                          <span>
                            <strong className="text-(--text-primary)">
                              {job.split_info.test_total?.toLocaleString("id")}
                            </strong>{" "}
                            test
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="min-w-[120px] px-4 py-4">
                      {job.status === "running" ? (
                        <div>
                          <span className="mb-1.5 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                            Epoch {job.current_epoch}/{job.total_epochs}
                          </span>
                          <ProgressBar
                            progress={job.progress}
                            status={job.status}
                          />
                        </div>
                      ) : job.status === "completed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-2 py-1 text-[11px] font-semibold text-(--text-secondary)">
                          Acc:{" "}
                          {job.final_accuracy !== null ? (
                            <span className="text-(--accent)">
                              {(job.final_accuracy * 100).toFixed(1)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] text-(--text-tertiary)">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-(--text-tertiary)">
                      {job.created_at
                        ? formatDate(job.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          onClick={() => openDetailModal(job)}
                          title="Lihat detail"
                          className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--accent-muted)/30 hover:text-(--accent) focus:ring-2 focus:ring-(--accent-muted) focus:outline-none"
                        >
                          <Eye size={16} />
                        </button>
                        {["queued", "running"].includes(job.status) && (
                          <button
                            onClick={() => openCancelModal(job)}
                            title="Batalkan"
                            className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--error-muted)/30 hover:text-(--error) focus:ring-2 focus:ring-(--error-muted) focus:outline-none"
                          >
                            <Ban size={16} />
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
          <div className="flex items-center justify-between border-t border-(--border-default) bg-(--bg-elevated) px-4 py-3">
            <p className="text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              {from}–{to} dari{" "}
              <span className="font-bold text-(--text-primary)">{total}</span>{" "}
              job
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-40 disabled:hover:bg-(--bg-surface)"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-[11px] font-semibold text-(--text-secondary)">
                {page}{" "}
                <span className="text-(--text-tertiary)">/ {totalPages}</span>
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-40 disabled:hover:bg-(--bg-surface)"
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
