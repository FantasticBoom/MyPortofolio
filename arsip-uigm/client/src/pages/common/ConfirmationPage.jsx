import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../services/api'; // Pastikan path ini benar sesuai struktur folder Anda
import { CheckCircle, AlertTriangle, ArrowLeft, Save, Trash2, XCircle } from 'lucide-react';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mengambil data yang dikirim dari halaman sebelumnya (Form)
  // Structure state: { title, message, type, data, endpoint, method, redirectUrl }
  const { state } = location;

  // Jika user akses langsung URL ini tanpa data state, kembalikan ke dashboard
  if (!state) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p>Halaman tidak valid.</p>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 underline">Ke Dashboard</button>
      </div>
    );
  }

  const { title, message, type, data, endpoint, method, redirectUrl } = state;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Eksekusi API sesuai parameter yang dikirim
      if (method === 'post') await api.post(endpoint, data);
      else if (method === 'put') await api.put(endpoint, data);
      else if (method === 'delete') await api.delete(endpoint);

      // Jika sukses, arahkan kembali dengan status sukses
      navigate(redirectUrl, { state: { successMessage: 'Aksi berhasil dilakukan!' } });
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  // Tentukan Warna Tema berdasarkan Tipe Aksi
  const theme = 
    type === 'delete' ? 'red' : 
    type === 'update' ? 'orange' : 
    'indigo'; // create

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans animate-fade-in-up">
      
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
        
        {/* Header Warna Warni */}
        <div className={`h-2 w-full bg-${theme}-500`}></div>

        <div className="p-8 md:p-12">
          
          {/* Ikon & Judul */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto bg-${theme}-50 rounded-full flex items-center justify-center mb-4`}>
              {type === 'delete' ? <AlertTriangle size={40} className={`text-${theme}-600`} /> : <CheckCircle size={40} className={`text-${theme}-600`} />}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500 mt-2 text-lg">{message}</p>
          </div>

          {/* Rangkuman Data (Tabel Review) */}
          {data && Object.keys(data).length > 0 && (
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                  Review Data
                </h3>
                <div className="space-y-3">
                  {Object.entries(data).map(([key, value]) => {
                    // Jangan tampilkan ID atau field internal yang tidak perlu
                    if (key === 'id' || key === 'created_at' || value === null || value === '') return null;
                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                         <span className="font-medium text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                         <span className="font-bold text-slate-800 break-all sm:text-right">{String(value)}</span>
                      </div>
                    )
                  })}
                </div>
             </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
              className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <ArrowLeft size={20} /> Batal & Kembali
            </button>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
                ${type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
               {loading ? 'Memproses...' : (
                 <>
                   {type === 'delete' ? <Trash2 size={20} /> : <Save size={20} />}
                   {type === 'delete' ? 'Ya, Hapus Data' : 'Konfirmasi & Simpan'}
                 </>
               )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}