import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Archive, 
  Mail, 
  FileBadge, 
  Wand2, 
  Settings, 
} from 'lucide-react';
import logoApp from '../../assets/logo.png';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
    : "text-blue-100 hover:bg-white/10 hover:text-white";

  return (
    <aside 
      className={`bg-slate-900 h-screen fixed left-0 top-0 overflow-y-auto border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-52' : 'w-16'
      }`}
    >
      
      {/* --- LOGO AREA --- */}
      <div className={`p-4 flex items-center gap-3 border-b border-white/10 ${!isOpen && 'justify-center px-2'}`}>
        <div className="w-8 h-8 min-w-[2rem] bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden p-1">
          <img 
            src={logoApp} 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className={`transition-all duration-200 overflow-hidden ${isOpen ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 ml-0 hidden'}`}>
          <h1 className="text-sm font-bold text-white tracking-tight whitespace-nowrap">E-ARSIP</h1>
          <p className="text-[9px] text-blue-300 uppercase tracking-wider whitespace-nowrap">UIGM Palembang</p>
        </div>
      </div>

      {/* --- MENU LIST --- */}
      <nav className="flex-1 p-2 space-y-1 overflow-x-hidden">
        
        {isOpen && (
          <p className="px-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1 animate-fade-in-up whitespace-nowrap">
            Menu Utama
          </p>
        )}

        <Link 
          to="/dashboard" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/dashboard')} ${!isOpen && 'justify-center px-0'}`} 
          title="Dashboard"
        >
          <LayoutDashboard size={16} className="min-w-[16px]" />
          <span className={`${!isOpen && 'hidden'}`}>Dashboard</span>
        </Link>

        <Link 
          to="/arsip" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/arsip')} ${!isOpen && 'justify-center px-0'}`} 
          title="Semua Arsip"
        >
          <Archive size={16} className="min-w-[16px]" />
          <span className={`${!isOpen && 'hidden'}`}>Semua Arsip</span>
        </Link>

        <Link 
          to="/surat" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/surat')} ${!isOpen && 'justify-center px-0'}`} 
          title="Dokumen Surat"
        >
          <Mail size={16} className="min-w-[16px]" />
          <span className={`${!isOpen && 'hidden'}`}>Dokumen Surat</span>
        </Link>

        <Link 
          to="/sk" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/sk')} ${!isOpen && 'justify-center px-0'}`} 
          title="Dokumen SK"
        >
          <FileBadge size={16} className="min-w-[16px]" />
          <span className={`${!isOpen && 'hidden'}`}>Dokumen SK</span>
        </Link>

        <Link 
          to="/generator" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/generator')} ${!isOpen && 'justify-center px-0'}`} 
          title="Generator Surat"
        >
          <Wand2 size={16} className="min-w-[16px]" />
          <span className={`${!isOpen && 'hidden'}`}>Generator Surat</span>
        </Link>

        {/* --- MENU KHUSUS ADMIN --- */}
        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <>
            {isOpen && (
              <p className="px-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-1 animate-fade-in-up whitespace-nowrap">
                Administrator
              </p>
            )}

            <Link 
              to="/admin" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${isActive('/admin')} ${!isOpen && 'justify-center px-0'}`} 
              title="Manajemen Aplikasi"
            >
              <Settings size={16} className="min-w-[16px]" />
              <span className={`${!isOpen && 'hidden'}`}>Manajemen App</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}