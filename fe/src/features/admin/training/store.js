import { create } from "zustand";
import trainingApi from "./api";
import datasetsApi from "@/features/admin/datasets/api";
import { getErrorMessage } from "@/helpers/error";

const useTrainingStore = create((set, get) => ({
  // ── View state ─────────────────────────────────────────────
  // "form" | "progress" | "result"
  view: "form",

  // ── Form ───────────────────────────────────────────────────
  datasets: [],
  isLoadingDatasets: false,
  selectedDatasetId: "",
  testSize: 0.2,
  modelType: "mbert",
  jobName: "",
  hyperparams: {
    learning_rate: 2e-5,
    epochs: 3,
    batch_size: 16,
    max_length: 256,
    warmup_steps: 0.1,
    weight_decay: 0.01,
  },

  // ── Split preview ──────────────────────────────────────────
  splitPreview: null,
  isLoadingPreview: false,

  // ── Active job (progress / result) ─────────────────────────
  activeJob: null,
  isLoadingActive: false,

  // ── UI ─────────────────────────────────────────────────────
  isSubmitting: false,

  // ── Init: cek apakah ada job aktif saat masuk halaman ──────
  init: async () => {
    // Selalu reset form ke default
    set({
      view: "form",
      selectedDatasetId: "",
      testSize: 0.2,
      modelType: "mbert",
      jobName: "",
      splitPreview: null,
      hyperparams: {
        learning_rate: 2e-5,
        epochs: 3,
        batch_size: 16,
        max_length: 256,
        warmup_steps: 0.1,
        weight_decay: 0.01,
      },
    });

    // Load datasets
    get().fetchDatasets();

    // Cek apakah ada job yang sedang berjalan
    try {
      const { data: res } = await trainingApi.getActive();
      const job = res.data;
      if (job && ["queued", "running"].includes(job.status)) {
        set({ activeJob: job, view: "progress" });
      } else if (job && job.status === "completed") {
        // Ada job selesai — tampilkan result tapi tetap bisa reset
        // (opsional: comment baris ini jika tidak mau tampilkan result lama)
        // set({ activeJob: job, view: "result" });
      }
    } catch {
      // Tidak ada job aktif, tetap di form
    }
  },

  resetToForm: () => {
    set({
      view: "form",
      activeJob: null,
      selectedDatasetId: "",
      testSize: 0.2,
      modelType: "mbert",
      jobName: "",
      splitPreview: null,
      hyperparams: {
        learning_rate: 2e-5,
        epochs: 3,
        batch_size: 16,
        max_length: 256,
        warmup_steps: 0.1,
        weight_decay: 0.01,
      },
    });
  },

  // ── Datasets ───────────────────────────────────────────────
  fetchDatasets: async () => {
    set({ isLoadingDatasets: true });
    try {
      const { data: res } = await datasetsApi.getAll({
        per_page: 100,
        sort_by: "created_at",
        sort_order: "desc",
      });
      const ready = (res.data ?? []).filter(
        (d) =>
          d.preprocessing_status === "completed" &&
          (d.num_rows_preprocessed ?? 0) > 0
      );
      set({ datasets: ready, isLoadingDatasets: false });
    } catch {
      set({ isLoadingDatasets: false });
    }
  },

  // ── Form setters ───────────────────────────────────────────
  setSelectedDatasetId: (id) => {
    set({ selectedDatasetId: id, splitPreview: null });
    if (id) get().fetchSplitPreview(id, get().testSize);
  },

  setTestSize: (v) => {
    set({ testSize: v });
    const { selectedDatasetId } = get();
    if (selectedDatasetId) get().fetchSplitPreview(selectedDatasetId, v);
  },

  setModelType: (v) => set({ modelType: v }),
  setJobName: (v) => set({ jobName: v }),
  setHyperparam: (key, value) =>
    set((state) => ({
      hyperparams: { ...state.hyperparams, [key]: value },
    })),

  // ── Split preview ──────────────────────────────────────────
  fetchSplitPreview: async (datasetId, testSize) => {
    set({ isLoadingPreview: true });
    try {
      const { data: res } = await trainingApi.splitPreview({
        dataset_id: datasetId,
        test_size: testSize,
      });
      set({ splitPreview: res.data, isLoadingPreview: false });
    } catch (err) {
      set({
        splitPreview: {
          is_valid: false,
          validation_errors: [getErrorMessage(err)],
        },
        isLoadingPreview: false,
      });
    }
  },

  // ── Submit ─────────────────────────────────────────────────
  createJob: async () => {
    const { selectedDatasetId, testSize, modelType, jobName, hyperparams } =
      get();

    set({ isSubmitting: true });
    try {
      const { data: res } = await trainingApi.create({
        dataset_id: selectedDatasetId,
        model_type: modelType,
        test_size: testSize,
        job_name: jobName.trim() || undefined,
        ...hyperparams,
      });
      set({
        activeJob: res.data,
        view: "progress",
        isSubmitting: false,
      });
      return { success: true };
    } catch (err) {
      set({ isSubmitting: false });
      return { success: false, message: getErrorMessage(err) };
    }
  },

  // ── SSE update ─────────────────────────────────────────────
  setActiveJob: (job) => {
    if (!job) return;
    set({ activeJob: job });
    if (job.status === "completed" || job.status === "failed") {
      set({ view: "result" });
    }
  },

  // ── Cancel ─────────────────────────────────────────────────
  cancelJob: async () => {
    const { activeJob } = get();
    if (!activeJob) return;
    set({ isSubmitting: true });
    try {
      const { data: res } = await trainingApi.cancel(activeJob.id);
      set({ activeJob: res.data, view: "result", isSubmitting: false });
      return { success: true, message: res.message };
    } catch (err) {
      set({ isSubmitting: false });
      return { success: false, message: getErrorMessage(err) };
    }
  },
}));

export default useTrainingStore;
