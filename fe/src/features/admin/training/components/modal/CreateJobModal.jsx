"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import useTrainingStore from "../../store";
import datasetsApi from "@/features/admin/datasets/api";
import SplitPreviewCard from "../SplitPreviewCard";

const MODEL_OPTIONS = [
  {
    value: "mbert",
    label: "mBERT",
    badge: "bg-(--data-1)/20 text-(--data-1) border border-(--data-1)/30",
    desc: "bert-base-multilingual-cased — suitable for multilingual & Indonesian datasets",
  },
  {
    value: "xlmr",
    label: "XLM-R",
    badge: "bg-(--data-4)/20 text-(--data-4) border border-(--data-4)/30",
    desc: "xlm-roberta-base — better performance for Indonesian text & low resource",
  },
];

const DEFAULT_HYPERPARAMS = {
  learning_rate: 2e-5,
  epochs: 3,
  batch_size: 16,
  max_length: 128,
  warmup_steps: 0.1,
  weight_decay: 0.01,
};

export default function CreateJobModal() {
  const {
    isCreateModalOpen,
    isSubmitting,
    splitPreview,
    isLoadingPreview,
    closeCreateModal,
    createJob,
    fetchSplitPreview,
    clearSplitPreview,
  } = useTrainingStore();

  // Step 1: dataset + split, Step 2: model + hyperparams
  const [step, setStep] = useState(1);

  // Dataset list
  const [datasets, setDatasets] = useState([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false);

  // Form
  const [datasetId, setDatasetId] = useState("");
  const [testSize, setTestSize] = useState(0.2);
  const [valSize, setValSize] = useState(0.1);
  const [modelType, setModelType] = useState("mbert");
  const [jobName, setJobName] = useState("");
  const [hp, setHp] = useState(DEFAULT_HYPERPARAMS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const previewTimeout = useRef(null);

  useEffect(() => {
    if (isCreateModalOpen) {
      fetchReadyDatasets();
    }
  }, [isCreateModalOpen]);

  // Auto-fetch preview when dataset or testSize changes
  useEffect(() => {
    clearTimeout(previewTimeout.current);
    if (!datasetId) {
      clearSplitPreview();
      return;
    }
    previewTimeout.current = setTimeout(() => {
      fetchSplitPreview(datasetId, testSize, valSize);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, testSize, valSize]);

  const fetchReadyDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const { data: res } = await datasetsApi.getAll({
        per_page: 100,
        sort_by: "created_at",
        sort_order: "desc",
      });
      // Only datasets with completed preprocessing
      const ready = (res.data ?? []).filter(
        (d) =>
          d.preprocessing_status === "completed" && d.num_rows_preprocessed > 0
      );
      setDatasets(ready);
    } catch {
      /* ignore */
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setDatasetId("");
    setTestSize(0.2);
    setValSize(0.1);
    setModelType("mbert");
    setJobName("");
    setHp(DEFAULT_HYPERPARAMS);
    setShowAdvanced(false);
    closeCreateModal();
  };

  const handleSubmit = async () => {
    const payload = {
      dataset_id: datasetId,
      model_type: modelType,
      test_size: testSize,
      val_size: valSize,
      job_name: jobName.trim() || undefined,
      ...hp,
    };

    const result = await createJob(payload);
    if (result.success) {
      toast.success(result.message);
      handleClose();
    } else {
      toast.error(result.message);
    }
  };

  const canProceedStep1 = datasetId && splitPreview?.is_valid;
  const canSubmit = canProceedStep1 && modelType;

  if (!isCreateModalOpen) return null;

  const selectedDataset = datasets.find((d) => d.id === datasetId);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-(--accent)" />
            <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
              Create New Training Job
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-(--text-tertiary) transition-colors duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex shrink-0 border-b border-(--border-default) bg-(--bg-elevated)">
          {[
            { n: 1, label: "Dataset & Split" },
            { n: 2, label: "Model & Hyperparameter" },
          ].map(({ n, label }) => (
            <button
              key={n}
              onClick={() =>
                n < step || (n === 2 && canProceedStep1) ? setStep(n) : null
              }
              className={`flex-1 border-b-2 px-4 py-3.5 text-sm font-medium tracking-wide transition-colors duration-150 ${
                step === n
                  ? "border-(--accent) text-(--accent)"
                  : n < step
                    ? "cursor-pointer border-transparent text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    : "cursor-not-allowed border-transparent text-(--text-disabled)"
              }`}
            >
              <span
                className={`mr-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === n
                    ? "bg-(--accent) text-(--bg-base) shadow-(--shadow-accent)"
                    : n < step
                      ? "bg-(--success) text-(--bg-base)"
                      : "bg-(--bg-overlay) text-(--text-tertiary)"
                }`}
              >
                {n < step ? "✓" : n}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* ── STEP 1 ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              {/* Select dataset */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                  Dataset
                </label>
                <p className="mb-3 text-xs text-(--text-tertiary)">
                  Only shows datasets that have been preprocessed.
                </p>
                {isLoadingDatasets ? (
                  <div className="flex items-center gap-2 rounded-md border border-(--border-default) bg-(--bg-elevated) px-4 py-3 text-sm text-(--text-tertiary)">
                    <Loader2
                      size={16}
                      className="animate-spin text-(--accent)"
                    />{" "}
                    Loading dataset list...
                  </div>
                ) : datasets.length === 0 ? (
                  <div className="rounded-md border border-(--warning-muted) bg-(--warning-muted) px-4 py-3 text-sm text-(--warning) opacity-90">
                    No datasets are ready yet. Please preprocess a dataset first.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => setDatasetId(ds.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                          datasetId === ds.id
                            ? "border-(--accent) bg-(--accent-muted)/30 ring-1 ring-(--accent)"
                            : "border-(--border-default) bg-(--bg-elevated) hover:border-(--accent) hover:bg-(--bg-overlay)"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold tracking-tight ${datasetId === ds.id ? "text-(--accent)" : "text-(--text-primary)"}`}
                        >
                          {ds.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-4 text-[11px] font-medium tracking-wide text-(--text-tertiary) uppercase">
                          <span>
                            <strong className="text-(--text-secondary)">
                              {ds.num_rows_preprocessed?.toLocaleString("id")}
                            </strong>{" "}
                            preprocessed rows
                          </span>
                          <span>|</span>
                          <span>
                            <strong className="text-(--text-secondary)">
                              {ds.num_labels ??
                                Object.keys(
                                  ds.class_distribution_preprocessed ?? {}
                                ).length}
                            </strong>{" "}
                            classes
                          </span>
                          <span>|</span>
                          <span>
                            Text:{" "}
                            <strong className="text-(--text-secondary)">
                              {ds.text_column}
                            </strong>{" "}
                            · Label:{" "}
                            <strong className="text-(--text-secondary)">
                              {ds.label_column}
                            </strong>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Test size slider */}
              {datasetId && (
                <div className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-(--text-secondary)">
                      Test Size
                    </label>
                    <span className="text-[11px] font-semibold tracking-wide text-(--accent) uppercase">
                      <span className="text-(--warning)">
                        {Math.round(testSize * 100)}%
                      </span>{" "}
                      test /{" "}
                      <span className="text-(--accent)">
                        {Math.round((1 - testSize) * 100)}%
                      </span>{" "}
                      train
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={Math.round(testSize * 100)}
                    onChange={(e) => setTestSize(e.target.value / 100)}
                    className="mt-1 w-full cursor-pointer accent-(--accent)"
                  />
                  <div className="mt-1.5 flex justify-between text-[10px] font-medium text-(--text-tertiary)">
                    <span>5%</span>
                    <span>40%</span>
                  </div>
                </div>
              )}

              {/* Val size slider */}
              {datasetId && (
                <div className="rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-(--text-secondary)">
                      Validation Size
                    </label>
                    <span className="text-[11px] font-semibold tracking-wide text-(--accent) uppercase">
                      <span className="text-(--warning)">
                        {Math.round(valSize * 100)}%
                      </span>{" "}
                      val
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="1"
                    value={Math.round(valSize * 100)}
                    onChange={(e) => setValSize(e.target.value / 100)}
                    className="mt-1 w-full cursor-pointer accent-(--accent)"
                  />
                  <div className="mt-1.5 flex justify-between text-[10px] font-medium text-(--text-tertiary)">
                    <span>5%</span>
                    <span>10%</span>
                  </div>
                </div>
              )}

              {/* Split preview */}
              {datasetId && (
                <SplitPreviewCard
                  preview={splitPreview}
                  isLoading={isLoadingPreview}
                />
              )}
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              {/* Ringkasan dataset */}
              {selectedDataset && splitPreview && (
                <div className="flex flex-col gap-3 rounded-xl border border-(--border-default) bg-(--bg-elevated) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
                      Selected Dataset
                    </p>
                    <p className="text-sm font-semibold tracking-tight text-(--text-primary)">
                      {selectedDataset.name}
                    </p>
                  </div>
                  <div className="flex gap-4 rounded-md border border-(--border-subtle) bg-(--bg-surface) px-3 py-1.5 text-[11px] font-medium tracking-wide text-(--text-secondary) uppercase">
                    <span>
                      Train:{" "}
                      <strong className="text-(--accent)">
                        {splitPreview.train_total?.toLocaleString("id")}
                      </strong>
                    </span>
                    <span>
                      Test:{" "}
                      <strong className="text-(--warning)">
                        {splitPreview.test_total?.toLocaleString("id")}
                      </strong>
                    </span>
                    <span>
                      Classes:{" "}
                      <strong className="text-(--text-primary)">
                        {splitPreview.num_labels}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Nama job */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
                  Job Name{" "}
                  <span className="font-normal text-(--text-tertiary)">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder={`e.g. mBERT Sentiment v1`}
                  className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                />
              </div>

              {/* Select model */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-(--text-secondary)">
                  Model Architecture
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setModelType(opt.value)}
                      className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                        modelType === opt.value
                          ? "border-(--accent) bg-(--accent-muted)/30 ring-1 ring-(--accent)"
                          : "border-(--border-default) bg-(--bg-surface) hover:border-(--accent) hover:bg-(--bg-overlay)"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${opt.badge}`}
                        >
                          {opt.label}
                        </span>
                        {modelType === opt.value && (
                          <CheckCircle
                            size={16}
                            className="animate-scale-in text-(--accent)"
                          />
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-(--text-secondary)">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hyperparameter dasar */}
              <div>
                <p className="mb-2.5 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Basic Configuration
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                      Epochs
                    </label>
                    <select
                      value={hp.epochs}
                      onChange={(e) =>
                        setHp((p) => ({ ...p, epochs: Number(e.target.value) }))
                      }
                      className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                    >
                      {[1, 2, 3, 4, 5, 8, 10].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                      Batch Size
                    </label>
                    <select
                      value={hp.batch_size}
                      onChange={(e) =>
                        setHp((p) => ({
                          ...p,
                          batch_size: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                    >
                      {[8, 16, 32].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                      Max Length{" "}
                      <span className="font-normal text-(--text-tertiary)">
                        (token)
                      </span>
                    </label>
                    <select
                      value={hp.max_length}
                      onChange={(e) =>
                        setHp((p) => ({
                          ...p,
                          max_length: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                    >
                      {[64, 128, 256, 512].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                      Learning Rate
                    </label>
                    <select
                      value={hp.learning_rate}
                      onChange={(e) =>
                        setHp((p) => ({
                          ...p,
                          learning_rate: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                    >
                      {[1e-5, 2e-5, 3e-5, 5e-5].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced hyperparams */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-(--text-tertiary) uppercase transition-colors hover:text-(--text-primary)"
                >
                  {showAdvanced ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                  {showAdvanced ? "Hide" : "Show"} advanced parameters
                </button>

                {showAdvanced && (
                  <div className="animate-fade-in mt-4 grid grid-cols-2 gap-4 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                        Warmup Steps
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={hp.warmup_steps}
                        onChange={(e) =>
                          setHp((p) => ({
                            ...p,
                            warmup_steps: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
                        Weight Decay
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={0.1}
                        step={0.01}
                        value={hp.weight_decay}
                        onChange={(e) =>
                          setHp((p) => ({
                            ...p,
                            weight_decay: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-between gap-3 rounded-b-xl border-t border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
              >
                ← Back
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-md bg-(--accent) px-5 py-2 text-sm font-medium tracking-wide text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-5 py-2 text-sm font-medium tracking-wide text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
              >
                {isSubmitting ? "Creating Job..." : "Start Training"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
