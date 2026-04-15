import { create } from "zustand";
import classifyApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useClassifyStore = create((set, get) => ({
  // ── Models ─────────────────────────────────────────────────────
  activeModels: [],
  isLoadingModels: false,

  // ── Form state ─────────────────────────────────────────────────
  selectedModelId: "",
  inputText: "",

  // ── Result ─────────────────────────────────────────────────────
  result: null,
  isClassifying: false,
  error: null,

  // ── History ────────────────────────────────────────────────────
  history: [],
  historyTotal: 0,
  historyPage: 1,
  historyPerPage: 10,
  isLoadingHistory: false,

  // ── Fetch models ───────────────────────────────────────────────
  fetchActiveModels: async () => {
    set({ isLoadingModels: true });
    try {
      const { data: res } = await classifyApi.getActiveModels();
      set({ activeModels: res.data ?? [], isLoadingModels: false });
      // Auto-pilih model pertama jika belum ada yang dipilih
      if (!get().selectedModelId && res.data?.length > 0) {
        set({ selectedModelId: res.data[0].id });
      }
    } catch {
      set({ isLoadingModels: false });
    }
  },

  setSelectedModelId: (id) => {
    set({ selectedModelId: id, result: null, error: null });
    get().fetchHistory();
  },
  setInputText: (text) => set({ inputText: text, result: null, error: null }),

  // ── Classify ───────────────────────────────────────────────────
  classify: async () => {
    const { selectedModelId, inputText } = get();
    if (!selectedModelId || !inputText.trim()) return;

    set({ isClassifying: true, result: null, error: null });
    try {
      const { data: res } = await classifyApi.classify({
        model_id: selectedModelId,
        text: inputText.trim(),
      });
      set({ result: res.data, isClassifying: false });
      // Refresh history
      get().fetchHistory();
    } catch (err) {
      set({ error: getErrorMessage(err), isClassifying: false });
    }
  },

  clearResult: () => set({ result: null, error: null }),

  // ── History ────────────────────────────────────────────────────
  fetchHistory: async () => {
    const { historyPage, historyPerPage, selectedModelId } = get();
    set({ isLoadingHistory: true });
    try {
      const params = { page: historyPage, per_page: historyPerPage };
      if (selectedModelId) params.model_id = selectedModelId;
      const { data: res } = await classifyApi.getHistory(params);
      set({
        history: res.data ?? [],
        historyTotal: res.meta?.pagination?.total ?? 0,
        isLoadingHistory: false,
      });
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  setHistoryPage: (page) => {
    set({ historyPage: page });
    get().fetchHistory();
  },
}));

export default useClassifyStore;
