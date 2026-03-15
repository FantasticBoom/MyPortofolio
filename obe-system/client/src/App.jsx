import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- LOGIN ---
import Login from "./pages/Login";

// --- LAYOUTS ---
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// --- PAGES ADMIN ---
import DashboardAdmin from "./pages/admin/Dashboard";
import MataKuliah from "./pages/admin/MataKuliah";
import ManajemenCPL from "./pages/admin/ManajemenCPL";
import Mahasiswa from "./pages/admin/Mahasiswa";
import UserDosen from "./pages/admin/UserDosen";

// --- PAGES DOSEN ---
import DashboardDosen from "./pages/dosen/DashboardDosen";
import CreateRPS from "./pages/dosen/CreateRPS";
import DetailRPS from "./pages/dosen/DetailRPS";
import KelolaMahasiswa from "./pages/dosen/KelolaMahasiswa";
import PenilaianTugas from "./pages/dosen/PenilaianTugas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Public */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* --- ROUTE ADMIN --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="grafik" element={<DashboardAdmin />} />
          <Route path="matakuliah" element={<MataKuliah />} />
          <Route path="cpmk" element={<ManajemenCPL />} />
          <Route path="mahasiswa" element={<Mahasiswa />} />
          <Route path="dosen" element={<UserDosen />} />
        </Route>

        {/* --- ROUTE DOSEN (USER) --- */}
        <Route path="/dosen" element={<UserLayout />}>
          <Route index element={<Navigate to="/dosen/dashboard" />} />
          <Route path="dashboard" element={<DashboardDosen />} />
          <Route path="create-rps" element={<CreateRPS />} />
          <Route path="rps-detail/:id" element={<DetailRPS />} />
          <Route path="edit-rps/:id" element={<CreateRPS />} />
          <Route path="mahasiswa" element={<KelolaMahasiswa />} />
          <Route path="penilaian" element={<PenilaianTugas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
