import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoBgn from "../../assets/bgn.png";

// Import komponen LoadingOverlay
import { LoadingOverlay } from "../ui/LoadingOverlay";

export const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // State untuk animasi logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/buku-kas", label: "Buku Kas", icon: BookOpen },
    { path: "/kartu-stock", label: "Kartu Stock", icon: Package },
    { path: "/stock-opname", label: "Stock Opname", icon: Layers },
    {
      path: "/laporan-biaya-operasional",
      label: "Laporan Biaya Operasional",
      icon: DollarSign,
    },
    {
      path: "/laporan-penggunaan-anggaran",
      label: "Laporan Penggunaan Anggaran",
      icon: TrendingUp,
    },
    { path: "/dana-proposal", label: "Dana Proposal", icon: DollarSign },
    { path: "/manajemen", label: "Manajemen", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setIsOpen(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 1000);
  };

  return (
    <>
      {/* TAMPILKAN OVERLAY SAAT LOGOUT */}
      {isLoggingOut && <LoadingOverlay message="Sampai jumpa kembali..." />}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300 z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-700">
          <img
            src={logoBgn}
            alt="Logo MBG"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold">MBG</h1>
            <p className="text-xs text-gray-400">Akuntan</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut} // Mencegah klik ganda saat loading
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900 hover:text-red-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
