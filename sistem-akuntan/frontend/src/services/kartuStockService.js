import axiosClient from "./axiosClient";

const kartuStockService = {
  getKodeList: async () => {
    try {
      const response = await axiosClient.get("/kartu-stock/kode-list");
      return response.data;
    } catch (error) {
      console.error("Error getKodeList:", error);
      return { success: false, message: "Gagal mengambil daftar kode" };
    }
  },

  // (Fitur Lama) Cek Last Stock General
  getLastStock: async (kode) => {
    try {
      const response = await axiosClient.get("/kartu-stock/last-stock", {
        params: { kode },
      });
      return response.data;
    } catch (error) {
      console.error("Error getLastStock:", error);
      return { success: false, message: "Gagal mengambil data stok" };
    }
  },

  // (FITUR BARU) Cek Batch Stok Tersedia per Harga
  getStockBatches: async (kode) => {
    try {
      const response = await axiosClient.get("/kartu-stock/stock-batches", {
        params: { kode },
      });
      return response.data;
    } catch (error) {
      console.error("Error getStockBatches:", error);
      return { success: false, message: "Gagal mengambil batch stok" };
    }
  },

  getByKode: async (kode) => {
    try {
      const response = await axiosClient.get("/kartu-stock", {
        params: { kode },
      });
      return response.data;
    } catch (error) {
      console.error("Error getByKode:", error);
      return { success: false, message: "Gagal memuat data kartu stock" };
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosClient.get(`/kartu-stock/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getById:", error);
      return { success: false, message: "Gagal mengambil data" };
    }
  },

  create: async (formData) => {
    try {
      const response = await axiosClient.post("/kartu-stock", formData);
      return response.data;
    } catch (error) {
      console.error("Create Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Gagal menyimpan data",
      };
    }
  },

  update: async (id, formData) => {
    try {
      const response = await axiosClient.put(`/kartu-stock/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error("Update Error:", error);
      return { success: false, message: "Gagal mengupdate data" };
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosClient.delete(`/kartu-stock/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete Error:", error);
      return { success: false, message: "Gagal menghapus data" };
    }
  },
};

export default kartuStockService;
