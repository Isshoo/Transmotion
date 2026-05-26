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
} from "lucide-react";
import { toast } from "sonner";
import useModelStore from "../store";
import EditModelModal from "./modal/EditModelModal";
import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";
import EpochLogsTable from "@/features/admin/training/components/EpochLogsTable";
import { MetricBar } from "./ui/Bar";
import { PerClassTable } from "./ui/Table";
import { AverageTable } from "../../training/components/ui/Table";

function Section({ title, children }) {
  return (
    <div className="animate-scale-in rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
      <div className="rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
        <h3 className="text-[13px] font-bold tracking-wider text-(--text-secondary) uppercase">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TabHeader({ tabs, activeTab, setActiveTab }) {
  if (!tabs || tabs.length <= 1) return null;
  return (
    <div className="no-scrollbar mb-6 flex overflow-x-auto rounded-t-lg border-b border-(--border-default) bg-(--bg-elevated)">
      {tabs.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`border-b-2 px-5 py-3.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${
            activeTab === key
              ? `border-current ${color}`
              : "border-transparent text-(--text-tertiary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

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

  const [activeMetricTab, setActiveMetricTab] = useState("test");
  const [activeCMTab, setActiveCMTab] = useState("test");
  const [activePerClassTab, setActivePerClassTab] = useState("test");

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

  const splitTabs = [
    { key: "test", label: "Test Set (Final)", color: "text-(--warning)" },
    ...(hasEvalMetrics
      ? [
          {
            key: "eval",
            label: "Val Set (Validation)",
            color: "text-(--data-2)",
          },
        ]
      : []),
  ];

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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--success-muted)/50 bg-(--success-muted)/20 px-3 py-1.5 text-[10px] font-bold tracking-wider text-(--success) uppercase shadow-(--shadow-sm)">
                <CheckCircle size={14} /> Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-strong) bg-(--bg-elevated) px-3 py-1.5 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase shadow-(--shadow-sm)">
                <XCircle size={14} /> Nonaktif
              </span>
            )}
            <button
              onClick={() => openEditModal(m)}
              className="inline-flex items-center gap-2 rounded-lg border border-(--border-default) bg-(--bg-surface) px-4 py-2.5 text-sm font-medium tracking-wide text-(--text-secondary) shadow-(--shadow-sm) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium tracking-wide shadow-(--shadow-sm) transition-all duration-150 disabled:opacity-50 ${
                m.is_active
                  ? "border-(--warning-muted) bg-(--bg-surface) text-(--warning) hover:bg-(--warning-muted)/20"
                  : "border-(--success-muted) bg-(--bg-surface) text-(--success) hover:bg-(--success-muted)/20"
              }`}
            >
              {m.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      </div>

      {/* Deskripsi */}
      {m.description && (
        <p className="rounded-xl border border-(--border-default) bg-(--bg-elevated) px-6 py-5 font-mono text-sm leading-relaxed text-(--text-secondary) shadow-(--shadow-sm)">
          {m.description}
        </p>
      )}

      {/* ── Baris 1: Info Umum + Label Kelas ─────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Info Umum */}
        <Section title="Informasi Model">
          <div className="grid grid-cols-2 gap-4">
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
              <div
                key={label}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-4 py-3 text-center"
              >
                <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                  {label}
                </p>
                <p className="mt-1.5 truncate text-sm font-bold text-(--text-primary)">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Label kelas + distribusi prediksi */}
        <div className="space-y-6">
          {/* Label mapping */}
          {m.label_map && Object.keys(m.label_map).length > 0 && (
            <Section title="Label Kelas">
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(m.label_map).map(([idx, label]) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-(--data-3)/30 bg-(--data-3)/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-(--data-3) uppercase"
                  >
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
                <div className="space-y-3.5">
                  {Object.entries(m.per_label)
                    .sort((a, b) => b[1] - a[1])
                    .map(([label, count]) => {
                      const pct = ((count / m.prediction_count) * 100).toFixed(
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
      </div>

      {/* ── Baris 2: Metrik Evaluasi ──────────────────────────── */}
      <Section title="Metrik Evaluasi">
        <TabHeader
          tabs={splitTabs}
          activeTab={activeMetricTab}
          setActiveTab={setActiveMetricTab}
        />

        {activeMetricTab === "test" ? (
          <div className="animate-fade-in">
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Accuracy", m.accuracy, "text-(--accent)"],
                ["F1 Score", m.f1_score, "text-(--success)"],
                ["Precision", m.precision, "text-(--data-2)"],
                ["Recall", m.recall, "text-(--warning)"],
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
                    {value !== null ? `${(value * 100).toFixed(2)}%` : "—"}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-2">
              <MetricBar label="MCC" value={m.mcc} color="bg-(--data-1)" />
              <MetricBar
                label="ROC-AUC"
                value={m.roc_auc}
                color="bg-(--data-3)"
              />
              <MetricBar
                label="Mean Std"
                value={m.mean_std}
                color="bg-(--text-secondary)"
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Accuracy", m.val_accuracy, "text-(--accent)"],
                ["F1 Score", m.val_f1, "text-(--success)"],
                ["Precision", m.val_precision, "text-(--data-2)"],
                ["Recall", m.val_recall, "text-(--warning)"],
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
                    {value !== null ? `${(value * 100).toFixed(2)}%` : "—"}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3 text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              💡 Metrik MCC, ROC-AUC, dan Mean Std dihitung dari test set.
            </p>
          </div>
        )}
      </Section>

      {/* ── Baris 3: Metrik Per Kelas & Rata-rata ──────────────── */}
      {(m.per_class_metrics || m.val_per_class_metrics) && (
        <Section title="Metrik Per Kelas">
          <TabHeader
            tabs={[
              {
                key: "test",
                label: "Test Set",
                color: "text-(--warning)",
              },
              ...(m.val_per_class_metrics
                ? [
                    {
                      key: "eval",
                      label: "Val Set",
                      color: "text-(--data-2)",
                    },
                  ]
                : []),
            ]}
            activeTab={activePerClassTab}
            setActiveTab={setActivePerClassTab}
          />

          <div className="animate-fade-in">
            {activePerClassTab === "test" && (
              <>
                <PerClassTable
                  perClass={m.per_class_metrics}
                  labels={testLabels}
                />
                {(m.macro_avg || m.weighted_avg) && (
                  <div className="mt-8 border-t border-(--border-default) pt-6">
                    <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                      Rata-rata (Test Set)
                    </p>
                    <AverageTable
                      macroAvg={m.macro_avg}
                      weightedAvg={m.weighted_avg}
                    />
                  </div>
                )}
              </>
            )}

            {activePerClassTab === "eval" && (
              <>
                <PerClassTable
                  perClass={m.val_per_class_metrics}
                  labels={evalLabels}
                />
                {(m.val_macro_avg || m.val_weighted_avg) && (
                  <div className="mt-8 border-t border-(--border-default) pt-6">
                    <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                      Rata-rata (Val Set)
                    </p>
                    <AverageTable
                      macroAvg={m.val_macro_avg}
                      weightedAvg={m.val_weighted_avg}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      )}

      {/* ── Baris 5: Confusion Matrix ─────────────────────────── */}
      {(m.confusion_matrix || m.val_confusion_matrix) && (
        <Section title="Confusion Matrix">
          <TabHeader
            tabs={[
              {
                key: "test",
                label: "Test Set",
                color: "text-(--warning)",
              },
              ...(m.val_confusion_matrix
                ? [
                    {
                      key: "eval",
                      label: "Val Set",
                      color: "text-(--data-2)",
                    },
                  ]
                : []),
            ]}
            activeTab={activeCMTab}
            setActiveTab={setActiveCMTab}
          />
          <div className="animate-fade-in">
            {activeCMTab === "test" && m.confusion_matrix && (
              <ConfusionMatrix data={m.confusion_matrix} />
            )}
            {activeCMTab === "eval" && m.val_confusion_matrix && (
              <ConfusionMatrix data={m.val_confusion_matrix} />
            )}
          </div>
        </Section>
      )}

      {/* ── Baris 6: Hyperparameter ───────────────────────────── */}
      {m.job?.hyperparams && (
        <Section title="Hyperparameter Training">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
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
              <div
                key={label}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) px-3 py-3 text-center shadow-(--shadow-sm)"
              >
                <p className="text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                  {label}
                </p>
                <p className="mt-1.5 text-xs font-bold text-(--text-primary)">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Split info */}
          {m.job?.split_info && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          )}
        </Section>
      )}

      {/* ── Baris 7: Epoch Logs ───────────────────────────────── */}
      {m.epoch_logs?.length > 0 && (
        <Section title="Log Per Epoch">
          <EpochLogsTable logs={m.epoch_logs} />
        </Section>
      )}

      <EditModelModal />
    </div>
  );
}
