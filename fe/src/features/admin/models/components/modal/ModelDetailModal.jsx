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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                {m.name}
              </h2>
              <p className="text-xs text-gray-400">{m.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.is_active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle size={11} /> Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                <XCircle size={11} /> Nonaktif
              </span>
            )}
            <button
              onClick={closeDetailModal}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Info umum */}
          <Section title="Informasi Model">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-gray-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Deskripsi */}
          {m.description && (
            <Section title="Deskripsi">
              <p className="text-sm text-gray-700">{m.description}</p>
            </Section>
          )}

          {/* Label mapping */}
          {m.label_map && Object.keys(m.label_map).length > 0 && (
            <Section title="Label Kelas">
              <div className="flex flex-wrap gap-2">
                {Object.entries(m.label_map).map(([idx, label]) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                  >
                    <span className="rounded-full bg-purple-200 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
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
            <div className="space-y-3">
              <MetricBar
                label="Accuracy"
                value={m.accuracy}
                color="bg-blue-500"
              />
              <MetricBar
                label="F1 Score"
                value={m.f1_score}
                color="bg-green-500"
              />
              <MetricBar
                label="Precision"
                value={m.precision}
                color="bg-purple-500"
              />
              <MetricBar label="Recall" value={m.recall} color="bg-amber-500" />
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
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {["", "Precision", "Recall", "F1-Score"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-semibold text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {m.macro_avg && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-700">
                          Macro Average
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {(m.macro_avg.precision * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {(m.macro_avg.recall * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {(m.macro_avg.f1 * 100).toFixed(2)}%
                        </td>
                      </tr>
                    )}
                    {m.weighted_avg && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-700">
                          Weighted Average
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {(m.weighted_avg.precision * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {(m.weighted_avg.recall * 100).toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-gray-600">
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
              <div className="flex flex-wrap gap-2">
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
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {l}:{" "}
                    <span className="font-semibold text-gray-800">{v}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Distribusi prediksi */}
          {m.total_predictions > 0 && m.per_label && (
            <Section title="Distribusi Prediksi">
              <div className="space-y-2">
                {Object.entries(m.per_label)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => {
                    const pct = ((count / m.total_predictions) * 100).toFixed(
                      1
                    );
                    return (
                      <div key={label}>
                        <div className="mb-0.5 flex justify-between text-xs">
                          <span className="font-medium text-gray-700">
                            {label}
                          </span>
                          <span className="text-gray-500">
                            {count.toLocaleString("id")} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-purple-400"
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
        <div className="flex shrink-0 justify-end border-t px-6 py-4">
          <button
            onClick={closeDetailModal}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
