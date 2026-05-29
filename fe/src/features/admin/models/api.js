import api from "@/libs/axios";

const modelsApi = {
  getAll: (params) => api.get("/models", { params }),
  getById: (id) => api.get(`/models/${id}`),
  getActive: () => api.get("/models/active"),
  update: (id, data) => api.put(`/models/${id}`, data),
  delete: (id) => api.delete(`/models/${id}`),
};

export default modelsApi;
