import api from "@/libs/axios";

const classifyApi = {
  getActiveModels: () => api.get("/models/active"),
  classify: (data) => api.post("/predictions/classify", data),
  getHistory: (params) => api.get("/predictions", { params }),
};

export default classifyApi;
