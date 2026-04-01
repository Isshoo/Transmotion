"use client";

import { X, BrainCircuit, CheckCircle, XCircle } from "lucide-react";
import useModelStore from "../../store";
import { ClassDistBar, MetricBar } from "../ui/Bar";

export default function ModelDetailModal() {
  const { isDetailModalOpen, currentModel, closeDetailModal } = useModelStore();

  if (!isDetailModalOpen || !currentModel) return null;

  const m = currentModel;
  const labelMap = m.label_map || {};
  const labels = Object.values(labelMap);
  const perLabel = m.per_label || {};
  const totalPred = m.total_predictions || 0;

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const formatDur = (secs) => {
    if (!secs) return "—";
    const h = Math.floor(secs / 3600);
    const m2 = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}j ${m2}m` : m2 > 0 ? `${m2}m ${s}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
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
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Info umum */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Arsitektur", m.model_type?.toUpperCase()],
              ["Base Model", m.base_model_name ?? "—"],
              ["Jumlah Kelas", m.num_labels ?? "—"],
              ["Ukuran File", formatSize(m.file_size)],
              ["Total Prediksi", totalPred.toLocaleString("id")],
              ["Durasi Training", formatDur(m.job?.duration_seconds)],
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

          {/* Deskripsi */}
          {m.description && (
            <div className="rounded-lg border border-gray-200 px-4 py-3">
              <p className="mb-1 text-xs text-gray-400">Deskripsi</p>
              <p className="text-sm text-gray-700">{m.description}</p>
            </div>
          )}

          {/* Metrik evaluasi */}
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Metrik Evaluasi (Test Set)
            </p>
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
          </div>

          {/* Label mapping */}
          {labels.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Label Kelas
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(labelMap).map(([idx, label]) => (
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
            </div>
          )}

          {/* Distribusi prediksi */}
          {totalPred > 0 && Object.keys(perLabel).length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Distribusi Prediksi
              </p>
              <div className="space-y-2">
                {Object.entries(perLabel)
                  .sort((a, b) => b[1] - a[1])
                  .map(([label, count]) => (
                    <ClassDistBar
                      key={label}
                      label={label}
                      count={count}
                      total={totalPred}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Info training */}
          {m.job && (
            <div className="rounded-lg border border-gray-200 px-4 py-3">
              <p className="mb-2 text-xs text-gray-400">Info Training</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Dataset", m.job.dataset_name ?? "—"],
                  [
                    "Selesai",
                    m.job.finished_at
                      ? new Date(m.job.finished_at).toLocaleString("id-ID")
                      : "—",
                  ],
                ].map(([l, v]) => (
                  <div key={l}>
                    <span className="text-gray-400">{l}: </span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
              {m.training_config && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    ["LR", m.training_config.learning_rate],
                    ["Epochs", m.training_config.epochs],
                    ["Batch", m.training_config.batch_size],
                    ["MaxLen", m.training_config.max_length],
                  ].map(([l, v]) => (
                    <span
                      key={l}
                      className="rounded-md border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500"
                    >
                      {l}: <span className="font-medium">{v}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
