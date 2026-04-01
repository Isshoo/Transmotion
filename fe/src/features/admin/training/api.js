import api from "@/libs/axios";

const trainingApi = {
  getAll: (params) => api.get("/training-jobs", { params }),
  getById: (id) => api.get(`/training-jobs/${id}`),
  create: (data) => api.post("/training-jobs", data),
  cancel: (id) => api.post(`/training-jobs/${id}/cancel`),
  splitPreview: (data) => api.post("/training-jobs/split-preview", data),
};

export default trainingApi;
