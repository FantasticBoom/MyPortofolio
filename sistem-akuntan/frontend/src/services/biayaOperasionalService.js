import api from "./api";

const biayaOperasionalService = {
  getAll: async (periode_id = null, jenis_biaya = null) => {
    let url = "/biaya-operasional";
    const params = [];

    if (periode_id) params.push(`periode_id=${periode_id}`);
    if (jenis_biaya) params.push(`jenis_biaya=${jenis_biaya}`);

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    const response = await api.get(url);
    return response.data;
  },

  getPeriods: async () => {
    const response = await api.get("/biaya-operasional/periods");
    return response.data;
  },

  getSummaryByPeriode: async (periode_id) => {
    const response = await api.get(
      `/biaya-operasional/summary/periode?periode_id=${periode_id}`
    );
    return response.data;
  },

  // --- UPDATE: Terima parameter jenisBiaya ---
  searchBarang: async (query, jenisBiaya) => {
    const response = await api.get(
      `/biaya-operasional/search-barang?q=${query}&jenis_biaya=${jenisBiaya}`
    );
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/biaya-operasional/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/biaya-operasional", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/biaya-operasional/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/biaya-operasional/${id}`);
    return response.data;
  },
};

export default biayaOperasionalService;
