import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard'; 
import MainLayout from './components/layout/MainLayout';
import SemuaArsip from './pages/arsip/SemuaArsip';

// --- BAGIAN DOKUMEN SURAT ---
import DokumenSurat from './pages/surat/DokumenSurat';
import DokumenSuratDetail from './pages/surat/DokumenSuratDetail';
import DokumenSuratEdit from './pages/surat/DokumenEditSurat';

// --- BAGIAN DOKUMEN SK (PASTIKAN IMPORT INI ADA) ---
import DokumenSK from './pages/sk/DokumenSK';
import DokumenSKDetail from './pages/sk/DokumenSKDetail'; 
import DokumenEditSK from './pages/sk/DokumenEditSK'; 

// Generator Surat
import GeneratorSurat from './pages/generator/GeneratorSurat';
import SuratEditor from './pages/generator/SuratEditor';
import ConfirmationPage from './pages/common/ConfirmationPage';

// Import Manajemen
import ManajemenDataMaster from './pages/admin/ManajemenDataMaster';
import ManajemenUser from './pages/admin/ManajemenUser';
import LogAktivitas from './pages/admin/LogAktivitas';

// Import Master Data
import ManajemenDashboard from './pages/admin/ManajemenDashboard';
import MasterBagian from './pages/admin/master/MasterBagian';
import MasterTTD from './pages/admin/master/MasterTTD';
import MasterJenisSurat from './pages/admin/master/MasterJenisSurat';
import MasterJenisSK from './pages/admin/master/MasterJenisSK';
import MasterJenisSuratSub from './pages/admin/master/MasterJenisSuratSub';
import MasterStruktural from './pages/admin/master/MasterStruktural';


// Komponen Proteksi Route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTE --- */}
          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/arsip" element={<SemuaArsip />} />
             
             {/* ROUTE SURAT */}
             <Route path="/dokumen-surat" element={<DokumenSurat />} />
             <Route path="/surat" element={<DokumenSurat />} /> 
             <Route path="/dokumen-surat/:id" element={<DokumenSuratDetail />} />
             <Route path="/dokumen-surat/edit/:id" element={<DokumenSuratEdit />} />

             {/* ROUTE SK */}
             <Route path="/dokumen-sk" element={<DokumenSK />} />
             <Route path="/sk" element={<DokumenSK />} />
             <Route path="/dokumen-sk/:id" element={<DokumenSKDetail />} /> 
             
             {/* --- INI ROUTE YANG WAJIB ADA UNTUK EDIT SK --- */}
             <Route path="/dokumen-sk/edit/:id" element={<DokumenEditSK />} />
             
             {/* GENERATOR & LAINNYA */}
             <Route path="/generator" element={<GeneratorSurat />} />
             <Route path="/generator/editor/:surat_id" element={<SuratEditor />} />
             <Route path="/confirm-action" element={<ConfirmationPage />} />
             
             {/* ADMIN ROUTES */}
              <Route path="/admin" element={<ManajemenDashboard />} />
              <Route path="/admin/users" element={<ManajemenUser />} />
              <Route path="/admin/logs" element={<LogAktivitas />} />

              {/* MASTER DATA */}
              <Route path="/admin/master" element={<ManajemenDataMaster />} />
              <Route path="/admin/master/bagian" element={<MasterBagian />} />
              <Route path="/admin/master/ttd" element={<MasterTTD />} />
              <Route path="/admin/master/jenis-surat" element={<MasterJenisSurat />} />
              <Route path="/admin/master/jenis-sk" element={<MasterJenisSK />} />
              <Route path="/admin/master/jenis-surat-sub" element={<MasterJenisSuratSub />} />
              <Route path="/admin/master/struktural" element={<MasterStruktural />} />
              
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;