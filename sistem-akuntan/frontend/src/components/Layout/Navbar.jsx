import { useAuth } from "../../context/AuthContext";
import { User, LogOut } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Sistem Akuntan MBG
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <User size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {user?.nama_lengkap || user?.username}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};
