import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaFileAlt,
  FaBook,
  FaCalendarAlt,
  FaChevronRight,
  FaTrash, // Import Icon Sampah
} from "react-icons/fa";
import axios from "axios";

const DashboardDosen = () => {
  const [rpsList, setRpsList] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchRPS();
  }, []);

  const fetchRPS = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/api/dosen/rps/${user.id}`
      );
      setRpsList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // --- FUNGSI HAPUS ---
  const handleDelete = async (e, id) => {
    // stopPropagation mencegah event klik pada parent (div card) berjalan
    // Jadi saat klik sampah, dia TIDAK akan redirect ke halaman detail
    e.stopPropagation();

    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus RPS ini? Data tidak dapat dikembalikan."
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:8081/api/rps/${id}`);
      if (res.data.Status === "Success") {
        alert("RPS berhasil dihapus");
        fetchRPS(); // Refresh data tanpa reload halaman
      } else {
        alert("Gagal menghapus: " + res.data.Error);
      }
    } catch (err) {
      console.log(err);
      alert("Terjadi kesalahan pada server");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileAlt className="text-blue-600" /> Dashboard RPS
          </h2>
          <p className="text-gray-500 text-sm">Selamat Datang, {user?.name}</p>
        </div>
        <Link
          to="/dosen/create-rps"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow hover:bg-blue-700 transition"
        >
          <FaPlus /> Buat RPS Baru
        </Link>
      </div>

      {/* KONDISI: Jika Belum Ada Data */}
      {rpsList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 p-6 rounded-full mb-4">
            <FaFileAlt size={40} className="text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">Belum Ada RPS</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Anda belum membuat RPS untuk mata kuliah apapun. Klik tombol "Buat
            RPS Baru" untuk memulai.
          </p>
        </div>
      ) : (
        /* KONDISI: Jika SUDAH Ada Data (Tampilkan List) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rpsList.map((rps) => (
            <div
              key={rps.id}
              onClick={() => navigate(`/dosen/rps-detail/${rps.id}`)} // KLIK KARTU -> KE DETAIL
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition group relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                  Semester {rps.semester}
                </div>

                <div className="flex items-center gap-2">
                  {/* TOMBOL DELETE */}
                  <button
                    onClick={(e) => handleDelete(e, rps.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition z-10"
                    title="Hapus RPS"
                  >
                    <FaTrash size={14} />
                  </button>

                  {/* Chevron Icon */}
                  <FaChevronRight className="text-gray-300 group-hover:text-blue-500" />
                </div>
              </div>

              <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition">
                {rps.nama_mk}
              </h4>
              <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                <FaBook size={12} /> {rps.kode_mk}
              </div>

              <div className="border-t border-gray-100 pt-3 mt-2 flex items-center text-gray-400 text-xs gap-2">
                <FaCalendarAlt /> Tahun Ajaran: {rps.tahun_akademik}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardDosen;
