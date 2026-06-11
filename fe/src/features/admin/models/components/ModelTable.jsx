"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Cpu,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/helpers/formatter";
import useModelStore from "../store";
import modelsApi from "../api";
import ModelDetailModal from "./modal/ModelDetailModal";
import EditModelModal from "./modal/EditModelModal";
import DeleteConfirmModal from "./modal/EditConfirmModal";
import { MetricPill } from "./ui/Pill";
import { useRouter } from "next/navigation";

export default function ModelTable() {
  const router = useRouter();
  const {
    models,
    total,
    totalPages,
    page,
    perPage,
    modelTypeFilter,
    isActiveFilter,
    sortBy,
    search,
    datasetFilter,
    isLoading,
    fetchModels,
    setPage,
    setSearch,
    setDatasetFilter,
    setModelTypeFilter,
    setIsActiveFilter,
    setSortBy,
    openEditModal,
    openDeleteModal,
    updateModel,
  } = useModelStore();

  const [pendingToggleId, setPendingToggleId] = useState(null);
  const [localSearch, setLocalSearch] = useState(search);
  const [datasetOptions, setDatasetOptions] = useState([]);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchModels();
    const loadDatasets = async () => {
      try {
        const { data } = await modelsApi.getEvaluationDatasets();
        if (data.success) {
          setDatasetOptions(data.data);
        }
      } catch (err) {
        console.error("Failed to load datasets:", err);
      }
    };
    loadDatasets();
    return () => {
      useModelStore.setState({ isLoading: true });
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

  const handleToggleActive = async (model) => {
    if (pendingToggleId === model.id) return;
    setPendingToggleId(model.id);
    try {
      const result = await updateModel(model.id, {
        is_active: !model.is_active,
      });
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setPendingToggleId((current) => (current === model.id ? null : current));
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <Cpu size={20} className="text-(--accent)" />
            Trained Models
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage fine-tuned models
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-tertiary)"
          />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search models..."
            className="w-full rounded-lg border border-(--border-default) bg-(--bg-elevated) py-2 pr-8 pl-9 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
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
          value={datasetFilter}
          onChange={(e) => setDatasetFilter(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">All Datasets</option>
          {datasetOptions.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>

        <select
          value={modelTypeFilter}
          onChange={(e) => setModelTypeFilter(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">All Architectures</option>
          <option value="mbert">mBERT</option>
          <option value="xlmr">XLM-R</option>
        </select>
        <select
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="created_at">Latest</option>
          <option value="accuracy">Accuracy</option>
          <option value="f1_score">F1 Score</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                {[
                  "Model Name",
                  "Architecture",
                  "Dataset",
                  "Classes",
                  "Accuracy",
                  "Status",
                  "Created",
                  "Action",
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
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-6 w-20 rounded-md bg-(--bg-elevated)" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-elevated)">
                      <BrainCircuit
                        size={32}
                        className="text-(--text-tertiary)"
                      />
                    </div>
                    <p className="text-sm font-semibold text-(--text-primary)">
                      No models yet
                    </p>
                    <p className="mt-1 text-xs text-(--text-tertiary)">
                      Models will appear after training is complete
                    </p>
                  </td>
                </tr>
              ) : (
                models.map((model) => (
                  <tr
                    key={model.id}
                    onClick={() => router.push(`/admin/models/${model.id}`)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-4">
                      <p
                        title={model.name}
                        className="max-w-[180px] truncate leading-tight font-medium text-(--text-primary) transition-colors group-hover:text-(--accent)"
                      >
                        {model.name}
                      </p>
                      {model.description && (
                        <p
                          title={model.description}
                          className="mt-1 max-w-[180px] truncate font-mono text-[11px] text-(--text-tertiary)"
                        >
                          {model.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          model.model_type === "xlmr"
                            ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                            : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                        }`}
                      >
                        {model.model_type?.toUpperCase()}
                      </span>
                    </td>
                    <td
                      title={model.job?.dataset_name}
                      className="max-w-[120px] truncate px-4 py-4 text-sm font-medium tracking-wide text-(--text-secondary)"
                    >
                      {model.job?.dataset_name ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-(--text-secondary)">
                      {model.num_labels ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <MetricPill
                        value={model.accuracy}
                        color="text-(--accent)"
                      />
                    </td>

                    <td className="px-4 py-4">
                      {model.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--success-muted)/50 bg-(--success-muted)/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--success) uppercase">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-strong) bg-(--bg-elevated) px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[11px] font-medium text-(--text-tertiary)">
                      {model.created_at
                        ? formatDate(model.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-start gap-1.5 opacity-50 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(model);
                          }}
                          title="Edit"
                          className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--warning-muted)/30 hover:text-(--warning) focus:ring-2 focus:ring-(--warning-muted) focus:outline-none"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(model);
                          }}
                          disabled={pendingToggleId === model.id}
                          title={model.is_active ? "Deactivate" : "Activate"}
                          className={`rounded-md p-1.5 transition-colors focus:ring-2 focus:outline-none disabled:opacity-50 ${
                            model.is_active
                              ? "text-(--text-tertiary) hover:bg-(--warning-muted)/30 hover:text-(--warning) focus:ring-(--warning-muted)"
                              : "text-(--text-tertiary) hover:bg-(--success-muted)/30 hover:text-(--success) focus:ring-(--success-muted)"
                          }`}
                        >
                          {model.is_active ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(model);
                          }}
                          title="Delete"
                          className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--error-muted)/30 hover:text-(--error) focus:ring-2 focus:ring-(--error-muted) focus:outline-none"
                        >
                          <Trash2 size={16} />
                        </button>
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
              {from}–{to} of{" "}
              <span className="font-bold text-(--text-primary)">{total}</span>{" "}
              models
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

      <ModelDetailModal />
      <EditModelModal />
      <DeleteConfirmModal />
    </div>
  );
}
