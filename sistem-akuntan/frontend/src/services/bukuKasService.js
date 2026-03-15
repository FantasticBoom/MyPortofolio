import axiosClient from "./axiosClient";

const bukuKasService = {
  getPeriods: async () => {
    try {
      const response = await axiosClient.get("/buku-kas/periods");
      return response.data;
    } catch (error) {
      return { success: false, message: "Gagal mengambil periode" };
    }
  },

  getAll: async (periodId) => {
    try {
      const params = periodId ? { period_id: periodId } : {};

      const response = await axiosClient.get("/buku-kas", { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Gagal memuat data",
      };
    }
  },

  // FUNGSI BARU UNTUK SEARCH
  searchItems: async (query) => {
    try {
      const response = await axiosClient.get("/buku-kas/items/search", {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error("Gagal mencari item:", error);
      return { success: false, data: [] };
    }
  },

  create: async (formData) => {
    try {
      const response = await axiosClient.post("/buku-kas", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal menyimpan data";
      return { success: false, message: errorMessage };
    }
  },

  update: async (id, formData) => {
    try {
      const response = await axiosClient.put(`/buku-kas/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal mengupdate data";
      return { success: false, message: errorMessage };
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosClient.delete(`/buku-kas/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Gagal menghapus data",
      };
    }
  },
};

export default bukuKasService;
