import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/authService";
import { SESSION_TIMEOUT } from "../utils/constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  let sessionTimeout;

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    clearTimeout(sessionTimeout);

    sessionTimeout = setTimeout(() => {
      logout();
      setSessionExpired(true);
    }, SESSION_TIMEOUT);
  }, []);

  // Setup activity listener
  useEffect(() => {
    if (!token) return;

    resetSessionTimeout();

    const handleActivity = () => {
      resetSessionTimeout();
    };

    // Listen for user activity
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearTimeout(sessionTimeout);
    };
  }, [token, resetSessionTimeout]);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);

      if (response.success) {
        const userData = {
          id: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          nama_lengkap: response.data.nama_lengkap,
        };

        setToken(response.data.token);
        setUser(userData);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        resetSessionTimeout();

        return { success: true, data: userData };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login gagal",
      };
    }
  };

  const register = async (username, password, email, nama_lengkap) => {
    try {
      const response = await authService.register(
        username,
        password,
        email,
        nama_lengkap
      );

      if (response.success) {
        const userData = {
          id: response.data.userId,
          username: response.data.username,
        };

        setToken(response.data.token);
        setUser(userData);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        resetSessionTimeout();

        return { success: true, data: userData };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Register gagal",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setSessionExpired(false);
    clearTimeout(sessionTimeout);
  };

  const dismissSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        sessionExpired,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        dismissSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
