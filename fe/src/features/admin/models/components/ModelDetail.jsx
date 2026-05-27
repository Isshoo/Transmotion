"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle,
  XCircle,
  Pencil,
  Loader2,
  FileText,
  Clock,
  Layers,
  HardDrive,
  BarChart3,
  Tag,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import useModelStore from "../store";
import EditModelModal from "./modal/EditModelModal";
import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";
import EpochLogsTable from "@/features/admin/training/components/EpochLogsTable";

export default function ModelDetail({ modelId }) {
  const router = useRouter();
  const {
    currentModel,
    isLoadingDetail,
    isSubmitting,
    fetchModel,
    updateModel,
    openEditModal,
  } = useModelStore();

  // Satu tab global untuk Test/Val
  const [activeSplit, setActiveSplit] = useState("test");

  useEffect(() => {
    fetchModel(modelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  if (isLoadingDetail || !currentModel) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-(--accent)" />
      </div>
    );
  }

  const m = currentModel;

  const testLabels = m.confusion_matrix?.labels || [];
  const evalLabels = m.val_confusion_matrix?.labels || [];
  const hasEvalMetrics = m.val_accuracy != null || m.val_f1 != null;

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDur = (secs) => {
    if (!secs) return "—";
    const h = Math.floor(secs / 3600);
    const m2 = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}j ${m2}m` : m2 > 0 ? `${m2}m ${s}s` : `${s}s`;
  };

  const handleToggleActive = async () => {
    const result = await updateModel(m.id, { is_active: !m.is_active });
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  // Data untuk tabel distribusi prediksi
  // const predEntries = m.per_label
  //   ? Object.entries(m.per_label).sort((a, b) => b[1] - a[1])
  //   : [];
  // const predTotal = m.prediction_count || 0;

  // Metrik aktif berdasarkan tab
  const metrics =
    activeSplit === "test"
      ? {
          accuracy: m.accuracy,
          f1: m.f1_score,
          precision: m.precision,
          recall: m.recall,
          mcc: m.mcc,
          roc_auc: m.roc_auc,
          mean_std: m.mean_std,
          perClass: m.per_class_metrics,
          macroAvg: m.macro_avg,
          weightedAvg: m.weighted_avg,
          cm: m.confusion_matrix,
          labels: testLabels,
        }
      : {
          accuracy: m.val_accuracy,
          f1: m.val_f1,
          precision: m.val_precision,
          recall: m.val_recall,
          mcc: null,
          roc_auc: null,
          mean_std: null,
          perClass: m.val_per_class_metrics,
          macroAvg: m.val_macro_avg,
          weightedAvg: m.val_weighted_avg,
          cm: m.val_confusion_matrix,
          labels: evalLabels,
        };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/admin/models")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-(--text-tertiary) uppercase transition-colors hover:text-(--text-primary)"
        >
          <ArrowLeft size={14} /> Kembali ke daftar model
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--accent-muted) bg-(--accent-muted)/20">
              <BrainCircuit size={24} className="text-(--accent)" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
                {m.name}
              </h1>
              <p className="mt-1 font-mono text-[11px] text-(--text-tertiary)">
                ID: {m.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {m.is_active ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-(--success-muted)/50 bg-(--success-muted)/20 px-3 py-2 text-sm font-semibold tracking-wide text-(--success) shadow-(--shadow-sm)">
                <CheckCircle size={14} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-strong) bg-(--bg-elevated) px-3 py-2 text-sm font-semibold tracking-wide text-(--text-secondary) shadow-(--shadow-sm)">
                <XCircle size={14} /> Inactive
              </span>
            )}
            <button
              onClick={() => openEditModal(m)}
              className="inline-flex items-center gap-2 rounded-lg border border-(--border-default) bg-(--bg-surface) px-4 py-2 text-sm font-medium tracking-wide text-(--text-secondary) shadow-(--shadow-sm) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium tracking-wide shadow-(--shadow-sm) transition-all duration-150 disabled:opacity-50 ${
                m.is_active
                  ? "border-(--error-muted) bg-(--bg-surface) text-(--error) hover:bg-(--error-muted)/20"
                  : "border-(--success-muted) bg-(--bg-surface) text-(--success) hover:bg-(--success-muted)/20"
              }`}
            >
              {m.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <Layers size={13} className="text-(--text-tertiary)" />
            {m.model_type?.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <FileText size={13} className="text-(--text-tertiary)" />
            {m.base_model_name ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <HardDrive size={13} className="text-(--text-tertiary)" />
            {formatSize(m.file_size)}
            {m.is_drive_model ? " (Drive)" : " (Lokal)"}
          </span>
          {/* dataset */}
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <Database size={13} className="text-(--text-tertiary)" />
            {m.job?.dataset_name ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <Tag size={13} className="text-(--text-tertiary)" />
            {m.num_labels ?? "—"} Kelas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
            <BarChart3 size={13} className="text-(--text-tertiary)" />
            {(m.prediction_count || 0).toLocaleString("id")} Prediksi
          </span>
          {m.job && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1.5 text-xs text-(--text-secondary)">
                <Clock size={13} className="text-(--text-tertiary)" />
                {formatDur(m.job.duration_seconds)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      {m.description && (
        <p className="rounded-xl border border-(--border-default) bg-(--bg-elevated) px-6 py-5 text-sm leading-relaxed text-(--text-secondary) shadow-(--shadow-sm)">
          {m.description}
        </p>
      )}

      {/* ── Baris 1: Hyperparameter & Info Dataset ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        {/* Kolom Kiri: Hyperparameter Training */}
        <div className="flex flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
          <div className="rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
            <h3 className="text-[13px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Hyperparameter Training
            </h3>
          </div>
          <div className="flex-1 p-0">
            {m.job?.hyperparams ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-(--border-subtle)">
                  {[
                    ["Learning Rate", m.job.hyperparams.learning_rate],
                    ["Epochs", m.job.hyperparams.epochs],
                    ["Batch Size", m.job.hyperparams.batch_size],
                    ["Max Length", m.job.hyperparams.max_length],
                    ["Dropout", m.job.hyperparams.dropout],
                    ["Optimizer", m.job.hyperparams.optimizer],
                    ["Warmup Steps", m.job.hyperparams.warmup_steps],
                    ["Weight Decay", m.job.hyperparams.weight_decay],
                  ].map(([label, value]) => (
                    <tr
                      key={label}
                      className="transition-colors duration-100 hover:bg-(--bg-overlay)"
                    >
                      <td className="px-6 py-3 text-xs font-medium text-(--text-tertiary)">
                        {label}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs font-semibold text-(--text-primary)">
                        {value ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-xs text-(--text-tertiary)">
                Belum ada data hyperparameter.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Dataset & Label Kelas */}
        <div className="flex flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
          <div className="rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
            <h3 className="text-[13px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Informasi Dataset
            </h3>
          </div>
          <div className="flex flex-1 flex-col space-y-6 p-6">
            {/* Data split */}
            {m.job?.split_info ? (
              <div>
                <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Distribusi Data
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    [
                      "Total Data",
                      m.job.split_info.total?.toLocaleString("id"),
                      "text-(--text-primary)",
                    ],
                    [
                      "Train Set",
                      m.job.split_info.train_total?.toLocaleString("id"),
                      "text-(--accent)",
                    ],
                    [
                      "Validation Set",
                      m.job.split_info.val_total?.toLocaleString("id"),
                      "text-(--data-2)",
                    ],
                    [
                      "Test Set",
                      m.job.split_info.test_total?.toLocaleString("id"),
                      "text-(--warning)",
                    ],
                  ].map(([label, value, color]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-4 py-3 text-center shadow-(--shadow-sm)"
                    >
                      <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                        {label}
                      </p>
                      <p
                        className={`mt-1.5 text-lg font-black tracking-tighter ${color}`}
                      >
                        {value ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Label badges */}
            {m.label_map && Object.keys(m.label_map).length > 0 ? (
              <div>
                <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Label Kelas
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(m.label_map).map(([idx, label]) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-(--data-3)/30 bg-(--data-3)/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-(--data-3) uppercase"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Tab Global Test / Val ─────────────────────────── */}
      {(m.accuracy != null || hasEvalMetrics) && (
        <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
          {/* Tab switcher */}
          {hasEvalMetrics && (
            <div className="flex border-b border-(--border-default)">
              {[
                {
                  key: "test",
                  label: "Test Set (Final)",
                  color: "text-(--warning)",
                },
                {
                  key: "eval",
                  label: "Val Set (Validation)",
                  color: "text-(--data-2)",
                },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveSplit(key)}
                  className={`border-b-2 px-5 py-3.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${
                    activeSplit === key
                      ? `border-current ${color}`
                      : "border-transparent text-(--text-tertiary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-8 p-6">
            {/* Metrik KPI Cards */}
            <div>
              <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Metrik Evaluasi
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Accuracy", metrics.accuracy, "text-(--accent)"],
                  ["F1 Score", metrics.f1, "text-(--success)"],
                  ["Precision", metrics.precision, "text-(--data-2)"],
                  ["Recall", metrics.recall, "text-(--warning)"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-4 text-center shadow-(--shadow-sm)"
                  >
                    <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                      {label}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-black tracking-tighter ${color}`}
                    >
                      {value !== null && value !== undefined
                        ? `${(value * 100).toFixed(2)}%`
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* MCC, ROC-AUC, Mean Std sebagai KPI card kecil */}
              {(metrics.mcc != null ||
                metrics.roc_auc != null ||
                metrics.mean_std != null) && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {[
                    ["MCC", metrics.mcc],
                    ["ROC-AUC", metrics.roc_auc],
                    ["Mean Std", metrics.mean_std],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-4 py-3 text-center"
                    >
                      <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                        {label}
                      </p>
                      <p className="mt-1 text-lg font-black text-(--text-primary) tabular-nums">
                        {value !== null && value !== undefined
                          ? typeof value === "number" && value <= 1
                            ? `${(value * 100).toFixed(2)}%`
                            : value
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeSplit === "eval" &&
                metrics.mcc == null &&
                metrics.roc_auc == null && (
                  <p className="mt-4 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3 text-[11px] font-medium tracking-wide text-(--text-tertiary)">
                    💡 Metrik MCC, ROC-AUC, dan Mean Std dihitung dari test set.
                  </p>
                )}
            </div>

            {/* Metrik Per Kelas + Rata-rata (footer tabel) */}
            {metrics.perClass && Object.keys(metrics.perClass).length > 0 && (
              <div>
                <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Metrik Per Kelas
                </p>
                <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                          {[
                            "Kelas",
                            "Precision",
                            "Recall",
                            "F1-Score",
                            "Support",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left font-semibold whitespace-nowrap text-(--text-secondary)"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--border-subtle) bg-(--bg-surface)">
                        {(metrics.labels.length > 0
                          ? metrics.labels
                          : Object.keys(metrics.perClass)
                        ).map((cls) => {
                          const pc = metrics.perClass[cls];
                          if (!pc) return null;
                          return (
                            <tr
                              key={cls}
                              className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                            >
                              <td className="px-4 py-3 font-semibold text-(--text-primary)">
                                {cls}
                              </td>
                              <td className="px-4 py-3 font-mono text-(--text-secondary)">
                                {(pc.precision * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono text-(--text-secondary)">
                                {(pc.recall * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                                {(pc.f1 * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono text-(--text-tertiary)">
                                {pc.support}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Rata-rata sebagai tfoot */}
                      {(metrics.macroAvg || metrics.weightedAvg) && (
                        <tfoot className="border-t-2 border-(--border-default) bg-(--bg-elevated)">
                          {metrics.macroAvg && (
                            <tr className="border-b border-(--border-subtle)">
                              <td className="px-4 py-3 text-xs font-bold text-(--text-primary)">
                                Macro Avg
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                                {(metrics.macroAvg.precision * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                                {(metrics.macroAvg.recall * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-bold text-(--accent)">
                                {(metrics.macroAvg.f1 * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-(--text-tertiary)">
                                —
                              </td>
                            </tr>
                          )}
                          {metrics.weightedAvg && (
                            <tr>
                              <td className="px-4 py-3 text-xs font-bold text-(--text-primary)">
                                Weighted Avg
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                                {(metrics.weightedAvg.precision * 100).toFixed(
                                  2
                                )}
                                %
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-medium text-(--text-secondary)">
                                {(metrics.weightedAvg.recall * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-bold text-(--accent)">
                                {(metrics.weightedAvg.f1 * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-(--text-tertiary)">
                                —
                              </td>
                            </tr>
                          )}
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Confusion Matrix */}
            {metrics.cm && (
              <div>
                <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Confusion Matrix
                </p>
                <div className="animate-fade-in">
                  <ConfusionMatrix data={metrics.cm} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Epoch Logs ──────────────────────────────────── */}
      {m.epoch_logs?.length > 0 && (
        <div className="">
          <div className="mb-3 px-2">
            <h3 className="text-[13px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Log Per Epoch
            </h3>
          </div>
          <div className="shadow-sm">
            <EpochLogsTable logs={m.epoch_logs} />
          </div>
        </div>
      )}

      <EditModelModal />
    </div>
  );
}
