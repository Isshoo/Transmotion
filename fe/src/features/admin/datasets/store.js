import { create } from "zustand";
import datasetsApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useDatasetStore = create((set, get) => ({
  // ── List ───────────────────────────────────────────────────────
  datasets: [],
  total: 0,
  totalPages: 0,
  page: 1,
  perPage: 10,
  search: "",
  statusFilter: "",
  isLoading: false,

  // ── Detail ─────────────────────────────────────────────────────
  currentDataset: null,
  isLoadingDetail: false,

  // ── Raw tab ────────────────────────────────────────────────────
  rawRows: [],
  rawTotal: 0,
  rawPage: 1,
  rawPerPage: 10,
  rawSearch: "",
  rawFilterLabel: "",
  isLoadingRaw: false,

  // ── Preprocessed tab ───────────────────────────────────────────
  preprocessedRows: [],
  preprocessedTotal: 0,
  preprocessedPage: 1,
  preprocessedPerPage: 10,
  preprocessedSearch: "",
  preprocessedFilterLabel: "",
  isLoadingPreprocessed: false,

  // ── UI ─────────────────────────────────────────────────────────
  isSubmitting: false,
  isUploadModalOpen: false,
  isDeleteModalOpen: false,
  isPreprocessModalOpen: false,
  isAddRowModalOpen: false,
  isEditRowModalOpen: false,
  deleteTarget: null,
  editRowTarget: null,

  // ── List actions ───────────────────────────────────────────────
  fetchDatasets: async () => {
    const { page, perPage, search, statusFilter } = get();
    if (get().datasets.length === 0) {
      set({ isLoading: true });
    }
    try {
      const params = { page, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data: res } = await datasetsApi.getAll(params);
      set({
        datasets: res.data,
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
    get().fetchDatasets();
  },
  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchDatasets();
  },
  setStatusFilter: (statusFilter) => {
    set({ statusFilter, page: 1 });
    get().fetchDatasets();
  },

  uploadDataset: async (formData) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.upload(formData);
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

  // ── Detail actions ─────────────────────────────────────────────
  fetchDataset: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const { data: res } = await datasetsApi.getById(id);
      set({ currentDataset: res.data, isLoadingDetail: false });
      return res.data;
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  setColumns: async (id, textColumn, labelColumn) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.setColumns(id, {
        text_column: textColumn,
        label_column: labelColumn,
      });
      set({ currentDataset: res.data });
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Raw data actions ───────────────────────────────────────────
  fetchRawData: async (id) => {
    const { rawPage, rawPerPage, rawSearch, rawFilterLabel } = get();
    if (get().rawRows.length === 0) {
      set({ isLoadingRaw: true });
    }
    try {
      const params = { page: rawPage, per_page: rawPerPage };
      if (rawSearch) params.search = rawSearch;
      if (rawFilterLabel) params.filter_label = rawFilterLabel;
      const { data: res } = await datasetsApi.getRawData(id, params);
      set({
        rawRows: res.data,
        rawTotal: res.meta?.pagination?.total ?? 0,
        isLoadingRaw: false,
      });
    } catch {
      set({ isLoadingRaw: false });
    }
  },

  setRawPage: (id, page) => {
    set({ rawPage: page });
    get().fetchRawData(id);
  },
  setRawSearch: (id, search) => {
    set({ rawSearch: search, rawPage: 1 });
    get().fetchRawData(id);
  },
  setRawFilterLabel: (id, label) => {
    set({ rawFilterLabel: label, rawPage: 1 });
    get().fetchRawData(id);
  },

  // ── Preprocessing actions ──────────────────────────────────────
  startPreprocessing: async (id) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.startPreprocessing(id);
      set({ currentDataset: res.data });
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Dipanggil oleh polling
  refreshDataset: async (id) => {
    try {
      const { data: res } = await datasetsApi.getById(id);
      set({ currentDataset: res.data });
      return res.data;
    } catch {
      return null;
    }
  },

  // ── Preprocessed data actions ──────────────────────────────────
  fetchPreprocessedData: async (id) => {
    const {
      preprocessedPage,
      preprocessedPerPage,
      preprocessedSearch,
      preprocessedFilterLabel,
    } = get();
    if (get().preprocessedRows.length === 0) {
      set({ isLoadingPreprocessed: true });
    }
    try {
      const params = { page: preprocessedPage, per_page: preprocessedPerPage };
      if (preprocessedSearch) params.search = preprocessedSearch;
      if (preprocessedFilterLabel)
        params.filter_label = preprocessedFilterLabel;
      const { data: res } = await datasetsApi.getPreprocessedData(id, params);
      set({
        preprocessedRows: res.data,
        preprocessedTotal: res.meta?.pagination?.total ?? 0,
        isLoadingPreprocessed: false,
      });
    } catch {
      set({ isLoadingPreprocessed: false });
    }
  },

  setPreprocessedPage: (id, page) => {
    set({ preprocessedPage: page });
    get().fetchPreprocessedData(id);
  },
  setPreprocessedSearch: (id, search) => {
    set({ preprocessedSearch: search, preprocessedPage: 1 });
    get().fetchPreprocessedData(id);
  },
  setPreprocessedFilterLabel: (id, label) => {
    set({ preprocessedFilterLabel: label, preprocessedPage: 1 });
    get().fetchPreprocessedData(id);
  },

  addPreprocessedRow: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.addPreprocessedRow(id, data);
      await get().fetchPreprocessedData(id);
      await get().refreshDataset(id);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePreprocessedRow: async (id, rowId, data) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.updatePreprocessedRow(
        id,
        rowId,
        data
      );
      await get().fetchPreprocessedData(id);
      await get().refreshDataset(id);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePreprocessedRow: async (id, rowId) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await datasetsApi.deletePreprocessedRow(id, rowId);
      await get().fetchPreprocessedData(id);
      await get().refreshDataset(id);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Modal actions ──────────────────────────────────────────────
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  openDeleteModal: (dataset) =>
    set({ deleteTarget: dataset, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ deleteTarget: null, isDeleteModalOpen: false }),
  openPreprocessModal: () => set({ isPreprocessModalOpen: true }),
  closePreprocessModal: () => set({ isPreprocessModalOpen: false }),
  openAddRowModal: () => set({ isAddRowModalOpen: true }),
  closeAddRowModal: () => set({ isAddRowModalOpen: false }),
  openEditRowModal: (row) =>
    set({ editRowTarget: row, isEditRowModalOpen: true }),
  closeEditRowModal: () =>
    set({ editRowTarget: null, isEditRowModalOpen: false }),
}));

export default useDatasetStore;
