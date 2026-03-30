import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // Jangan intercept endpoint auth — biarkan error ditangani oleh komponen
    const isAuthEndpoint = url.includes("/auth/");
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Coba refresh token jika 401 dan belum pernah retry
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const newAccessToken = data.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch {
        // Refresh token juga expired → bersihkan semua dan redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
      }
    }

    if (status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
