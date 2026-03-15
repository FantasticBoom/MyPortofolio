import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, 
  PieChart, 
  FileText, 
  FileBadge, 
  Archive, 
  Clock,
  ArrowUpRight,
  Loader2,
  Calendar,
  X,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate(); // 2. Inisialisasi navigate
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (error) {
        console.error("Gagal ambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // --- CLOCK TIMER ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // --- CHART OPTIONS ---
  const barData = {
    labels: data?.charts?.jenis_surat?.map(item => item.nama_jenis) || [],
    datasets: [
      {
        label: 'Jumlah Dokumen',
        data: data?.charts?.jenis_surat?.map(item => item.jumlah) || [],
        backgroundColor: '#3B82F6',
        hoverBackgroundColor: '#2563EB',
        borderRadius: 6,
        barThickness: 24, 
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: { font: { size: 11 }, color: '#94a3b8' },
        grid: { color: '#f1f5f9', borderDash: [2, 4] },
        border: { display: false }
      },
      x: { 
        ticks: { font: { size: 11 }, color: '#64748b' },
        grid: { display: false },
        border: { display: false }
      }
    }
  };

  const doughnutData = {
    labels: ['Surat Masuk/Keluar', 'Surat Keputusan (SK)'],
    datasets: [
      {
        data: [data?.cards?.total_surat || 0, data?.cards?.total_sk || 0],
        backgroundColor: ['#3B82F6', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 10
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-blue-600">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <Loader2 className="animate-spin w-10 h-10 relative z-10" />
        </div>
        <p className="text-sm font-medium text-slate-500 mt-4 animate-pulse">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 font-sans animate-fade-in-up">
      
      {/* HEADER SECTION */}
      <div className="relative flex flex-col md:flex-row justify-between items-end md:items-center p-6 rounded-3xl overflow-hidden shadow-xl shadow-blue-200/50 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {getGreeting()}, <span className="text-blue-200">{user?.nama?.split(' ')[0]}</span>
          </h2>
          <p className="text-blue-100/80 text-sm mt-1.5 max-w-md leading-relaxed">
            Selamat datang di e-arsip UIGM. Berikut ringkasan performa hari ini.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg shadow-black/5 mt-4 md:mt-0">
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
             <div className="bg-blue-500/20 p-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-100" />
             </div>
             <span className="text-xs font-semibold text-white tracking-wide">
               {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
             </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-blue-500/20 p-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-blue-100" />
             </div>
             <span className="text-sm font-bold text-white font-mono tracking-wider">
               {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS SECTION (CLICKABLE) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Arsip -> /arsip */}
        <div 
          onClick={() => navigate('/arsip')} 
          className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-indigo-100 cursor-pointer transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Arsip</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{data?.cards?.total_arsip}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Archive size={22} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp size={14} />
            <span>Lihat Semua Arsip</span>
          </div>
        </div>

        {/* Card 2: Surat -> /surat */}
        <div 
          onClick={() => navigate('/surat')}
          className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-blue-100 cursor-pointer transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Surat Masuk/Keluar</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{data?.cards?.total_surat}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <FileText size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full rounded-full w-3/4"></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right group-hover:text-blue-600 transition-colors">Kelola Dokumen Surat &rarr;</p>
        </div>

        {/* Card 3: SK -> /sk */}
        <div 
          onClick={() => navigate('/sk')}
          className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-amber-100 cursor-pointer transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Surat Keputusan</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{data?.cards?.total_sk}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
              <FileBadge size={22} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-amber-500 h-full rounded-full w-1/4"></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right group-hover:text-amber-600 transition-colors">Kelola Dokumen SK &rarr;</p>
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <BarChart size={18} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Statistik Kategori Dokumen</h3>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option>Bulan Ini</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <Bar options={barOptions} data={barData} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-6">
             <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <PieChart size={18} />
             </div>
             <h3 className="text-sm font-bold text-gray-800">Komposisi</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-48 h-48 relative z-10">
               <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-gray-800">{data?.cards?.total_arsip}</span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-wide">Total</span>
               </div>
            </div>
            <div className="flex gap-4 mt-6 w-full justify-center">
               <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs text-gray-600">Surat</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs text-gray-600">SK</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY TABLE ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Aktivitas Dokumen Terbaru</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Lihat Semua <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {data?.recent_activity?.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Nomor</th>
                  <th className="px-6 py-4 font-semibold w-1/3">Perihal</th>
                  <th className="px-6 py-4 font-semibold text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recent_activity.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.kategori === 'Surat' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700 font-mono group-hover:text-blue-600 transition-colors">
                      {item.nomor}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600 truncate max-w-[250px]">
                        {item.perihal}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 text-right">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
              <Archive className="w-10 h-10 mb-2 opacity-20" />
              <span className="text-xs">Belum ada data aktivitas terbaru.</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL LIHAT SEMUA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
             onClick={() => setIsModalOpen(false)}
           ></div>
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-up border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm z-10">
                <div>
                   <h3 className="text-lg font-bold text-gray-800">Semua Aktivitas Dokumen</h3>
                   <p className="text-xs text-gray-500 mt-1">Daftar lengkap riwayat dokumen masuk dan keluar dari arsip.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 font-semibold w-32">Kategori</th>
                        <th className="px-6 py-4 font-semibold">Nomor Dokumen</th>
                        <th className="px-6 py-4 font-semibold">Perihal</th>
                        <th className="px-6 py-4 font-semibold text-right w-40">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data?.recent_activity?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              item.kategori === 'Surat' 
                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {item.kategori}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-gray-700 font-mono">
                            {item.nomor}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-gray-600">
                            {item.perihal}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-gray-500 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(item.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">Menampilkan {data?.recent_activity?.length} data</span>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-800 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm transition-all"
                >
                  Tutup
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}