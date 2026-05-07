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
    badge: "bg-teal-100 text-teal-700",
    desc: "bert-base-multilingual-cased — cocok untuk dataset multibahasa",
  },
  {
    value: "xlmr",
    label: "XLM-R",
    badge: "bg-purple-100 text-purple-700",
    desc: "xlm-roberta-base — performa lebih baik untuk Bahasa Indonesia",
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

  const [showAdvanced, setShowAdvanced] = useState(false);
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
      {/* ── Step 1: Pilih Dataset ────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-800">
          Pilih Dataset
        </p>
        <p className="mb-4 text-xs text-gray-400">
          Hanya dataset yang sudah dipreprocess yang ditampilkan.
        </p>

        {isLoadingDatasets ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={15} className="animate-spin" /> Memuat dataset...
          </div>
        ) : datasets.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Belum ada dataset yang siap. Lakukan preprocessing dataset terlebih
            dahulu.
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                selectedDatasetId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {selectedDataset ? (
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {selectedDataset.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-blue-500">
                    {selectedDataset.num_rows_preprocessed?.toLocaleString(
                      "id"
                    )}{" "}
                    baris ·{" "}
                    {
                      Object.keys(
                        selectedDataset.class_distribution_preprocessed ?? {}
                      ).length
                    }{" "}
                    kelas · {selectedDataset.text_column} →{" "}
                    {selectedDataset.label_column}
                  </p>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Pilih dataset...</span>
              )}
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${
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
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  {datasets.map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={() => {
                        setSelectedDatasetId(ds.id);
                        setIsDatasetDropdownOpen(false);
                      }}
                      className={`flex w-full flex-col px-4 py-3 text-left transition hover:bg-gray-50 ${
                        selectedDatasetId === ds.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          selectedDatasetId === ds.id
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {ds.name}
                      </p>
                      <div className="mt-0.5 flex gap-2 text-[11px] text-gray-500">
                        <span>
                          {ds.num_rows_preprocessed?.toLocaleString("id")} baris
                        </span>
                        <span>
                          {
                            Object.keys(
                              ds.class_distribution_preprocessed ?? {}
                            ).length
                          }{" "}
                          kelas
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
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-1 text-sm font-semibold text-gray-800">
            Pembagian Data (Train / Validation / Test)
          </p>
          <p className="mb-4 text-xs text-gray-400">
            Data dibagi 3: train untuk pelatihan, validation untuk monitoring
            per epoch, test untuk evaluasi akhir.
          </p>

          <div className="mb-5 space-y-4">
            {/* Test size */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  Test Set
                </span>
                <span className="text-xs font-semibold text-amber-600">
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
                className="w-full accent-amber-500"
              />
            </div>

            {/* Eval size */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  Validation Set
                </span>
                <span className="text-xs font-semibold text-purple-600">
                  {Math.round(evalSize * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={Math.round(evalSize * 100)}
                onChange={(e) => setEvalSize(e.target.value / 100)}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Visual bar */}
            {splitPreview && (
              <div>
                <div className="flex h-4 overflow-hidden rounded-full">
                  {[
                    [
                      Math.round((1 - testSize - evalSize) * 100),
                      "bg-blue-500",
                      "Train",
                    ],
                    [Math.round(evalSize * 100), "bg-purple-400", "Val"],
                    [Math.round(testSize * 100), "bg-amber-400", "Test"],
                  ].map(([pct, color, label]) => (
                    <div
                      key={label}
                      className={`${color} flex items-center justify-center text-[10px] font-medium text-white transition-all`}
                      style={{ width: `${pct}%` }}
                    >
                      {pct >= 5 && `${label} ${pct}%`}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex gap-3">
                  {[
                    [
                      "bg-blue-500",
                      `Train ${Math.round((1 - testSize - evalSize) * 100)}%`,
                    ],
                    [
                      "bg-purple-400",
                      `Validation ${Math.round(evalSize * 100)}%`,
                    ],
                    ["bg-amber-400", `Test ${Math.round(testSize * 100)}%`],
                  ].map(([color, label]) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 text-xs text-gray-500"
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
      {/* ── Step 3: Pilih Model ──────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-800">
          Arsitektur Model
        </p>
        <p className="mb-4 text-xs text-gray-400">
          Pilih model transformer yang akan di-fine-tune.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setModelType(opt.value)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                modelType === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${opt.badge}`}
                >
                  {opt.label}
                </span>
                {modelType === opt.value && (
                  <CheckCircle size={14} className="text-blue-600" />
                )}
              </div>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {/* ── Step 4: Hyperparameter ───────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-800">
          Hyperparameter
        </p>
        <p className="mb-4 text-xs text-gray-400">
          Konfigurasi proses training. Default sudah dioptimalkan.
        </p>

        {/* Nama job */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nama Job{" "}
            <span className="font-normal text-gray-400">(opsional)</span>
          </label>
          <input
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder={`cth. ${modelType.toUpperCase()} Sentiment v1`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Hyperparameter dasar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Epochs
            </label>
            <select
              value={hyperparams.epochs}
              onChange={(e) => setHyperparam("epochs", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 8, 10].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Batch Size
            </label>
            <select
              value={hyperparams.batch_size}
              onChange={(e) =>
                setHyperparam("batch_size", Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[8, 16, 32].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Max Length
              <span className="ml-1 font-normal text-gray-400">(token)</span>
            </label>
            <select
              value={hyperparams.max_length}
              onChange={(e) => {
                const val =
                  e.target.value === "auto" ? "auto" : Number(e.target.value);
                setHyperparam("max_length", val);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="auto">Auto (deteksi otomatis)</option>
              {[64, 128, 256, 512].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {hyperparams.max_length === "auto" && (
              <p className="mt-1 text-[11px] text-gray-400">
                Max length akan dihitung dari persentil ke-99 panjang token di
                dataset.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Learning Rate
            </label>
            <select
              value={hyperparams.learning_rate}
              onChange={(e) =>
                setHyperparam("learning_rate", Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[1e-5, 2e-5, 3e-5, 5e-5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Optimizer
            </label>
            <select
              value={hyperparams.optimizer}
              onChange={(e) => setHyperparam("optimizer", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="adamw">AdamW (rekomendasi)</option>
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="adafactor">Adafactor</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Dropout
            </label>
            <select
              value={hyperparams.dropout}
              onChange={(e) => setHyperparam("dropout", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          className="mt-4 flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showAdvanced ? "Sembunyikan" : "Tampilkan"} parameter lanjutan
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
      {/* ── Tombol Train ─────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Membuat job...
          </>
        ) : (
          <>
            <Send size={18} /> Mulai Training
          </>
        )}
      </button>
      {!canSubmit && !isSubmitting && (
        <p className="text-center text-xs text-gray-400">
          {!selectedDatasetId
            ? "Pilih dataset terlebih dahulu"
            : !splitPreview?.is_valid
              ? "Data tidak mencukupi untuk training"
              : "Pilih arsitektur model"}
        </p>
      )}
    </div>
  );
}
