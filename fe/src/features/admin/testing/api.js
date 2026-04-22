import api from "@/libs/axios";

const testingApi = {
  getActiveModels: (params) => api.get("/models/active", { params }),
  classifySingle: (data) => api.post("/predictions/classify", data),
  classifyBatch: (data) => api.post("/predictions/classify/batch", data),
  getHistory: (params) => api.get("/predictions", { params }),
};

export default testingApi;
