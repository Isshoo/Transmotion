import { toast } from "sonner";
import useTrainingStore from "../../store";
import { useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
} from "lucide-react";
import SplitPreviewCard from "../SplitPreviewCard";

const MODEL_OPTIONS = [
  {
    value: "mbert",
    label: "mBERT",
    badge: "bg-(--data-1)/20 text-(--data-1) border border-(--data-1)/30",
    desc: "bert-base-multilingual-cased — suitable for multilingual datasets",
  },
  {
    value: "xlmr",
    label: "XLM-R",
    badge: "bg-(--data-4)/20 text-(--data-4) border border-(--data-4)/30",
    desc: "xlm-roberta-base — better performance for Indonesian",
  },
];

export default function FormView() {
  const {
    datasets,
    isLoadingDatasets,
    selectedDatasetId,
    testSize,
    evalSize,
    modelType,
    jobName,
    hyperparams,
    splitPreview,
    isLoadingPreview,
    isSubmitting,
    setSelectedDatasetId,
    setTestSize,
    setEvalSize,
    setModelType,
    setJobName,
    setHyperparam,
    createJob,
  } = useTrainingStore();

  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  const canSubmit =
    selectedDatasetId && splitPreview?.is_valid && modelType && !isSubmitting;

  const handleSubmit = async () => {
    const result = await createJob();
    if (!result.success) toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      {/* ── Step 1: Select Dataset ────────────────────────────── */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
        <p className="mb-1 text-sm font-semibold tracking-tight text-(--text-primary)">
          Select Dataset
        </p>
        <p className="mb-4 text-xs text-(--text-secondary)">
          Only preprocessed datasets are shown.
        </p>

        {isLoadingDatasets ? (
          <div className="rounded-lg border border-(--warning-muted) bg-(--warning-muted) px-4 py-3 text-sm text-(--warning) opacity-90">
            <Loader2 size={15} className="animate-spin" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="rounded-lg border border-(--warning-muted) bg-(--warning-muted) px-4 py-3 text-sm text-(--warning) opacity-90">
            No datasets are ready yet. Please preprocess a dataset first.
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-150 focus:ring-2 focus:ring-(--accent-muted) focus:outline-none ${
                selectedDatasetId
                  ? "border-(--accent) bg-(--accent-muted)/50"
                  : "border-(--border-default) bg-(--bg-elevated) hover:border-(--accent) hover:bg-(--bg-overlay)"
              }`}
            >
              {selectedDataset ? (
                <div>
                  <p className="text-sm font-medium text-(--text-primary)">
                    {selectedDataset.name}
                  </p>
                  <p className="mt-1 text-[11px] text-(--text-secondary)">
                    <span className="font-medium text-(--text-primary)">
                      {selectedDataset.num_rows_preprocessed?.toLocaleString(
                        "id"
                      )}
                    </span>{" "}
                    rows ·{" "}
                    <span className="font-medium text-(--text-primary)">
                      {
                        Object.keys(
                          selectedDataset.class_distribution_preprocessed ?? {}
                        ).length
                      }
                    </span>{" "}
                    classes · {selectedDataset.text_column} →{" "}
                    <span className="font-medium text-(--accent)">
                      {selectedDataset.label_column}
                    </span>
                  </p>
                </div>
              ) : (
                <span className="text-sm text-(--text-tertiary)">
                  Select a dataset...
                </span>
              )}
              <ChevronDown
                size={18}
                className={`text-(--text-tertiary) transition-transform duration-200 ${
                  isDatasetDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDatasetDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDatasetDropdownOpen(false)}
                />
                <div className="animate-fade-in absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
                  {datasets.map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => {
                        setSelectedDatasetId(ds.id);
                        setIsDatasetDropdownOpen(false);
                      }}
                      className={`flex w-full flex-col px-4 py-3 text-left transition-colors duration-150 hover:bg-(--bg-overlay) ${
                        selectedDatasetId === ds.id
                          ? "border-l-2 border-(--accent) bg-(--accent-muted)/30"
                          : "border-l-2 border-transparent"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          selectedDatasetId === ds.id
                            ? "text-(--accent)"
                            : "text-(--text-primary)"
                        }`}
                      >
                        {ds.name}
                      </p>
                      <div className="mt-1 flex gap-2 text-[11px] text-(--text-tertiary)">
                        <span>
                          <span className="font-medium text-(--text-secondary)">
                            {ds.num_rows_preprocessed?.toLocaleString("id")}
                          </span>{" "}
                          rows
                        </span>
                        <span>·</span>
                        <span>
                          <span className="font-medium text-(--text-secondary)">
                            {
                              Object.keys(
                                ds.class_distribution_preprocessed ?? {}
                              ).length
                            }
                          </span>{" "}
                          classes
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Step 2: Ukuran Test Set + Preview ───────────────── */}
      {selectedDatasetId && (
        <div className="animate-fade-in rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
          <p className="mb-1 text-sm font-semibold tracking-tight text-(--text-primary)">
            Data Split{" "}
            <span className="font-normal text-(--text-tertiary)">
              (Train / Validation / Test)
            </span>
          </p>
          <p className="mb-5 text-xs text-(--text-secondary)">
            Data is split into 3: train for training, validation for per-epoch monitoring, test for final evaluation.
          </p>

          <div className="mb-6 space-y-5 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-4">
            {/* Test size */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-(--text-secondary)">
                  Test Set
                </span>
                <span className="text-xs font-semibold text-(--warning)">
                  {Math.round(testSize * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={Math.round(testSize * 100)}
                onChange={(e) => setTestSize(e.target.value / 100)}
                className="w-full cursor-pointer accent-(--warning)"
              />
            </div>

            {/* Eval size */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-(--text-secondary)">
                  Validation Set
                </span>
                <span className="text-xs font-semibold text-(--data-2)">
                  {Math.round(evalSize * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="10"
                step="1"
                value={Math.round(evalSize * 100)}
                onChange={(e) => setEvalSize(e.target.value / 100)}
                className="w-full cursor-pointer accent-(--data-2)"
              />
            </div>

            {/* Visual bar */}
            {splitPreview && (
              <div className="pt-2">
                <div className="flex h-3.5 overflow-hidden rounded-full bg-(--border-subtle)">
                  {[
                    [
                      Math.round((1 - testSize - evalSize) * 100),
                      "bg-(--accent)",
                      "Train",
                    ],
                    [Math.round(evalSize * 100), "bg-(--data-2)", "Val"],
                    [Math.round(testSize * 100), "bg-(--warning)", "Test"],
                  ].map(([pct, color, label]) => (
                    <div
                      key={label}
                      className={`${color} flex items-center justify-center text-[9px] font-bold text-(--bg-base) transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    >
                      {pct >= 5 && `${label} ${pct}%`}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  {[
                    [
                      "bg-(--accent)",
                      `Train ${Math.round((1 - testSize - evalSize) * 100)}%`,
                    ],
                    [
                      "bg-(--data-2)",
                      `Validation ${Math.round(evalSize * 100)}%`,
                    ],
                    ["bg-(--warning)", `Test ${Math.round(testSize * 100)}%`],
                  ].map(([color, label]) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-(--text-tertiary) uppercase"
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${color}`}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SplitPreviewCard
            preview={splitPreview}
            isLoading={isLoadingPreview}
          />
        </div>
      )}

      {/* ── Step 3: Select Model ──────────────────────────────── */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
        <p className="mb-1 text-sm font-semibold tracking-tight text-(--text-primary)">
          Model Architecture
        </p>
        <p className="mb-5 text-xs text-(--text-secondary)">
          Choose the transformer model to fine-tune.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setModelType(opt.value)}
              className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                modelType === opt.value
                  ? "border-(--accent) bg-(--accent-muted)/30 ring-1 ring-(--accent)"
                  : "border-(--border-default) bg-(--bg-elevated) hover:border-(--accent) hover:bg-(--bg-overlay)"
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

      {/* ── Step 4: Hyperparameter ───────────────────────────── */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
        <p className="mb-1 text-sm font-semibold tracking-tight text-(--text-primary)">
          Hyperparameter
        </p>
        <p className="mb-5 text-xs text-(--text-secondary)">
          Training configuration. Defaults are already optimized.
        </p>

        {/* Nama job */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
            Job Name{" "}
            <span className="font-normal text-(--text-tertiary)">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder={`e.g. ${modelType.toUpperCase()} Sentiment v1`}
            className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        {/* Hyperparameter dasar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
              Epochs
            </label>
            <select
              value={hyperparams.epochs}
              onChange={(e) => setHyperparam("epochs", Number(e.target.value))}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
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
              value={hyperparams.batch_size}
              onChange={(e) =>
                setHyperparam("batch_size", Number(e.target.value))
              }
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
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
              Max Length
              <span className="ml-1 font-normal text-(--text-tertiary)">
                (token)
              </span>
            </label>
            <select
              value={hyperparams.max_length}
              onChange={(e) => {
                const val =
                  e.target.value === "auto" ? "auto" : Number(e.target.value);
                setHyperparam("max_length", val);
              }}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            >
              <option value="auto">Auto (auto-detect)</option>
              {[64, 128, 256, 512].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {hyperparams.max_length === "auto" && (
              <p className="mt-1.5 text-[10px] leading-tight text-(--text-tertiary)">
                Max length will be calculated from the 99th percentile token length in the dataset.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
              Learning Rate
            </label>
            <select
              value={hyperparams.learning_rate}
              onChange={(e) =>
                setHyperparam("learning_rate", Number(e.target.value))
              }
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            >
              {[1e-5, 2e-5, 3e-5, 5e-5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
              Optimizer
            </label>
            <select
              value={hyperparams.optimizer}
              onChange={(e) => setHyperparam("optimizer", e.target.value)}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            >
              <option value="adamw">AdamW (recommended)</option>
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="adafactor">Adafactor</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--text-secondary)">
              Dropout
            </label>
            <select
              value={hyperparams.dropout}
              onChange={(e) => setHyperparam("dropout", Number(e.target.value))}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            >
              {[0.0, 0.1, 0.2, 0.3, 0.5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-5 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-(--text-tertiary) uppercase transition-colors hover:text-(--text-primary)"
        >
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
                value={hyperparams.warmup_steps}
                onChange={(e) =>
                  setHyperparam("warmup_steps", Number(e.target.value))
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
                value={hyperparams.weight_decay}
                onChange={(e) =>
                  setHyperparam("weight_decay", Number(e.target.value))
                }
                className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tombol Train ─────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-4 text-sm font-semibold tracking-wide text-(--bg-base) transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Creating job...
          </>
        ) : (
          <>
            <Send size={18} /> Start Training
          </>
        )}
      </button>
      {!canSubmit && !isSubmitting && (
        <p className="text-center text-xs text-(--text-tertiary)">
          {!selectedDatasetId
            ? "Select a dataset first"
            : !splitPreview?.is_valid
              ? "Insufficient data for training"
              : "Select a model architecture"}
        </p>
      )}
    </div>
  );
}
