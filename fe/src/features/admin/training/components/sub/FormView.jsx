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
    modelType,
    jobName,
    hyperparams,
    splitPreview,
    isLoadingPreview,
    isSubmitting,
    setSelectedDatasetId,
    setTestSize,
    setModelType,
    setJobName,
    setHyperparam,
    createJob,
  } = useTrainingStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {datasets.map((ds) => (
              <button
                key={ds.id}
                type="button"
                onClick={() => setSelectedDatasetId(ds.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedDatasetId === ds.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
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
                <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>
                    {ds.num_rows_preprocessed?.toLocaleString("id")} baris
                  </span>
                  <span>
                    {
                      Object.keys(ds.class_distribution_preprocessed ?? {})
                        .length
                    }{" "}
                    kelas
                  </span>
                  <span>
                    {ds.text_column} → {ds.label_column}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Step 2: Ukuran Test Set + Preview ───────────────── */}
      {selectedDatasetId && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-1 text-sm font-semibold text-gray-800">
            Pembagian Data
          </p>
          <p className="mb-4 text-xs text-gray-400">
            Tentukan proporsi data yang digunakan untuk testing.
          </p>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-gray-600">Ukuran Test Set</span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(testSize * 100)}% test /{" "}
                {Math.round((1 - testSize) * 100)}% train
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={Math.round(testSize * 100)}
              onChange={(e) => setTestSize(e.target.value / 100)}
              className="w-full accent-blue-600"
            />
            <div className="mt-0.5 flex justify-between text-xs text-gray-400">
              <span>5%</span>
              <span>40%</span>
            </div>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            </label>
            <select
              value={hyperparams.max_length}
              onChange={(e) =>
                setHyperparam("max_length", Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[64, 128, 256, 512].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
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
