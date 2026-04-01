"use client";

import { useState, useEffect, useRef } from "react";
import { X, BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import useTrainingStore from "../store";
import datasetsApi from "@/features/admin/datasets/api";
import SplitPreviewCard from "./SplitPreviewCard";

const MODEL_OPTIONS = [
  {
    value: "mbert",
    label: "mBERT",
    desc: "bert-base-multilingual-cased — cocok untuk dataset multibahasa & Bahasa Indonesia",
  },
  {
    value: "xlmr",
    label: "XLM-R",
    desc: "xlm-roberta-base — performa lebih baik untuk teks Bahasa Indonesia & rendah sumber daya",
  },
];

const DEFAULT_HYPERPARAMS = {
  learning_rate: 2e-5,
  epochs: 3,
  batch_size: 16,
  max_length: 128,
  warmup_steps: 0,
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

  // Auto-fetch preview saat dataset atau testSize berubah
  useEffect(() => {
    clearTimeout(previewTimeout.current);
    if (!datasetId) {
      clearSplitPreview();
      return;
    }
    previewTimeout.current = setTimeout(() => {
      fetchSplitPreview(datasetId, testSize);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, testSize]);

  const fetchReadyDatasets = async () => {
    setIsLoadingDatasets(true);
    try {
      const { data: res } = await datasetsApi.getAll({
        per_page: 100,
        sort_by: "created_at",
        sort_order: "desc",
      });
      // Hanya dataset yang sudah preprocessing selesai
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <BrainCircuit size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">
              Buat Training Job Baru
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex shrink-0 border-b">
          {[
            { n: 1, label: "Dataset & Split" },
            { n: 2, label: "Model & Hyperparameter" },
          ].map(({ n, label }) => (
            <button
              key={n}
              onClick={() =>
                n < step || (n === 2 && canProceedStep1) ? setStep(n) : null
              }
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition ${
                step === n
                  ? "border-blue-600 text-blue-600"
                  : n < step
                    ? "cursor-pointer border-transparent text-gray-500 hover:text-gray-700"
                    : "cursor-not-allowed border-transparent text-gray-400"
              }`}
            >
              <span
                className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  step === n
                    ? "bg-blue-600 text-white"
                    : n < step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {n < step ? "✓" : n}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* ── STEP 1 ─────────────────────────────────────── */}
          {step === 1 && (
            <>
              {/* Pilih dataset */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Dataset
                </label>
                <p className="mb-2 text-xs text-gray-400">
                  Hanya menampilkan dataset yang sudah melewati preprocessing.
                </p>
                {isLoadingDatasets ? (
                  <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-400">
                    Memuat daftar dataset...
                  </div>
                ) : datasets.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Belum ada dataset yang siap. Lakukan preprocessing dataset
                    terlebih dahulu.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => setDatasetId(ds.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          datasetId === ds.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${datasetId === ds.id ? "text-blue-700" : "text-gray-800"}`}
                        >
                          {ds.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>
                            {ds.num_rows_preprocessed?.toLocaleString("id")}{" "}
                            baris preprocessed
                          </span>
                          <span>
                            {ds.num_labels ??
                              Object.keys(
                                ds.class_distribution_preprocessed ?? {}
                              ).length}{" "}
                            kelas
                          </span>
                          <span>
                            Teks: {ds.text_column} · Label: {ds.label_column}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Test size slider */}
              {datasetId && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Ukuran Test Set
                    </label>
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
              )}

              {/* Split preview */}
              {datasetId && (
                <SplitPreviewCard
                  preview={splitPreview}
                  isLoading={isLoadingPreview}
                />
              )}
            </>
          )}

          {/* ── STEP 2 ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Ringkasan dataset */}
              {selectedDataset && splitPreview && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="mb-1 text-xs text-gray-400">
                    Dataset yang dipilih
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedDataset.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Train: {splitPreview.train_total?.toLocaleString("id")} ·
                    Test: {splitPreview.test_total?.toLocaleString("id")} ·
                    {splitPreview.num_labels} kelas
                  </p>
                </div>
              )}

              {/* Nama job */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nama Job{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder={`cth. mBERT Sentiment v1`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Pilih model */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Arsitektur Model
                </label>
                <div className="space-y-2">
                  {MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setModelType(opt.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        modelType === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${modelType === opt.value ? "text-blue-700" : "text-gray-800"}`}
                      >
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hyperparameter dasar */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Epochs
                  </label>
                  <select
                    value={hp.epochs}
                    onChange={(e) =>
                      setHp((p) => ({ ...p, epochs: Number(e.target.value) }))
                    }
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
                    value={hp.batch_size}
                    onChange={(e) =>
                      setHp((p) => ({
                        ...p,
                        batch_size: Number(e.target.value),
                      }))
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
                    Max Length (token)
                  </label>
                  <select
                    value={hp.max_length}
                    onChange={(e) =>
                      setHp((p) => ({
                        ...p,
                        max_length: Number(e.target.value),
                      }))
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
                    value={hp.learning_rate}
                    onChange={(e) =>
                      setHp((p) => ({
                        ...p,
                        learning_rate: Number(e.target.value),
                      }))
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

              {/* Advanced hyperparams */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  {showAdvanced ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                  {showAdvanced ? "Sembunyikan" : "Tampilkan"} parameter
                  lanjutan
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
                        value={hp.warmup_steps}
                        onChange={(e) =>
                          setHp((p) => ({
                            ...p,
                            warmup_steps: Number(e.target.value),
                          }))
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
                        value={hp.weight_decay}
                        onChange={(e) =>
                          setHp((p) => ({
                            ...p,
                            weight_decay: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-between gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>

          <div className="flex gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                ← Kembali
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lanjutkan →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Membuat Job..." : "Mulai Training"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
