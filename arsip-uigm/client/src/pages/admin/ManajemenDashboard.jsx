import { Link } from 'react-router-dom';
import { Users, Database, ClipboardList, ArrowRight } from 'lucide-react';

export default function ManajemenDashboard() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Super Admin</h1>
        <p className="text-gray-500 text-sm">Kelola data sesuai hak akses Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: MANAJEMEN USER */}
        <Link to="/admin/users" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Manajemen User</h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Kelola semua akun pengguna, peran (role), dan data profil.
          </p>
          <div className="flex items-center text-sm font-medium text-blue-600 gap-1 group-hover:gap-2 transition-all">
            Kelola Pengguna <ArrowRight size={16} />
          </div>
        </Link>

        {/* CARD 2: DATA MASTER (Arahkan ke Bagian sebagai default master) */}
        <Link to="/admin/master" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Database size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Data Master</h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Kelola referensi sistem seperti Unit Kerja (Bagian) dan Pejabat.
          </p>
          <div className="flex items-center text-sm font-medium text-green-600 gap-1 group-hover:gap-2 transition-all">
            Lihat Data Master <ArrowRight size={16} />
          </div>
        </Link>

        {/* CARD 3: LAPORAN AKTIVITAS */}
        <Link to="/admin/logs" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
          <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">Laporan Aktivitas</h3>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Lihat semua log aktivitas (history) yang terjadi di dalam sistem.
          </p>
          <div className="flex items-center text-sm font-medium text-cyan-600 gap-1 group-hover:gap-2 transition-all">
            Cek Log Sistem <ArrowRight size={16} />
          </div>
        </Link>

      </div>
    </div>
  );
}