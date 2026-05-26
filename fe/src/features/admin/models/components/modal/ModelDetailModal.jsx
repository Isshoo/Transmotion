"use client";

import { X, BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import useModelStore from "../../store";
import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";
import { MetricBar } from "../ui/Bar";
import { Section } from "../ui/Section";
import { PerClassTable } from "../ui/Table";

export default function ModelDetailModal() {
  const { isDetailModalOpen, currentModel, closeDetailModal } = useModelStore();

  if (!isDetailModalOpen || !currentModel) return null;

  const m = currentModel;

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDur = (secs) => {
    if (!secs) return "—";
    const h = Math.floor(secs / 3600);
    const m2 = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}j ${m2}m` : `${m2}m`;
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="animate-scale-in flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-lg)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-(--border-subtle) bg-(--bg-elevated) px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--accent-muted) bg-(--accent-muted)/20">
              <BrainCircuit size={20} className="text-(--accent)" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-(--text-primary)">
                {m.name}
              </h2>
              <p className="mt-0.5 font-mono text-[10px] text-(--text-tertiary)">
                ID: {m.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {m.is_active ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--success-muted)/50 bg-(--success-muted)/20 px-3 py-1 text-[10px] font-bold tracking-wider text-(--success) uppercase shadow-(--shadow-sm)">
                <CheckCircle size={12} /> Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-strong) bg-(--bg-elevated) px-3 py-1 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase shadow-(--shadow-sm)">
                <XCircle size={12} /> Nonaktif
              </span>
            )}
            <button
              onClick={closeDetailModal}
              className="rounded-lg p-2 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="scrollbar-thin scrollbar-thumb-(--border-strong) scrollbar-track-transparent flex-1 space-y-6 overflow-y-auto p-6">
          {/* Info umum */}
          <Section title="Informasi Model">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Arsitektur", m.model_type?.toUpperCase()],
                ["Base Model", m.base_model_name ?? "—"],
                ["Jumlah Kelas", m.num_labels ?? "—"],
                ["Ukuran File", formatSize(m.file_size)],
                [
                  "Total Prediksi",
                  (m.total_predictions || 0).toLocaleString("id"),
                ],
                ["Durasi Training", formatDur(m.job?.duration_seconds)],
                ["Dataset", m.job?.dataset_name ?? "—"],
                [
                  "Lokasi File",
                  m.file_path?.startsWith("/content/drive")
                    ? "Google Drive"
                    : "Lokal",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-3 py-3 text-center shadow-(--shadow-sm)"
                >
                  <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                    {label}
                  </p>
                  <p className="mt-1.5 truncate text-xs font-bold text-(--text-primary)">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Deskripsi */}
          {m.description && (
            <Section title="Deskripsi">
              <p className="font-mono text-sm leading-relaxed text-(--text-secondary)">
                {m.description}
              </p>
            </Section>
          )}

          {/* Label mapping */}
          {m.label_map && Object.keys(m.label_map).length > 0 && (
            <Section title="Label Kelas">
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(m.label_map).map(([idx, label]) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--data-3)/30 bg-(--data-3)/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-(--data-3) uppercase"
                  >
                    <span className="rounded-full bg-(--data-3)/20 px-1.5 py-0.5 text-[9px] font-black text-(--data-3)">
                      {idx}
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Metrik utama */}
          <Section title="Metrik Evaluasi (Test Set)">
            <div className="space-y-4">
              <MetricBar
                label="Accuracy"
                value={m.accuracy}
                color="bg-(--accent)"
              />
              <MetricBar
                label="F1 Score"
                value={m.f1_score}
                color="bg-(--success)"
              />
              <MetricBar
                label="Precision"
                value={m.precision}
                color="bg-(--data-2)"
              />
              <MetricBar
                label="Recall"
                value={m.recall}
                color="bg-(--warning)"
              />
            </div>
          </Section>

          {/* Per-class */}
          {m.per_class_metrics && (
            <Section title="Metrik Per Kelas">
              <PerClassTable perClass={m.per_class_metrics} />
            </Section>
          )}

          {/* Rata-rata */}
          {(m.macro_avg || m.weighted_avg) && (
            <Section title="Rata-rata">
              <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                      {["Type", "Precision", "Recall", "F1-Score"].map((h) => (
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
                    {m.macro_avg && (
                      <tr className="transition-colors duration-150 hover:bg-(--bg-overlay)">
                        <td className="px-4 py-3 font-bold text-(--text-primary)">
                          Macro Average
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                          {(m.macro_avg.precision * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                          {(m.macro_avg.recall * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-(--accent)">
                          {(m.macro_avg.f1 * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )}
                    {m.weighted_avg && (
                      <tr className="transition-colors duration-150 hover:bg-(--bg-overlay)">
                        <td className="px-4 py-3 font-bold text-(--text-primary)">
                          Weighted Average
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                          {(m.weighted_avg.precision * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                          {(m.weighted_avg.recall * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-(--accent)">
                          {(m.weighted_avg.f1 * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Confusion matrix */}
          {m.confusion_matrix && (
            <Section title="Confusion Matrix">
              <ConfusionMatrix data={m.confusion_matrix} />
            </Section>
          )}

          {/* Hyperparameter */}
          {m.training_config && (
            <Section title="Hyperparameter Training">
              <div className="flex flex-wrap gap-2.5">
                {[
                  ["Learning Rate", m.training_config.learning_rate],
                  ["Epochs", m.training_config.epochs],
                  ["Batch Size", m.training_config.batch_size],
                  ["Max Length", m.training_config.max_length],
                  ["Warmup Steps", m.training_config.warmup_steps],
                  ["Weight Decay", m.training_config.weight_decay],
                ].map(([l, v]) => (
                  <span
                    key={l}
                    className="rounded-md border border-(--border-strong) bg-(--bg-elevated) px-3 py-1.5 text-[10px] font-bold tracking-wide text-(--text-secondary) uppercase shadow-(--shadow-sm)"
                  >
                    {l}:{" "}
                    <span className="ml-1 font-black text-(--text-primary)">
                      {v}
                    </span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Distribusi prediksi */}
          {m.total_predictions > 0 && m.per_label && (
            <Section title="Distribusi Prediksi">
              <div className="space-y-3.5">
                {Object.entries(m.per_label)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => {
                    const pct = ((count / m.total_predictions) * 100).toFixed(
                      1
                    );
                    return (
                      <div key={label}>
                        <div className="mb-1 flex justify-between text-[11px] font-medium tracking-wide uppercase">
                          <span className="text-(--text-secondary)">
                            {label}
                          </span>
                          <span className="text-(--text-tertiary)">
                            <strong className="text-(--text-primary)">
                              {count.toLocaleString("id")}
                            </strong>{" "}
                            ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--border-strong)">
                          <div
                            className="h-1.5 rounded-full bg-(--data-3) transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end rounded-b-2xl border-t border-(--border-subtle) bg-(--bg-elevated) px-6 py-4">
          <button
            onClick={closeDetailModal}
            className="rounded-xl border border-(--border-strong) bg-(--bg-surface) px-5 py-2.5 text-sm font-bold tracking-wide text-(--text-secondary) shadow-(--shadow-sm) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
