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
  csvTexts: [], // [{row: 1, text: "..."}, ...] (final texts to classify)
  csvFileName: "",
  csvHeaders: [],
  csvRows: [], // [[col1, col2, ...], ...]
  selectedTextColumn: null, // index of column

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
    if (!file) return { headers: [], rows: [] };
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length === 0) {
          resolve({ headers: [], rows: [] });
          return;
        }

        const delimiter = text.includes("\t") ? "\t" : text.includes(";") ? ";" : ",";
        
        // Parse all rows
        const allRows = lines.map((line) => {
          // Simple CSV split (doesn't handle quoted delimiters perfectly but usually enough)
          return line.split(delimiter).map(c => c.replace(/^["']|["']$/g, "").trim());
        });

        const headers = allRows[0];
        const rows = allRows.slice(1);

        resolve({ headers, rows });
      };
      reader.readAsText(file, "UTF-8");
    });
  },

  setCsvFile: async (file) => {
    if (!file) {
      set({ 
        csvTexts: [], 
        csvFileName: "", 
        csvHeaders: [], 
        csvRows: [], 
        selectedTextColumn: null,
        results: [] 
      });
      return;
    }
    const { headers, rows } = await get().parseCsvFile(file);
    set({ 
      csvHeaders: headers, 
      csvRows: rows, 
      csvFileName: file.name, 
      results: [],
      selectedTextColumn: headers.length > 0 ? 0 : null, // Default to first column
    });
    
    // Automatically prepare csvTexts if column is selected
    get().updateCsvTexts(0);
  },

  updateCsvTexts: (columnIndex) => {
    const { csvRows } = get();
    const texts = csvRows
      .map((row, i) => ({ 
        row: i + 1, 
        text: row[columnIndex] || "" 
      }))
      .filter(item => item.text.length > 0);
    
    set({ csvTexts: texts, selectedTextColumn: columnIndex });
  },

  setSelectedTextColumn: (index) => {
    get().updateCsvTexts(index);
  },

  // ── Classify ───────────────────────────────────────────────
  classify: async () => {
    const { selectedModelId, inputMode, inputText, csvTexts, selectedTextColumn } = get();
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
          const msg = selectedTextColumn === null 
            ? "Pilih kolom teks terlebih dahulu" 
            : "Upload file CSV terlebih dahulu atau kolom yang dipilih kosong";
          set({
            error: msg,
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
