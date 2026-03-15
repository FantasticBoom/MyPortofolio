import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaBook } from "react-icons/fa";

const MataKuliah = () => {
  const [dataMK, setDataMK] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // State untuk Form
  const [formData, setFormData] = useState({
    kode_mk: "",
    nama_mk: "",
    sks: "",
    semester: "1",
  });

  // Load Data saat halaman dibuka
  useEffect(() => {
    fetchMK();
  }, []);

  const fetchMK = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/matakuliah");
      setDataMK(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8081/api/matakuliah", formData);
      alert("Mata Kuliah Berhasil Ditambahkan");
      setShowForm(false);
      fetchMK(); // Refresh tabel
      setFormData({ kode_mk: "", nama_mk: "", sks: "", semester: "1" }); // Reset form
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBook className="text-blue-600" /> Manajemen Mata Kuliah
          </h2>
          <p className="text-gray-500 text-sm">
            Kelola data mata kuliah program studi
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Tambah Mata Kuliah
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="p-4 border-b">Kode</th>
              <th className="p-4 border-b">Nama Mata Kuliah</th>
              <th className="p-4 border-b">SKS</th>
              <th className="p-4 border-b">Semester</th>
              <th className="p-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {dataMK.map((mk, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 border-b last:border-b-0"
              >
                <td className="p-4 font-medium">{mk.kode_mk}</td>
                <td className="p-4">{mk.nama_mk}</td>
                <td className="p-4">{mk.sks}</td>
                <td className="p-4">{mk.semester}</td>
                <td className="p-4 flex gap-2">
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dataMK.length === 0 && (
          <div className="p-5 text-center text-gray-400">Belum ada data</div>
        )}
      </div>

      {/* Form Tambah (Hanya muncul jika tombol diklik) */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-fade-in-down">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
            Tambah Mata Kuliah Baru
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Kode MK
              </label>
              <input
                type="text"
                name="kode_mk"
                value={formData.kode_mk}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">SKS</label>
              <input
                type="number"
                name="sks"
                value={formData.sks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Nama Mata Kuliah
              </label>
              <input
                type="text"
                name="nama_mk"
                value={formData.nama_mk}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MataKuliah;
