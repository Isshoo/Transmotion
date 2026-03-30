import api from "@/libs/axios";

const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  google: (data) => api.post("/auth/google", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resendVerification: (data) => api.post("/auth/resend-verification", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  changePassword: (data) => api.post("/auth/change-password", data),
  me: () => api.get("/users/me"),
};

export default authApi;
