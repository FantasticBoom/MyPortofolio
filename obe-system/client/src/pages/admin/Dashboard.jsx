import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  FaChartBar,
  FaUserGraduate,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

// Registrasi Komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_mahasiswa: 0,
    mahasiswa_aktif: 0,
    mahasiswa_lulus: 0,
    total_penilaian: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8081/api/dashboard/stats"
        );
        setStats(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, []);

  // --- KONFIGURASI CHART ---
  const chartData = {
    labels: ["Mahasiswa Aktif", "Mahasiswa Lulus"],
    datasets: [
      {
        label: "Jumlah",
        data: [stats.mahasiswa_aktif, stats.mahasiswa_lulus],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Biru (Tailwind Blue-500)
          "rgba(96, 165, 250, 0.8)", // Biru Muda (Tailwind Blue-400)
        ],
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }, // Agar sumbu Y bilangan bulat
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartBar className="text-blue-600" /> Grafik & Statistik
        </h2>
        <p className="text-gray-500 text-sm">
          Visualisasi data mahasiswa dan nilai
        </p>
      </div>

      {/* Bagian Atas: Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Kiri: Grafik Status Mahasiswa */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Status Mahasiswa</h3>
          <div className="h-64 flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Kanan: Distribusi Nilai (Empty State sesuai Gambar) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-700 mb-4">Distribusi Nilai</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50">
            <FaChartLine size={40} className="mb-2 opacity-20" />
            <p className="text-sm">
              Belum ada data penilaian untuk ditampilkan
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Mahasiswa */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Mahasiswa</p>
            <h4 className="text-3xl font-bold text-gray-800">
              {stats.total_mahasiswa}
            </h4>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <FaChartBar size={24} />
          </div>
        </div>

        {/* Card 2: Mahasiswa Aktif */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Mahasiswa Aktif</p>
            <h4 className="text-3xl font-bold text-gray-800">
              {stats.mahasiswa_aktif}
            </h4>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <FaUserGraduate size={24} />
          </div>
        </div>

        {/* Card 3: Total Penilaian */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Penilaian</p>
            <h4 className="text-3xl font-bold text-gray-800">
              {stats.total_penilaian}
            </h4>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
            <FaClipboardList size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
