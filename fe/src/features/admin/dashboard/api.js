import api from "@/libs/axios";

const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

export default dashboardApi;
