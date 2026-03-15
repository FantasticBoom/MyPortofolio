import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { BukuKas } from "./pages/BukuKas";
import { KartuStock } from "./pages/KartuStock";
import { StockOpname } from "./pages/StockOpname";
import { LaporanPenggunaanAnggaran } from "./pages/LaporanPenggunaanAnggaran";
import { LaporanBiayaOperasional } from "./pages/LaporanBiayaOperasional";
import { DanaProposal } from "./pages/DanaProposal";
import { Manajemen } from "./pages/Manajemen";
import { SessionExpired } from "./components/auth/SessionExpired";
import { ProtectedRoute } from "./components/auth/Protectedroute";

function AppContent() {
  const { sessionExpired } = useAuth();

  return (
    <>
      {sessionExpired && <SessionExpired />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buku-kas"
          element={
            <ProtectedRoute>
              <BukuKas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kartu-stock"
          element={
            <ProtectedRoute>
              <KartuStock />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-opname"
          element={
            <ProtectedRoute>
              <StockOpname />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan-biaya-operasional"
          element={
            <ProtectedRoute>
              <LaporanBiayaOperasional />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan-penggunaan-anggaran"
          element={
            <ProtectedRoute>
              <LaporanPenggunaanAnggaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dana-proposal"
          element={
            <ProtectedRoute>
              <DanaProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manajemen"
          element={
            <ProtectedRoute>
              <Manajemen />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
