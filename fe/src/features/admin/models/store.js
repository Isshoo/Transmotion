import { create } from "zustand";
import modelsApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useModelStore = create((set, get) => ({
  // ── List ───────────────────────────────────────────────────────
  models: [],
  total: 0,
  totalPages: 0,
  page: 1,
  perPage: 15,
  modelTypeFilter: "",
  isActiveFilter: "",
  sortBy: "created_at",
  sortOrder: "desc",
  isLoading: false,

  // ── Active models (untuk dropdown klasifikasi) ─────────────────
  activeModels: [],
  isLoadingActive: false,

  // ── Detail ─────────────────────────────────────────────────────
  currentModel: null,
  isLoadingDetail: false,

  // ── UI ─────────────────────────────────────────────────────────
  isSubmitting: false,
  isDetailModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  deleteTarget: null,

  // ── Fetch list ─────────────────────────────────────────────────
  fetchModels: async () => {
    const {
      page,
      perPage,
      modelTypeFilter,
      isActiveFilter,
      sortBy,
      sortOrder,
    } = get();
    set({ isLoading: true });
    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (modelTypeFilter) params.model_type = modelTypeFilter;
      if (isActiveFilter !== "") params.is_active = isActiveFilter;
      const { data: res } = await modelsApi.getAll(params);
      set({
        models: res.data,
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
    get().fetchModels();
  },
  setModelTypeFilter: (v) => {
    set({ modelTypeFilter: v, page: 1 });
    get().fetchModels();
  },
  setIsActiveFilter: (v) => {
    set({ isActiveFilter: v, page: 1 });
    get().fetchModels();
  },
  setSortBy: (v) => {
    set({ sortBy: v, page: 1 });
    get().fetchModels();
  },

  // ── Fetch active ───────────────────────────────────────────────
  fetchActiveModels: async () => {
    set({ isLoadingActive: true });
    try {
      const { data: res } = await modelsApi.getActive();
      set({ activeModels: res.data, isLoadingActive: false });
    } catch {
      set({ isLoadingActive: false });
    }
  },

  // ── Detail ─────────────────────────────────────────────────────
  fetchModel: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const { data: res } = await modelsApi.getById(id);
      set({ currentModel: res.data, isLoadingDetail: false });
      return res.data;
    } catch {
      set({ isLoadingDetail: false });
      return null;
    }
  },

  // ── Update ─────────────────────────────────────────────────────
  updateModel: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await modelsApi.update(id, data);
      await get().fetchModels();
      // Update currentModel jika sedang terbuka
      if (get().currentModel?.id === id) {
        set({ currentModel: { ...get().currentModel, ...res.data } });
      }
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Delete ─────────────────────────────────────────────────────
  deleteModel: async (id) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await modelsApi.delete(id);
      await get().fetchModels();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Modal ──────────────────────────────────────────────────────
  openDetailModal: (model) =>
    set({ currentModel: model, isDetailModalOpen: true }),
  closeDetailModal: () => set({ isDetailModalOpen: false }),
  openEditModal: (model) => set({ currentModel: model, isEditModalOpen: true }),
  closeEditModal: () => set({ isEditModalOpen: false }),
  openDeleteModal: (model) =>
    set({ deleteTarget: model, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ deleteTarget: null, isDeleteModalOpen: false }),
}));

export default useModelStore;
