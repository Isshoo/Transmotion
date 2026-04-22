import api from "@/libs/axios";

const trainingApi = {
  getActive: () => api.get("/training-jobs/active"),
  getAll: (params) => api.get("/training-jobs", { params }),
  getById: (id) => api.get(`/training-jobs/${id}`),
  create: (data) => api.post("/training-jobs", data),
  cancel: (id) => api.post(`/training-jobs/${id}/cancel`),
  delete: (id) => api.delete(`/training-jobs/${id}`),
  splitPreview: (data) => api.post("/training-jobs/split-preview", data),
};

export default trainingApi;
