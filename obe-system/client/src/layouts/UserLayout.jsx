import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaBook,
  FaUserGraduate,
  FaClipboardCheck,
} from "react-icons/fa";

const UserLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar Atas */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Dosen</h1>
          <p className="text-xs text-gray-500">{user?.name || "Dosen"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-600 hover:text-red-500 text-sm font-medium"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      {/* Sub Menu Navigasi */}
      <div className="bg-white px-8 border-b border-gray-200">
        <div className="flex gap-8">
          <Link
            to="/dosen/dashboard"
            className="py-4 border-b-2 border-blue-600 text-blue-600 font-medium flex items-center gap-2"
          >
            <FaBook /> RPS
          </Link>
          <Link
            to="/dosen/mahasiswa"
            className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2"
          >
            <FaUserGraduate /> Data Mahasiswa
          </Link>
          <Link
            to="/dosen/penilaian"
            className="py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2"
          >
            <FaClipboardCheck /> Penilaian Tugas
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
