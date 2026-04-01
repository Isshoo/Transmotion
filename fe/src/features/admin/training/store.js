import { create } from "zustand";
import trainingApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useTrainingStore = create((set, get) => ({
  // ── List ───────────────────────────────────────────────────────
  jobs: [],
  total: 0,
  totalPages: 0,
  page: 1,
  perPage: 15,
  statusFilter: "",
  modelTypeFilter: "",
  isLoading: false,

  // ── Detail ─────────────────────────────────────────────────────
  currentJob: null,
  isLoadingDetail: false,

  // ── Split preview ──────────────────────────────────────────────
  splitPreview: null,
  isLoadingPreview: false,

  // ── UI ─────────────────────────────────────────────────────────
  isSubmitting: false,
  isCreateModalOpen: false,
  isDetailModalOpen: false,
  isCancelModalOpen: false,
  cancelTarget: null,

  // ── List actions ───────────────────────────────────────────────
  fetchJobs: async () => {
    const { page, perPage, statusFilter, modelTypeFilter } = get();
    if (get().jobs.length === 0) {
      set({ isLoading: true });
    }
    try {
      const params = { page, per_page: perPage };
      if (statusFilter) params.status = statusFilter;
      if (modelTypeFilter) params.model_type = modelTypeFilter;
      const { data: res } = await trainingApi.getAll(params);
      set({
        jobs: res.data,
        total: res.meta?.pagination?.total ?? 0,
        totalPages: res.meta?.pagination?.total_pages ?? 1,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchJobs();
  },
  setStatusFilter: (statusFilter) => {
    set({ statusFilter, page: 1 });
    get().fetchJobs();
  },
  setModelTypeFilter: (modelTypeFilter) => {
    set({ modelTypeFilter, page: 1 });
    get().fetchJobs();
  },

  // ── Detail actions ─────────────────────────────────────────────
  fetchJob: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const { data: res } = await trainingApi.getById(id);
      set({ currentJob: res.data, isLoadingDetail: false });
      return res.data;
    } catch {
      set({ isLoadingDetail: false });
      return null;
    }
  },

  refreshJob: async (id) => {
    try {
      const { data: res } = await trainingApi.getById(id);
      set({ currentJob: res.data });
      // Update juga di list
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? res.data : j)),
      }));
      return res.data;
    } catch {
      return null;
    }
  },

  // ── Split preview ──────────────────────────────────────────────
  fetchSplitPreview: async (datasetId, testSize) => {
    if (!datasetId || !testSize) {
      set({ splitPreview: null });
      return null;
    }
    const { splitPreview } = get();
    if (splitPreview === null) {
      set({ isLoadingPreview: true });
    }
    try {
      const { data: res } = await trainingApi.splitPreview({
        dataset_id: datasetId,
        test_size: testSize,
      });
      set({ splitPreview: res.data, isLoadingPreview: false });
      return res.data;
    } catch (err) {
      set({
        splitPreview: {
          is_valid: false,
          validation_errors: [getErrorMessage(err)],
        },
        isLoadingPreview: false,
      });
      return null;
    }
  },

  clearSplitPreview: () => set({ splitPreview: null }),

  // ── CRUD ───────────────────────────────────────────────────────
  createJob: async (payload) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await trainingApi.create(payload);
      await get().fetchJobs();
      return { success: true, message: res.message, data: res.data };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  cancelJob: async (id) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await trainingApi.cancel(id);
      await get().fetchJobs();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Modal ──────────────────────────────────────────────────────
  openCreateModal: () => set({ isCreateModalOpen: true, splitPreview: null }),
  closeCreateModal: () => set({ isCreateModalOpen: false, splitPreview: null }),
  openDetailModal: (job) => set({ currentJob: job, isDetailModalOpen: true }),
  closeDetailModal: () => set({ isDetailModalOpen: false }),
  openCancelModal: (job) => set({ cancelTarget: job, isCancelModalOpen: true }),
  closeCancelModal: () => set({ cancelTarget: null, isCancelModalOpen: false }),
}));

export default useTrainingStore;
