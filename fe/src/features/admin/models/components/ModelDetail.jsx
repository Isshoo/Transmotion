"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle,
  XCircle,
  Pencil,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import useModelStore from "../store";
import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";
import EpochLogsTable from "@/features/admin/training/components/EpochLogsTable";
import { Section } from "./ui/Section";
import { MetricBar } from "./ui/Bar";
import { PerClassTable } from "./ui/Table";
import { AverageTable } from "../../training/components/ui/Table";

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

  useEffect(() => {
    fetchModel(modelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  if (isLoadingDetail || !currentModel) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

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
    const s = secs % 60;
    return h > 0 ? `${h}j ${m2}m` : m2 > 0 ? `${m2}m ${s}s` : `${s}s`;
  };

  const handleToggleActive = async () => {
    const result = await updateModel(m.id, { is_active: !m.is_active });
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push("/admin/models")}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Kembali ke daftar model
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <BrainCircuit size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{m.name}</h1>
              <p className="mt-0.5 font-mono text-xs text-gray-400">{m.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {m.is_active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                <CheckCircle size={12} /> Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                <XCircle size={12} /> Nonaktif
              </span>
            )}
            <button
              onClick={() => openEditModal(m)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                m.is_active
                  ? "border border-orange-300 text-orange-600 hover:bg-orange-50"
                  : "border border-green-300 text-green-600 hover:bg-green-50"
              }`}
            >
              {m.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      </div>

      {/* Deskripsi */}
      {m.description && (
        <p className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
          {m.description}
        </p>
      )}

      {/* ── Baris 1: Info Umum + Label Kelas ─────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Info Umum */}
        <Section title="Informasi Model">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Arsitektur", m.model_type?.toUpperCase()],
              ["Base Model", m.base_model_name ?? "—"],
              ["Jumlah Kelas", m.num_labels ?? "—"],
              ["Ukuran File", formatSize(m.file_size)],
              ["Lokasi File", m.is_drive_model ? "Google Drive" : "Lokal"],
              [
                "Total Prediksi",
                (m.prediction_count || 0).toLocaleString("id"),
              ],
              ["Dataset", m.job?.dataset_name ?? "—"],
              ["Durasi Training", formatDur(m.job?.duration_seconds)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-gray-700">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Label kelas + distribusi prediksi */}
        <div className="space-y-4">
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

          {/* Distribusi prediksi */}
          {m.prediction_count > 0 &&
            m.per_label &&
            Object.keys(m.per_label).length > 0 && (
              <Section title="Distribusi Prediksi">
                <div className="space-y-2">
                  {Object.entries(m.per_label)
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, count]) => {
                      const pct = ((count / m.prediction_count) * 100).toFixed(
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
                              className="h-1.5 rounded-full bg-purple-400 transition-all"
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
      </div>

      {/* ── Baris 2: Metrik Evaluasi ──────────────────────────── */}
      <Section title="Metrik Evaluasi (Test Set)">
        <div className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ["Accuracy", m.accuracy, "text-blue-600"],
            ["F1 Score", m.f1_score, "text-green-600"],
            ["Precision", m.precision, "text-purple-600"],
            ["Recall", m.recall, "text-amber-600"],
          ].map(([label, value, color]) => (
            <div key={label} className="text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>
                {value !== null ? `${(value * 100).toFixed(2)}%` : "—"}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <MetricBar label="Accuracy" value={m.accuracy} color="bg-blue-500" />
          <MetricBar label="F1 Score" value={m.f1_score} color="bg-green-500" />
          <MetricBar
            label="Precision"
            value={m.precision}
            color="bg-purple-500"
          />
          <MetricBar label="Recall" value={m.recall} color="bg-amber-500" />
        </div>
      </Section>

      {/* ── Baris 3: Metrik Per Kelas ─────────────────────────── */}
      {m.per_class_metrics && (
        <Section title="Metrik Per Kelas">
          <PerClassTable perClass={m.per_class_metrics} />
        </Section>
      )}

      {/* ── Baris 4: Rata-rata ────────────────────────────────── */}
      {(m.macro_avg || m.weighted_avg) && (
        <Section title="Rata-rata">
          <AverageTable macroAvg={m.macro_avg} weightedAvg={m.weighted_avg} />
        </Section>
      )}

      {/* ── Baris 5: Confusion Matrix ─────────────────────────── */}
      {m.confusion_matrix && (
        <Section title="Confusion Matrix">
          <ConfusionMatrix data={m.confusion_matrix} />
        </Section>
      )}

      {/* ── Baris 6: Hyperparameter ───────────────────────────── */}
      {m.job?.hyperparams && (
        <Section title="Hyperparameter Training">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Learning Rate", m.job.hyperparams.learning_rate],
              ["Epochs", m.job.hyperparams.epochs],
              ["Batch Size", m.job.hyperparams.batch_size],
              ["Max Length", m.job.hyperparams.max_length],
              ["Warmup Steps", m.job.hyperparams.warmup_steps],
              ["Weight Decay", m.job.hyperparams.weight_decay],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-gray-50 px-3 py-2.5 text-center"
              >
                <p className="text-xs text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Split info */}
          {m.job?.split_info && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ["Total Data", m.job.split_info.total?.toLocaleString("id")],
                [
                  "Train Set",
                  m.job.split_info.train_total?.toLocaleString("id"),
                ],
                ["Test Set", m.job.split_info.test_total?.toLocaleString("id")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-blue-50 px-3 py-2.5 text-center"
                >
                  <p className="text-xs text-blue-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-blue-800">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── Baris 7: Epoch Logs ───────────────────────────────── */}
      {m.epoch_logs?.length > 0 && (
        <Section title="Log Per Epoch">
          <EpochLogsTable logs={m.epoch_logs} />
        </Section>
      )}
    </div>
  );
}
