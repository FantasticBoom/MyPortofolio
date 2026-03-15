import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaUserTie,
  FaBook,
  FaBullseye,
  FaUserGraduate,
  FaClipboardList,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menus = [
    { name: "User Dosen", path: "/admin/dosen", icon: <FaUserTie /> },
    { name: "Mata Kuliah", path: "/admin/matakuliah", icon: <FaBook /> },
    { name: "CPL/CPMK/Sub-CPMK", path: "/admin/cpmk", icon: <FaBullseye /> },
    {
      name: "Data Mahasiswa",
      path: "/admin/mahasiswa",
      icon: <FaUserGraduate />,
    },
    { name: "Penilaian", path: "/admin/penilaian", icon: <FaClipboardList /> },
    { name: "Grafik", path: "/admin/grafik", icon: <FaChartBar /> },
  ];

  return (
    <div className="w-64 bg-blue-900 h-screen fixed text-white flex flex-col">
      <div className="p-5 border-b border-blue-800">
        <h1 className="text-lg font-bold">Dashboard Admin</h1>
        <p className="text-xs text-blue-200">Dr. Admin Prodi</p>
      </div>

      <nav className="flex-1 overflow-y-auto mt-4">
        <ul className="space-y-1">
          {menus.map((menu, index) => (
            <li key={index}>
              <Link
                to={menu.path}
                className={`flex items-center px-6 py-3 hover:bg-blue-700 transition-colors ${
                  location.pathname === menu.path
                    ? "bg-blue-600 border-l-4 border-white"
                    : ""
                }`}
              >
                <span className="mr-3">{menu.icon}</span>
                {menu.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-5 border-t border-blue-800">
        <button className="flex items-center text-red-200 hover:text-white">
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
