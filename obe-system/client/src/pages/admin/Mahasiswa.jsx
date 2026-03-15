import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
} from "react-icons/fa";

const Mahasiswa = () => {
  // State Data
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Semua"); // Semua, Aktif, Lulus

  // State Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nim: "",
    nama_lengkap: "",
    tahun_masuk: new Date().getFullYear(),
    status: "Aktif",
  });

  // Load Data
  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/mahasiswa");
      setDataMahasiswa(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8081/api/mahasiswa",
        formData
      );
      if (res.data.Status === "Success") {
        alert("Mahasiswa berhasil ditambahkan");
        setShowForm(false);
        setFormData({
          nim: "",
          nama_lengkap: "",
          tahun_masuk: "",
          status: "Aktif",
        });
        fetchMahasiswa();
      } else {
        alert(res.data.Error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      try {
        await axios.delete(`http://localhost:8081/api/mahasiswa/${id}`);
        fetchMahasiswa();
      } catch (err) {
        console.log(err);
      }
    }
  };

  // Logic Filtering Data untuk Tampilan Tab
  const filteredData = dataMahasiswa.filter((mhs) => {
    if (filterStatus === "Semua") return true;
    return mhs.status === filterStatus;
  });

  // Helper: Warna Badge Status
  const getStatusBadge = (status) => {
    if (status === "Aktif")
      return "bg-green-100 text-green-700 border-green-200";
    if (status === "Lulus") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserGraduate className="text-blue-600" /> Manajemen Data
            Mahasiswa
          </h2>
          <p className="text-gray-500 text-sm">
            Kelola data mahasiswa program studi
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <FaPlus /> Tambah Mahasiswa
        </button>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="bg-white p-2 rounded-xl mb-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {["Semua", "Aktif", "Lulus"].map((status) => {
            // Hitung jumlah data per status untuk badge counter
            const count =
              status === "Semua"
                ? dataMahasiswa.length
                : dataMahasiswa.filter((d) => d.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {status}{" "}
                <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-600">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar (Visual Only for now) */}
        <div className="relative mt-2 md:mt-0 mr-2">
          <input
            type="text"
            placeholder="Cari NIM / Nama..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-blue-500 w-64"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
        </div>
      </div>

      {/* Form Input (Toggle) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6 animate-fade-in-down">
          <h3 className="font-bold text-gray-700 mb-4 pb-2 border-b">
            Tambah Mahasiswa Baru
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">NIM</label>
              <input
                type="text"
                value={formData.nim}
                onChange={(e) =>
                  setFormData({ ...formData, nim: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Tahun Masuk
              </label>
              <input
                type="number"
                value={formData.tahun_masuk}
                onChange={(e) =>
                  setFormData({ ...formData, tahun_masuk: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) =>
                  setFormData({ ...formData, nama_lengkap: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus</option>
                <option value="Cuti">Cuti</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Simpan
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="p-4 border-b">NIM</th>
              <th className="p-4 border-b">Nama Lengkap</th>
              <th className="p-4 border-b">Tahun Masuk</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.map((mhs) => (
              <tr key={mhs.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{mhs.nim}</td>
                <td className="p-4 text-gray-600">{mhs.nama_lengkap}</td>
                <td className="p-4 text-gray-600">{mhs.tahun_masuk}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                      mhs.status
                    )}`}
                  >
                    {mhs.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button className="text-blue-500 p-2 hover:bg-blue-50 rounded transition">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(mhs.id)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center">
            <FaUserGraduate size={40} className="mb-2 opacity-20" />
            <p>Tidak ada data mahasiswa ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mahasiswa;
