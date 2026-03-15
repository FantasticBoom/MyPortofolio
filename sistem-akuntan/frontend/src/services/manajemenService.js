import api from "./api";

const manajemenService = {
  getAllUsers: async () => {
    const response = await api.get("/manajemen/users");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/manajemen/profile/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/manajemen/profile/update", data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put("/manajemen/password/change", data);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get("/manajemen/statistics");
    return response.data;
  },

  getPeriods: async () => {
    const response = await api.get("/manajemen/periods");
    return response.data;
  },

  createPeriod: async (data) => {
    const response = await api.post("/manajemen/periods", data);
    return response.data;
  },

  updatePeriod: async (id, data) => {
    const response = await api.put(`/manajemen/periods/${id}`, data);
    return response.data;
  },

  deletePeriod: async (id) => {
    const response = await api.delete(`/manajemen/periods/${id}`);
    return response.data;
  },

  getPrices: async () => {
    const response = await api.get("/manajemen/prices");
    return response.data;
  },

  uploadPrices: async (formData) => {
    const response = await api.post("/manajemen/prices/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  createPrice: async (data) => {
    const response = await api.post("/manajemen/prices", data);
    return response.data;
  },

  updatePrice: async (id, data) => {
    const response = await api.put(`/manajemen/prices/${id}`, data);
    return response.data;
  },

  deletePrice: async (id) => {
    const response = await api.delete(`/manajemen/prices/${id}`);
    return response.data;
  },

  // === CODINGS / PENGKODEAN BARANG ===
  getCodings: async () => {
    const response = await api.get("/manajemen/codings");
    return response.data;
  },

  createCoding: async (data) => {
    const response = await api.post("/manajemen/codings", data);
    return response.data;
  },

  // Menggunakan ID untuk update
  updateCoding: async (id, data) => {
    const response = await api.put(`/manajemen/codings/${id}`, data);
    return response.data;
  },

  // Menggunakan ID untuk delete
  deleteCoding: async (id) => {
    const response = await api.delete(`/manajemen/codings/${id}`);
    return response.data;
  },

  uploadCodings: async (formData) => {
    const response = await api.post("/manajemen/codings/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default manajemenService;
