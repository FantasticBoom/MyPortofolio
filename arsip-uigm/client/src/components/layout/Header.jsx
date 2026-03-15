import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Menu, ChevronsLeft, ChevronDown, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLocation, Link } from 'react-router-dom';

export default function Header({ isSidebarOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });

  const getPageTitle = (path) => {
    switch(path) {
      case '/dashboard': return 'Dashboard';
      case '/arsip': return 'Semua Arsip';
      case '/surat': return 'Dokumen Surat';
      case '/sk': return 'Dokumen SK';
      case '/generator': return 'Generator Surat';
      case '/admin': return 'Manajemen Aplikasi';
      default: return 'Aplikasi';
    }
  };

  const currentTitle = getPageTitle(location.pathname);

  // Helper untuk mendapatkan inisial nama
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Nama yang akan ditampilkan (Prioritas: nama_lengkap -> nama -> username)
  const displayName = user?.nama_lengkap || user?.nama || user?.username || 'User';

  return (
    <header 
      className={`h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 right-0 z-40 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'left-52' : 'left-16'
      }`}
    >
      
      {/* --- BAGIAN KIRI --- */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isSidebarOpen)}
          className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
        >
          {isSidebarOpen ? (
            <ChevronsLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <Menu size={18} />
          )}
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-gray-800 tracking-tight flex items-center gap-2">
            {currentTitle}
            <span className="text-blue-600 font-light hidden sm:inline text-sm">E-Arsip</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
            UIGM Palembang
          </p>
        </div>
      </div>

      {/* --- BAGIAN KANAN --- */}
      <div className="flex items-center gap-4">
        
        <div className="hidden md:block text-right mr-1">
          <p className="text-[10px] font-bold text-gray-700">{today}</p>
        </div>

        <button className="relative p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden md:block"></div>

        {/* --- USER DROPDOWN AREA --- */}
        <div className="relative">
          
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 cursor-pointer"
          >
            {/* Teks Nama Lengkap */}
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-700 leading-tight">
                {displayName}
              </p>
              <p className="text-[9px] text-blue-600 font-medium leading-tight">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Staff'}
              </p>
            </div>

            {/* Avatar / Foto Profil */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">
                    {getInitials(displayName)}
                  </span>
               </div>
            </div>
            
            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* --- MENU DROPDOWN --- */}
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in-up origin-top-right">
                
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[10px] font-bold text-gray-800">Akun Pengguna</p>
                  <p className="text-[9px] text-gray-500 truncate">{user?.username || 'user'}@uigm.ac.id</p>
                </div>

                <div className="p-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 px-3 py-2 text-[10px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <UserCircle size={14} className="text-gray-400 group-hover:text-blue-600" />
                    Profil Saya
                  </Link>

                  <button 
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <LogOut size={14} className="text-red-400 group-hover:text-red-600" />
                    Keluar Aplikasi
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );
}