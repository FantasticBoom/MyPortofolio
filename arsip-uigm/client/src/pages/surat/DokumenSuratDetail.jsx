import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, FileText, Download, Calendar, MapPin, Tag, Edit 
} from 'lucide-react';

export default function DokumenSuratDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:5000';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/surat/${id}`);
        setData(res.data);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
        navigate('/dokumen-surat');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, navigate]);

  // Handler Tombol Edit
  const handleEditClick = () => {
    navigate(`/dokumen-surat/edit/${id}`);
  };

  // Helper Format Tanggal
  const formatDateView = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Memuat data...</div>;
  if (!data) return null;

  const fileUrl = data.path_file_surat ? `${BASE_URL}/${data.path_file_surat}` : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
        <div>
          <button 
            onClick={() => navigate('/surat')} 
            className="flex items-center text-[10px] text-gray-500 hover:text-blue-600 mb-1 transition-colors"
          >
            <ArrowLeft size={14} className="mr-1" /> Kembali ke Daftar
          </button>
          {/* Font judul diperkecil (text-lg) */}
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Detail Dokumen Surat
          </h1>
          {/* Info nomor diperkecil (text-[10px]) */}
          <p className="text-gray-500 text-[10px] mt-0.5">Nomor: {data.nomor_surat}</p>
        </div>

        <div className="flex gap-2">
          {/* TOMBOL EDIT (text-xs) */}
          <button 
            onClick={handleEditClick}
            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-yellow-600 transition shadow-sm text-xs font-medium"
          >
            <Edit size={14} /> Edit Data
          </button>
          
          {fileUrl && (
            <a 
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition text-xs font-medium"
            >
              <Download size={14} /> Unduh PDF
            </a>
          )}
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-160px)]">
        
        {/* KOLOM KIRI: INFO SURAT */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-5">
            
            {/* Kategori */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex items-start gap-2.5">
                <Tag className="text-blue-600 mt-0.5" size={16} />
                <div>
                  {/* Label diperkecil (text-[10px]) */}
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Jenis Surat</label>
                  {/* Isi diperkecil (text-xs) */}
                  <p className="font-semibold text-blue-900 text-xs">{data.surat_nama_jenis}</p>
                  {data.sub_nama_jenis && (
                    <p className="text-[10px] text-blue-700 mt-0.5 flex items-center gap-1">
                      <span className="text-blue-400">↳</span> {data.sub_nama_jenis}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Tanggal */}
            <div className="flex items-start gap-2.5">
              <Calendar className="text-gray-400 mt-0.5" size={16} />
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Tanggal Surat</label>
                <p className="text-gray-800 font-medium text-xs">{formatDateView(data.tanggal_surat)}</p>
              </div>
            </div>

            {/* Asal & Tujuan */}
            <div className="flex items-start gap-2.5">
              <MapPin className="text-gray-400 mt-0.5" size={16} />
              <div className="w-full space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Asal Surat</label>
                  <p className="text-gray-800 font-medium bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100 text-xs">
                    {data.nama_asal_surat || data.asal_surat || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Tujuan Surat</label>
                  <p className="text-gray-800 font-medium bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100 text-xs">
                    {data.nama_tujuan_surat || data.tujuan_surat || '-'}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Perihal & Inti */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Perihal</label>
              {/* Judul perihal diperkecil (text-sm) */}
              <p className="text-gray-900 font-bold text-sm leading-snug mb-3">{data.surat_perihal}</p>
              
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Inti / Ringkasan</label>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-xs leading-relaxed border border-gray-100">
                {data.inti_surat || '-'}
              </div>
            </div>

          </div>
        </div>

        {/* KOLOM KANAN: PDF PREVIEW */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
           <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Pratinjau Dokumen</span>
              {fileUrl && <span className="text-[10px] text-gray-400">PDF Viewer</span>}
           </div>
           
           <div className="flex-1 bg-gray-200 relative">
             {fileUrl ? (
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full absolute inset-0"
                  title="PDF Viewer"
                />
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                 <FileText size={40} className="opacity-20" />
                 <p className="text-xs">Tidak ada file lampiran</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}