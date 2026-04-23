import { create } from "zustand";
import evaluationApi from "./api";

const useEvaluationStore = create((set, get) => ({
  // ── Datasets ───────────────────────────────────────────────
  datasets: [],
  isLoadingDatasets: false,

  // ── Selected ───────────────────────────────────────────────
  selectedDatasetId: "",

  // ── Compare data ───────────────────────────────────────────
  // Array of { dataset_id, dataset_name, mbert: [], xlmr: [] }
  compareData: [],
  isLoadingCompare: false,

  // ── Fetch ──────────────────────────────────────────────────
  fetchDatasets: async () => {
    set({ isLoadingDatasets: true });
    try {
      const { data: res } = await evaluationApi.getDatasets();
      set({ datasets: res.data ?? [], isLoadingDatasets: false });
    } catch {
      set({ isLoadingDatasets: false });
    }
  },

  fetchCompare: async (datasetId = "") => {
    set({ isLoadingCompare: true });
    try {
      const { data: res } = await evaluationApi.getCompare(datasetId);
      set({ compareData: res.data ?? [], isLoadingCompare: false });
    } catch {
      set({ isLoadingCompare: false });
    }
  },

  setSelectedDataset: (id) => {
    set({ selectedDatasetId: id });
    get().fetchCompare(id);
  },
}));

export default useEvaluationStore;
