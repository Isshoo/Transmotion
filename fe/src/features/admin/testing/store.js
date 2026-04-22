import { create } from "zustand";
import testingApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useTestingStore = create((set, get) => ({
  // ── Models ─────────────────────────────────────────────────
  activeModels: [],
  isLoadingModels: false,
  modelTypeFilter: "",

  // ── Form ───────────────────────────────────────────────────
  selectedModelId: "",
  inputMode: "single", // "single" | "csv"
  inputText: "",
  csvTexts: [], // [{row: 1, text: "..."}, ...]
  csvFileName: "",

  // ── Results ────────────────────────────────────────────────
  results: [],
  batchErrors: [],
  isClassifying: false,
  error: null,

  // ── History ────────────────────────────────────────────────
  history: [],
  historyTotal: 0,
  historyPage: 1,
  historyPerPage: 15,
  isLoadingHistory: false,

  // ── Fetch models ───────────────────────────────────────────
  fetchActiveModels: async () => {
    const { modelTypeFilter } = get();
    set({ isLoadingModels: true });
    try {
      const params = {};
      if (modelTypeFilter) params.model_type = modelTypeFilter;
      const { data: res } = await testingApi.getActiveModels(params);
      set({
        activeModels: res.data ?? [],
        isLoadingModels: false,
      });
      // Auto-select pertama
      if (!get().selectedModelId && res.data?.length > 0) {
        set({ selectedModelId: res.data[0].id });
      }
    } catch {
      set({ isLoadingModels: false });
    }
  },

  setModelTypeFilter: (v) => {
    set({ modelTypeFilter: v, selectedModelId: "" });
    get().fetchActiveModels();
  },
  setSelectedModelId: (id) =>
    set({ selectedModelId: id, results: [], error: null }),
  setInputMode: (mode) => set({ inputMode: mode, results: [], error: null }),
  setInputText: (text) => set({ inputText: text }),

  // ── Parse CSV ───────────────────────────────────────────────
  parseCsvFile: async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        // Coba deteksi kolom teks (ambil kolom pertama non-header)
        const delimiter = text.includes("\t") ? "\t" : ",";
        const rows = lines.map((line) => {
          const cols = line.split(delimiter);
          return cols[0]?.replace(/^["']|["']$/g, "").trim() || "";
        });

        // Skip baris pertama jika terlihat seperti header
        const firstRow = rows[0]?.toLowerCase();
        const isHeader =
          firstRow === "text" || firstRow === "teks" || firstRow === "content";
        const data = isHeader ? rows.slice(1) : rows;

        resolve(
          data
            .filter((t) => t.length > 0)
            .map((text, i) => ({ row: i + 1, text }))
        );
      };
      reader.readAsText(file, "UTF-8");
    });
  },

  setCsvFile: async (file) => {
    const texts = await get().parseCsvFile(file);
    set({ csvTexts: texts, csvFileName: file.name, results: [] });
  },

  // ── Classify ───────────────────────────────────────────────
  classify: async () => {
    const { selectedModelId, inputMode, inputText, csvTexts } = get();
    if (!selectedModelId) return;

    set({ isClassifying: true, results: [], batchErrors: [], error: null });

    try {
      if (inputMode === "single") {
        if (!inputText.trim()) {
          set({ error: "Masukkan teks terlebih dahulu", isClassifying: false });
          return;
        }
        const { data: res } = await testingApi.classifySingle({
          model_id: selectedModelId,
          text: inputText.trim(),
        });
        set({ results: [res.data] });
      } else {
        if (csvTexts.length === 0) {
          set({
            error: "Upload file CSV terlebih dahulu",
            isClassifying: false,
          });
          return;
        }
        const { data: res } = await testingApi.classifyBatch({
          model_id: selectedModelId,
          texts: csvTexts.map((r) => r.text),
        });
        set({
          results: res.data.results,
          batchErrors: res.data.errors || [],
        });
      }
      // Refresh history
      get().fetchHistory();
    } catch (err) {
      set({ error: getErrorMessage(err) });
    } finally {
      set({ isClassifying: false });
    }
  },

  clearResults: () => set({ results: [], batchErrors: [], error: null }),

  // ── History ────────────────────────────────────────────────
  fetchHistory: async () => {
    const { historyPage, historyPerPage, selectedModelId } = get();
    set({ isLoadingHistory: true });
    try {
      const params = { page: historyPage, per_page: historyPerPage };
      if (selectedModelId) params.model_id = selectedModelId;
      const { data: res } = await testingApi.getHistory(params);
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

export default useTestingStore;
