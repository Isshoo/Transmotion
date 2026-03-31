import { create } from "zustand";
import datasetsApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useDatasetStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────────
  datasets: [],
  total: 0,
  totalPages: 0,
  selectedDataset: null,

  // ── Pagination & Filter ───────────────────────────────────────
  page: 1,
  perPage: 10,
  search: "",
  status: "",

  // ── UI State ──────────────────────────────────────────────────
  isLoading: false,
  isSubmitting: false,
  error: null,

  // ── Modal State ───────────────────────────────────────────────
  isUploadModalOpen: false,
  isPreprocessModalOpen: false,
  isDeleteModalOpen: false,
  preprocessTarget: null,
  deleteTarget: null,

  // ── Actions: Fetch ────────────────────────────────────────────
  fetchDatasets: async () => {
    const { page, perPage, search, status } = get();

    set({ isLoading: true });

    try {
      const params = { page, per_page: perPage };
      if (search) params.search = search;
      if (status) params.status = status;

      const { data: res } = await datasetsApi.getAll(params);
      set({
        datasets: res.data,
        total: res.meta?.pagination?.total ?? 0,
        totalPages: res.meta?.pagination?.total_pages ?? 1,
        isLoading: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  // ── Actions: CRUD ─────────────────────────────────────────────
  uploadDataset: async (formData) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.upload(formData);
      await get().fetchDatasets();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  preprocessDataset: async (id, payload) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.preprocess(id, payload);
      await get().fetchDatasets();
      return { success: true, message: res.message, data: res.data };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteDataset: async (id) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.delete(id);
      await get().fetchDatasets();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Actions: Filter & Pagination ──────────────────────────────
  setPage: (page) => {
    set({ page });
    get().fetchDatasets();
  },
  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchDatasets();
  },
  setStatus: (status) => {
    set({ status, page: 1 });
    get().fetchDatasets();
  },

  // ── Actions: Modal ────────────────────────────────────────────
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),

  openPreprocessModal: (dataset) =>
    set({ preprocessTarget: dataset, isPreprocessModalOpen: true }),
  closePreprocessModal: () =>
    set({ preprocessTarget: null, isPreprocessModalOpen: false }),

  openDeleteModal: (dataset) =>
    set({ deleteTarget: dataset, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ deleteTarget: null, isDeleteModalOpen: false }),
}));

export default useDatasetStore;
