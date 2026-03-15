import React, { useState, useEffect } from "react";
import axios from "axios";
// PERBAIKAN DISINI: Saya ganti FachalkboardTeacher menjadi FaChalkboard (PASTI AMAN)
import {
  FaUserGraduate,
  FaPlus,
  FaTrash,
  FaUserPlus,
  FaUsers,
  FaChalkboard,
  FaInbox,
} from "react-icons/fa";

const KelolaMahasiswa = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [listRPS, setListRPS] = useState([]);
  const [selectedRPS, setSelectedRPS] = useState("");

  const [mahasiswaKelas, setMahasiswaKelas] = useState([]);
  const [availableMhs, setAvailableMhs] = useState([]);
  const [selectedMhsToAdd, setSelectedMhsToAdd] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Load List RPS
  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/dosen/rps/${user.id}`)
      .then((res) => setListRPS(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 2. Load Data saat RPS dipilih
  useEffect(() => {
    if (selectedRPS) {
      fetchData();
    }
  }, [selectedRPS]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil mahasiswa di kelas
      const resKelas = await axios.get(
        `http://localhost:8081/api/rps/mahasiswa/${selectedRPS}`
      );
      setMahasiswaKelas(resKelas.data);

      // Ambil mahasiswa available
      const resAvail = await axios.get(
        `http://localhost:8081/api/mahasiswa/available/${selectedRPS}`
      );
      setAvailableMhs(resAvail.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedMhsToAdd) return;
    try {
      await axios.post("http://localhost:8081/api/kelas/add", {
        rps_id: selectedRPS,
        mahasiswa_id: selectedMhsToAdd,
      });
      setSelectedMhsToAdd("");
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Hapus mahasiswa ini dari kelas?")) {
      await axios.delete(`http://localhost:8081/api/kelas/remove/${id}`);
      fetchData();
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 min-h-[600px]">
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <FaUserGraduate size={24} />
          </div>
          Kelola Data Mahasiswa
        </h2>
        <p className="text-gray-500 text-sm mt-2 ml-16">
          Manajemen mahasiswa yang mengambil mata kuliah Anda.
        </p>
      </div>

      {/* SELEKSI RPS (PERBAIKAN IKON DISINI) */}
      <div className="mb-10 bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold min-w-max">
          {/* Ikon FaChalkboard yang aman */}
          <FaChalkboard className="text-blue-500" size={20} />
          <label>Pilih Kelas / Mata Kuliah :</label>
        </div>
        <select
          className="w-full md:w-2/3 border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-700 font-medium"
          value={selectedRPS}
          onChange={(e) => setSelectedRPS(e.target.value)}
        >
          <option value="">-- Silakan Pilih Mata Kuliah yang Diampu --</option>
          {listRPS.map((rps) => (
            <option key={rps.id} value={rps.id}>
              {" "}
              Semester {rps.semester} | {rps.kode_mk} - {rps.nama_mk}
            </option>
          ))}
        </select>
      </div>

      {/* KONTEN UTAMA */}
      {selectedRPS ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
          {/* FORM TAMBAH */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit sticky top-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaUserPlus /> Tambah Mahasiswa Baru
              </h3>
              <p className="text-blue-100 text-xs mt-1 opacity-90">
                Pilih mahasiswa aktif dari daftar universitas.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cari & Pilih Mahasiswa:
                </label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-8 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none shadow-sm text-gray-700"
                    value={selectedMhsToAdd}
                    onChange={(e) => setSelectedMhsToAdd(e.target.value)}
                  >
                    <option value="">-- Pilih Mahasiswa --</option>
                    {availableMhs.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nim} — {m.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  {availableMhs.length > 0
                    ? `${availableMhs.length} mahasiswa tersedia.`
                    : "Tidak ada mahasiswa lain yang tersedia."}
                </p>
              </div>

              <button
                onClick={handleAdd}
                disabled={!selectedMhsToAdd || loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm flex justify-center items-center gap-2"
              >
                <FaPlus className="text-blue-200" /> Masukkan Ke Kelas
              </button>
            </div>
          </div>

          {/* TABEL DAFTAR */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <FaUsers className="text-blue-500" /> Daftar Mahasiswa
                    Terdaftar
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Mahasiswa yang saat ini mengambil mata kuliah ini.
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
                  Total: {mahasiswaKelas.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-white text-gray-500 font-semibold uppercase text-xs tracking-wider border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 w-20 text-center">No</th>
                      <th className="px-6 py-4 w-40">NIM</th>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4 w-24 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-12 text-gray-500 font-medium animate-pulse"
                        >
                          Memuat data...
                        </td>
                      </tr>
                    ) : mahasiswaKelas.length > 0 ? (
                      mahasiswaKelas.map((m, idx) => (
                        <tr
                          key={m.km_id}
                          className="hover:bg-blue-50 transition-colors duration-150 group"
                        >
                          <td className="px-6 py-4 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-700">
                            {m.nim}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {m.nama_lengkap}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemove(m.km_id)}
                              className="text-gray-400 bg-gray-100 p-2 rounded-lg hover:text-red-600 hover:bg-red-100 transition-all duration-200 group-hover:shadow-sm"
                              title="Hapus dari kelas"
                            >
                              <FaTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-16">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaInbox size={48} className="mb-4 text-gray-300" />
                            <p className="font-medium text-lg">
                              Kelas Masih Kosong
                            </p>
                            <p className="text-sm">
                              Belum ada mahasiswa yang didaftarkan.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 animate-fade-in">
          <FaChalkboard size={64} className="text-blue-300 mb-6" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Pilih Mata Kuliah Terlebih Dahulu
          </h3>
          <p className="max-w-md mx-auto">
            Silakan pilih salah satu mata kuliah yang Anda ampu pada dropdown di
            atas untuk mulai mengelola mahasiswa.
          </p>
        </div>
      )}
    </div>
  );
};

export default KelolaMahasiswa;
