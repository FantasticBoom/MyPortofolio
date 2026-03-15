import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <Outlet /> {/* Ini tempat konten halaman berubah-ubah */}
      </div>
    </div>
  );
};

export default AdminLayout;
