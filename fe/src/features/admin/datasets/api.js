import api from "@/libs/axios";

const datasetsApi = {
  getAll: (params) => api.get("/datasets", { params }),
  getById: (id) => api.get(`/datasets/${id}`),
  upload: (formData) =>
    api.post("/datasets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/datasets/${id}`),

  // Pengaturan kolom
  setColumns: (id, data) => api.put(`/datasets/${id}/columns`, data),

  // Raw data
  getRawData: (id, params) => api.get(`/datasets/${id}/raw`, { params }),

  // Preprocessing
  startPreprocessing: (id) => api.post(`/datasets/${id}/preprocess`),
  getPreprocessedData: (id, params) =>
    api.get(`/datasets/${id}/preprocessed`, { params }),
  addPreprocessedRow: (id, data) =>
    api.post(`/datasets/${id}/preprocessed`, data),
  updatePreprocessedRow: (id, rowId, data) =>
    api.put(`/datasets/${id}/preprocessed/${rowId}`, data),
  deletePreprocessedRow: (id, rowId) =>
    api.delete(`/datasets/${id}/preprocessed/${rowId}`),
};

export default datasetsApi;
