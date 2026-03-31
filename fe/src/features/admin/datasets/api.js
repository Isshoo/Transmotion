import api from "@/libs/axios";

const datasetsApi = {
  getAll: (params) => api.get("/datasets", { params }),
  getById: (id) => api.get(`/datasets/${id}`),
  upload: (formData) =>
    api.post("/datasets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  preprocess: (id, data) => api.post(`/datasets/${id}/preprocess`, data),
  delete: (id) => api.delete(`/datasets/${id}`),
};

export default datasetsApi;
