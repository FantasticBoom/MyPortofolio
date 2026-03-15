import api from "./api";

const stockOpnameService = {
  // Update params untuk menerima period_id
  getAll: async ({ period_id } = {}) => {
    const params = {};
    if (period_id) params.period_id = period_id;

    const response = await api.get("/stock-opname", { params });
    return response.data;
  },

  // Update summary juga menggunakan period_id
  getSummary: async ({ period_id } = {}) => {
    const params = {};
    if (period_id) params.period_id = period_id;

    const response = await api.get("/stock-opname/summary", { params });
    return response.data;
  },

  searchItems: async (query) => {
    const response = await api.get(`/stock-opname/search-items?q=${query}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/stock-opname/${id}`);
    return response.data;
  },

  create: async (data) => {
    // Data ini sudah mengandung period_id dari StockOpname.jsx
    const response = await api.post("/stock-opname", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/stock-opname/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stock-opname/${id}`);
    return response.data;
  },
};

export default stockOpnameService;
