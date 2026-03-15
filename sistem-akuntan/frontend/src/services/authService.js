import api from "./api";

const authService = {
  register: async (username, password, email, nama_lengkap) => {
    const response = await api.post("/auth/register", {
      username,
      password,
      email,
      nama_lengkap,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
