import api from "@/lib/axios";

export const usersApi = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateMe: (data) => api.put("/users/me", data),
};
