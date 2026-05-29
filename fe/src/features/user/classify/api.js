import api from "@/libs/axios";

const classifyApi = {
  getActiveModels: (params) => api.get("/models/active", { params }),
  classify: (data) => api.post("/predictions/classify", data),
  classifyBatch: (data) => api.post("/predictions/classify/batch", data),
  getHistory: (params) => api.get("/predictions", { params }),
};

export default classifyApi;
