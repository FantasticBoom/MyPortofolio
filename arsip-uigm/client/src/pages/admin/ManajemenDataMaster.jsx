import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  FileSignature, 
  FileText, 
  FileBadge, 
  Layers, 
  Users, 
  ChevronLeft,
  LayoutGrid
} from 'lucide-react';

export default function ManajemenDataMaster() {
  const location = useLocation();

  // Konfigurasi Menu dengan Warna Unik
  const menus = [
    { 
      title: "Bagian / Unit Kerja", 
      desc: "Kelola unit kerja ",
      icon: <Building2 size={28} />, 
      link: "/admin/master/bagian", 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      border: "group-hover:border-blue-300",
      shadow: "group-hover:shadow-blue-100"
    },
    { 
      title: "Tanda Tangan", 
      desc: "Daftar pimpinan penanda tangan",
      icon: <FileSignature size={28} />, 
      link: "/admin/master/ttd", 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      border: "group-hover:border-emerald-300",
      shadow: "group-hover:shadow-emerald-100"
    },
    { 
      title: "Jenis Administrasi", 
      desc: "Sub kategori surat (Surat Sub)",
      icon: <Layers size={28} />, 
      link: "/admin/master/jenis-surat-sub", 
      color: "text-purple-600", 
      bg: "bg-purple-50", 
      border: "group-hover:border-purple-300",
      shadow: "group-hover:shadow-purple-100"
    },
    { 
      title: "Data Struktural", 
      desc: "Identitas lengkap jabatan struktural",
      icon: <Users size={28} />, 
      link: "/admin/master/struktural", 
      color: "text-orange-600", 
      bg: "bg-orange-50", 
      border: "group-hover:border-orange-300",
      shadow: "group-hover:shadow-orange-100"
    },
    { 
      title: "Jenis SK", 
      desc: "Kategori Surat Keputusan",
      icon: <FileBadge size={28} />, 
      link: "/admin/master/jenis-sk", 
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      border: "group-hover:border-rose-300",
      shadow: "group-hover:shadow-rose-100"
    },
    { 
      title: "Jenis Surat", 
      desc: "Klasifikasi surat umum",
      icon: <FileText size={28} />, 
      link: "/admin/master/jenis-surat", 
      color: "text-cyan-600", 
      bg: "bg-cyan-50", 
      border: "group-hover:border-cyan-300",
      shadow: "group-hover:shadow-cyan-100"
    },
  ];

  const isActive = (path) => location.pathname === path 
    ? "text-indigo-600 border-b-2 border-indigo-600" 
    : "text-slate-500 hover:text-slate-800 hover:border-b-2 hover:border-slate-300";

  return (
    <div className="space-y-8 animate-fade-in-up font-sans p-2">
      
      {/* --- HEADER SECTION --- */}
      <div>
         <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-transform hover:-translate-x-1">
            <ChevronLeft size={16} /> Kembali ke Dashboard Utama
         </Link>
         <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Super Admin</h1>
         <p className="text-slate-500 mt-2">Pusat pengaturan data referensi sistem E-Arsip.</p>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex gap-8 border-b border-slate-200">
         <Link to="/admin" className={`pb-3 text-sm font-semibold transition-all ${isActive('/admin')}`}>
            Dashboard
         </Link>
         <Link to="/admin/users" className={`pb-3 text-sm font-semibold transition-all ${isActive('/admin/users')}`}>
            Manajemen User
         </Link>
         <div className={`pb-3 text-sm font-semibold transition-all cursor-default text-indigo-600 border-b-2 border-indigo-600`}>
            Data Master
         </div>
      </div>

      {/* --- GRID MENU SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
           <LayoutGrid size={20} className="text-indigo-600"/>
           <h2>Pilih Tabel Referensi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu, idx) => (
               <Link 
                  key={idx} 
                  to={menu.link}
                  className={`
                    group relative flex flex-col items-start p-6 
                    bg-white rounded-2xl border border-slate-200 
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 hover:shadow-xl ${menu.border} ${menu.shadow}
                  `}
               >
                  {/* Icon Container */}
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center mb-4 
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                    ${menu.bg} ${menu.color}
                  `}>
                     {menu.icon}
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {menu.title}
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-600">
                      {menu.desc}
                    </p>
                  </div>

                  {/* Subtle Decoration */}
                  <div className={`
                    absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500 ${menu.bg.replace('bg-', 'bg-')} 
                  `}></div>
               </Link>
            ))}
        </div>
      </div>
    </div>
  );
}