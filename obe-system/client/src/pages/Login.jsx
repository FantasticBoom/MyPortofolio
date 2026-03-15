import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Pastikan URL backend sesuai
      const res = await axios.post("http://localhost:8081/api/login", values);

      if (res.data.Status === "Success") {
        // Simpan data user ke LocalStorage
        localStorage.setItem("user", JSON.stringify(res.data.User));
        localStorage.setItem("role", res.data.Role);

        // Redirect berdasarkan Role
        if (res.data.Role === "admin") {
          navigate("/admin/cpmk"); // Redirect ke dashboard admin
        } else {
          navigate("/dosen/dashboard"); // Redirect ke dashboard dosen
        }
      } else {
        setError(res.data.Error);
      }
    } catch (err) {
      console.log(err);
      setError("Terjadi kesalahan pada server");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full text-white mb-4 shadow-lg">
            <FaSignInAlt size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Sistem OBE</h2>
          <p className="text-gray-500 text-sm mt-1">
            Sistem Manajemen Capaian Pembelajaran
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="email@univ.ac.id"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md transform hover:scale-[1.02]"
          >
            Login
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p className="font-semibold mb-2 text-gray-500">Demo Credentials:</p>
          <div className="flex flex-col gap-1">
            <p>
              <span className="font-bold text-gray-700">Admin:</span>{" "}
              admin@univ.ac.id / admin123
            </p>
            <p>
              <span className="font-bold text-gray-700">Dosen:</span>{" "}
              dosen@univ.ac.id / dosen123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
