import api from "./api";

const dashboardService = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getGraphData: async () => {
    const response = await api.get("/dashboard/graph-data");
    return response.data;
  },

  getStockWarnings: async () => {
    const response = await api.get("/dashboard/stock-warnings");
    return response.data;
  },

  getCurrentMonthStock: async () => {
    const response = await api.get("/dashboard/current-month-stock");
    return response.data;
  },

  getStockOutDetails: async () => {
    const response = await api.get("/dashboard/stock-out-details");
    return response.data;
  },
};

export default dashboardService;
