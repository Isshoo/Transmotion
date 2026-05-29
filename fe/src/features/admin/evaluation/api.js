import api from "@/libs/axios";

const evaluationApi = {
  getDatasets: () => api.get("/models/evaluation/datasets"),
  getCompare: (datasetId) =>
    api.get("/models/evaluation/compare", {
      params: datasetId ? { dataset_id: datasetId } : {},
    }),
};

export default evaluationApi;
