import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SKForm from './SKForm';
import { ArrowLeft, Edit } from 'lucide-react';

export default function DokumenEditSK() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data SK untuk diedit
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sk/${id}`);
        setData(res.data);
      } catch (error) {
        console.error("Gagal ambil data SK", error);
        alert("Data tidak ditemukan");
        navigate('/dokumen-sk');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, navigate]);

  // 2. Handler Sukses Simpan
  const handleSuccess = () => {
    // Kembali ke halaman detail setelah edit
    navigate(`/dokumen-sk/${id}`); 
  };

  // 3. Handler Batal
  const handleCancel = () => {
    navigate(-1); 
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Memuat data untuk diedit...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans flex flex-col">
      
      {/* Header Halaman Edit - Font Diperkecil */}
      <div className="mb-4">
        <button 
          onClick={handleCancel} 
          className="flex items-center text-[10px] text-gray-500 hover:text-yellow-600 mb-1 transition-colors"
        >
          <ArrowLeft size={14} className="mr-1" /> Kembali
        </button>
        
        {/* Judul diperkecil jadi text-lg */}
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Edit className="text-yellow-500" size={18} />
          Edit Dokumen SK
        </h1>
        
        {/* Deskripsi diperkecil jadi text-[10px] */}
        <p className="text-gray-500 text-[10px] mt-0.5">
          Perbarui informasi Surat Keputusan di bawah ini.
        </p>
      </div>

      {/* Kontainer Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full flex-1">
        {data && (
          <SKForm 
            initialData={data} 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>

    </div>
  );
}