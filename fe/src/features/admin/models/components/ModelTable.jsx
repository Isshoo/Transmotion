"use client";

import { useEffect } from "react";
import {
  BrainCircuit,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/helpers/formatter";
import useModelStore from "../store";
import ModelDetailModal from "./ModelDetailModal";
import EditModelModal from "./EditModelModal";

function MetricPill({ value, color }) {
  if (value === null) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {(value * 100).toFixed(1)}%
    </span>
  );
}

function DeleteConfirmModal() {
  const {
    isDeleteModalOpen,
    deleteTarget,
    isSubmitting,
    closeDeleteModal,
    deleteModel,
  } = useModelStore();
  if (!isDeleteModalOpen || !deleteTarget) return null;

  const handleConfirm = async () => {
    const result = await deleteModel(deleteTarget.id);
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
          Hapus Model?
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Model{" "}
          <span className="font-medium text-gray-700">{deleteTarget.name}</span>{" "}
          dan file-nya akan dihapus permanen.
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

export default function ModelTable() {
  const {
    models,
    total,
    totalPages,
    page,
    modelTypeFilter,
    isActiveFilter,
    sortBy,
    isLoading,
    fetchModels,
    setPage,
    setModelTypeFilter,
    setIsActiveFilter,
    setSortBy,
    openDetailModal,
    openEditModal,
    openDeleteModal,
    updateModel,
  } = useModelStore();

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const from = total === 0 ? 0 : (page - 1) * 15 + 1;
  const to = Math.min(page * 15, total);

  const handleToggleActive = async (model) => {
    const result = await updateModel(model.id, { is_active: !model.is_active });
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Model Terlatih
          </h1>
          <p className="text-sm text-gray-500">
            Kelola model hasil fine-tuning
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={modelTypeFilter}
          onChange={(e) => setModelTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Arsitektur</option>
          <option value="mbert">mBERT</option>
          <option value="xlmr">XLM-R</option>
        </select>
        <select
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="created_at">Terbaru</option>
          <option value="accuracy">Accuracy</option>
          <option value="f1_score">F1 Score</option>
          <option value="name">Nama</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  "Nama Model",
                  "Arsitektur",
                  "Dataset",
                  "Kelas",
                  "Accuracy",
                  "F1",
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
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 rounded bg-gray-100" />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="h-7 w-16 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <BrainCircuit
                      size={32}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="text-sm font-medium text-gray-500">
                      Belum ada model
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Model akan muncul setelah training selesai
                    </p>
                  </td>
                </tr>
              ) : (
                models.map((model) => (
                  <tr
                    key={model.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] truncate leading-tight font-medium text-gray-800">
                        {model.name}
                      </p>
                      {model.description && (
                        <p className="max-w-[180px] truncate text-xs text-gray-400">
                          {model.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${model.model_type === "xlmr" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}
                      >
                        {model.model_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-3 text-xs text-gray-600">
                      {model.job?.dataset_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {model.num_labels ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <MetricPill
                        value={model.accuracy}
                        color="text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <MetricPill
                        value={model.f1_score}
                        color="text-green-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {model.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={10} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          <XCircle size={10} /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {model.created_at
                        ? formatDate(model.created_at, "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(model)}
                          title="Detail"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(model)}
                          title="Edit"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(model)}
                          title={model.is_active ? "Nonaktifkan" : "Aktifkan"}
                          className={`rounded-md p-1.5 transition ${model.is_active ? "text-gray-400 hover:bg-orange-50 hover:text-orange-500" : "text-gray-400 hover:bg-green-50 hover:text-green-600"}`}
                        >
                          {model.is_active ? (
                            <XCircle size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteModal(model)}
                          title="Hapus"
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={14} />
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
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-gray-500">
              {from}–{to} dari{" "}
              <span className="font-medium text-gray-700">{total}</span> model
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

      <ModelDetailModal />
      <EditModelModal />
      <DeleteConfirmModal />
    </div>
  );
}
