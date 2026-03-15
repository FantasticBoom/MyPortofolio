import api from "./api";

const proposalService = {
  // Tambahkan fungsi baru ini
  getPeriods: async () => {
    const response = await api.get("/dana-proposal/list-periods");
    return response.data;
  },

  getByPeriode: async (periode) => {
    const encoded = encodeURIComponent(periode);
    const response = await api.get(`/dana-proposal/${encoded}`);
    return response.data;
  },

  save: async (formData) => {
    const response = await api.post("/dana-proposal/save", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default proposalService;
