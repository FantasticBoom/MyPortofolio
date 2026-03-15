import api from "./api";

const penggunaanAnggaranService = {
  // HAPUS SPASI DI SINI
  getPeriods: async () => {
    const response = await api.get("/penggunaan-anggaran/periods");
    return response.data;
  },

  // HAPUS SPASI DI SINI (Sebelumnya ada %20 karena " /penggunaan...")
  getByPeriodId: async (periodId) => {
    // Pastikan rapat ke kiri: "/penggunaan-anggaran..."
    const response = await api.get(`/penggunaan-anggaran/period/${periodId}`);
    return response.data;
  },

  getSummary: async (periode) => {
    const response = await api.get(
      `/penggunaan-anggaran/summary?periode=${periode}`
    );
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/penggunaan-anggaran", data);
    return response.data;
  },

  addRincian: async (data) => {
    const response = await api.post("/penggunaan-anggaran/rincian/add", data);
    return response.data;
  },

  updateRincian: async (id, data) => {
    const response = await api.put(`/penggunaan-anggaran/rincian/${id}`, data);
    return response.data;
  },

  deleteRincian: async (id) => {
    const response = await api.delete(`/penggunaan-anggaran/rincian/${id}`);
    return response.data;
  },

  addKeterangan: async (data) => {
    const response = await api.post(
      "/penggunaan-anggaran/keterangan/add",
      data
    );
    return response.data;
  },

  updateKeterangan: async (id, data) => {
    const response = await api.put(
      `/penggunaan-anggaran/keterangan/${id}`,
      data
    );
    return response.data;
  },

  deleteKeterangan: async (id) => {
    const response = await api.delete(`/penggunaan-anggaran/keterangan/${id}`);
    return response.data;
  },
};

export default penggunaanAnggaranService;
