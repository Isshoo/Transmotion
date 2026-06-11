import { create } from "zustand";
import * as XLSX from "xlsx";
import classifyApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useClassifyStore = create((set, get) => ({
  // ── Models ─────────────────────────────────────────────────────
  activeModels: [],
  isLoadingModels: true,
  modelTypeFilter: "",

  // ── Form state ─────────────────────────────────────────────────
  selectedModelId: "",
  inputMode: "single", // "single" | "csv"
  inputText: "",
  csvTexts: [], // [{row: 1, text: "..."}, ...]
  csvFileName: "",
  csvHeaders: [],
  csvRows: [],
  selectedTextColumn: null,

  // ── Result ─────────────────────────────────────────────────────
  result: null, // for single
  batchResults: [], // for batch
  batchErrors: [],
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
    const { modelTypeFilter } = get();
    set({ isLoadingModels: true });
    try {
      const params = {};
      if (modelTypeFilter) params.model_type = modelTypeFilter;
      const { data: res } = await classifyApi.getActiveModels(params);
      set({ activeModels: res.data ?? [], isLoadingModels: false });
    } catch {
      set({ isLoadingModels: false });
    }
  },

  setModelTypeFilter: (v) => {
    set({ modelTypeFilter: v, selectedModelId: "" });
    get().fetchActiveModels();
  },

  setSelectedModelId: (id) => {
    set({
      selectedModelId: id,
      result: null,
      batchResults: [],
      batchErrors: [],
      error: null,
    });
    get().fetchHistory();
  },
  setInputMode: (mode) =>
    set({
      inputMode: mode,
      result: null,
      batchResults: [],
      batchErrors: [],
      error: null,
    }),
  setInputText: (text) => set({ inputText: text, result: null, error: null }),

  // ── Parse Files ──────────────────────────────────────────────
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
        const delimiter = text.includes("\t")
          ? "\t"
          : text.includes(";")
            ? ";"
            : ",";
        const allRows = lines.map((line) => {
          return line
            .split(delimiter)
            .map((c) => c.replace(/^["']|["']$/g, "").trim());
        });
        const headers = allRows[0];
        const rows = allRows.slice(1);
        resolve({ headers, rows });
      };
      reader.readAsText(file, "UTF-8");
    });
  },

  parseExcelFile: async (file) => {
    if (!file) return { headers: [], rows: [] };
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const allRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            blankrows: false,
          });
          if (allRows.length === 0) {
            resolve({ headers: [], rows: [] });
            return;
          }
          const headers = allRows[0].map((h) => String(h ?? "").trim());
          const rows = allRows
            .slice(1)
            .map((row) => row.map((cell) => String(cell ?? "").trim()));
          resolve({ headers, rows });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
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
        batchResults: [],
        batchErrors: [],
      });
      return;
    }
    const ext = file.name.split(".").pop().toLowerCase();
    const isExcel = ext === "xlsx" || ext === "xls";
    try {
      const { headers, rows } = isExcel
        ? await get().parseExcelFile(file)
        : await get().parseCsvFile(file);
      set({
        csvHeaders: headers,
        csvRows: rows,
        csvFileName: file.name,
        result: null,
        batchResults: [],
        batchErrors: [],
        selectedTextColumn: headers.length > 0 ? 0 : null,
      });
      get().updateCsvTexts(0);
    } catch (err) {
      set({ error: "Failed to read file: " + err.message });
    }
  },

  updateCsvTexts: (columnIndex) => {
    const { csvRows } = get();
    const texts = csvRows
      .map((row, i) => ({
        row: i + 1,
        text: row[columnIndex] || "",
      }))
      .filter((item) => item.text.length > 0);
    set({ csvTexts: texts, selectedTextColumn: columnIndex });
  },

  setSelectedTextColumn: (index) => {
    get().updateCsvTexts(index);
  },

  // ── Classify ───────────────────────────────────────────────────
  classify: async () => {
    const { selectedModelId, inputMode, inputText, csvTexts } = get();
    if (!selectedModelId) return;

    set({
      isClassifying: true,
      result: null,
      batchResults: [],
      batchErrors: [],
      error: null,
    });
    try {
      if (inputMode === "single") {
        if (!inputText.trim()) {
          set({ error: "Please enter text first", isClassifying: false });
          return;
        }
        const { data: res } = await classifyApi.classify({
          model_id: selectedModelId,
          text: inputText.trim(),
        });
        set({ result: res.data, isClassifying: false });
      } else {
        if (csvTexts.length === 0) {
          set({
            error: "Please select a file and text column first",
            isClassifying: false,
          });
          return;
        }
        const { data: res } = await classifyApi.classifyBatch({
          model_id: selectedModelId,
          texts: csvTexts.map((r) => r.text),
        });
        set({
          batchResults: res.data.results,
          batchErrors: res.data.errors || [],
          isClassifying: false,
        });
      }
      get().fetchHistory();
    } catch (err) {
      set({ error: getErrorMessage(err), isClassifying: false });
    }
  },

  clearResult: () =>
    set({ result: null, batchResults: [], batchErrors: [], error: null }),

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
