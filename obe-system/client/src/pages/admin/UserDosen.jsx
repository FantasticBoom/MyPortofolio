import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserTie, FaPlus, FaTrash, FaEnvelope, FaLock } from "react-icons/fa";

const UserDosen = () => {
  const [dataDosen, setDataDosen] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchDosen();
  }, []);

  const fetchDosen = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/dosen");
      setDataDosen(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/api/dosen", formData);
      if (res.data.Status === "Success") {
        alert("Akun Dosen Berhasil Dibuat");
        setShowForm(false);
        setFormData({ name: "", email: "", password: "" });
        fetchDosen();
      } else {
        alert(res.data.Error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus akun dosen ini? Data tidak bisa dikembalikan."
      )
    ) {
      try {
        await axios.delete(`http://localhost:8081/api/dosen/${id}`);
        fetchDosen();
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div>
      {/* Header Page */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-blue-600" /> Manajemen User Dosen
          </h2>
          <p className="text-gray-500 text-sm">Kelola akun dosen pengampu</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <FaPlus /> Tambah Dosen
        </button>
      </div>

      {/* Form Tambah Dosen (Toggle) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6 animate-fade-in-down">
          <h3 className="font-bold text-gray-700 mb-4 pb-2 border-b">
            Buat Akun Dosen Baru
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email Institusi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FaEnvelope size={12} />
                </span>
                <input
                  type="email"
                  placeholder="dosen@univ.ac.id"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-8 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password Default
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FaLock size={12} />
                </span>
                <input
                  type="text"
                  placeholder="Password awal..."
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-8 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                *User dapat mengganti password nanti.
              </p>
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Simpan Akun
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-2 rounded hover:bg-gray-200"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Dosen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="p-4 border-b w-1/3">Nama</th>
              <th className="p-4 border-b w-1/3">Email</th>
              <th className="p-4 border-b text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {dataDosen.map((dosen) => (
              <tr key={dosen.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {dosen.name.charAt(0)}
                  </div>
                  {dosen.name}
                </td>
                <td className="p-4 text-gray-600">{dosen.email}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(dosen.id)}
                    className="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition"
                    title="Hapus Akun"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dataDosen.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            <p>Belum ada data dosen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDosen;
