import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, FileBadge, Download, Calendar, MapPin, Tag, Edit, FileText
} from 'lucide-react';

export default function DokumenSKDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:5000'; // Pastikan port backend benar

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Detail SK
  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sk/${id}`);
      setData(res.data);
    } catch (error) {
      console.error("Gagal ambil detail SK:", error);
      navigate('/dokumen-sk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, navigate]);

  // --- HANDLER NAVIGASI KE HALAMAN EDIT ---
  const handleEditClick = () => {
    navigate(`/dokumen-sk/edit/${id}`);
  };

  // Helper Format Tanggal
  const formatDateView = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Memuat detail SK...</div>;
  if (!data) return <div className="p-8 text-center text-xs text-gray-500">Data SK tidak ditemukan.</div>;

  const fileUrl = data.path_file_sk ? `${BASE_URL}/${data.path_file_sk}` : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <button 
            onClick={() => navigate('/dokumen-sk')} 
            className="flex items-center text-[10px] text-gray-500 hover:text-yellow-600 mb-1 transition-colors"
          >
            <ArrowLeft size={14} className="mr-1" /> Kembali ke Daftar
          </button>
          
          {/* Font Judul diperkecil */}
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileBadge className="text-yellow-600" size={20} />
            Detail Surat Keputusan
          </h1>
          <p className="text-gray-500 text-[10px] mt-0.5">Nomor: {data.nomor_sk}</p>
        </div>

        <div className="flex gap-2">
          {/* TOMBOL EDIT (text-xs) */}
          <button 
            onClick={handleEditClick}
            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-yellow-600 transition shadow-sm hover:shadow-md active:scale-95 text-xs font-medium"
          >
            <Edit size={14} /> Edit SK
          </button>
          
          {/* TOMBOL DOWNLOAD (text-xs) */}
          {fileUrl && (
            <a 
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 text-xs font-medium"
            >
              <Download size={14} /> Unduh PDF
            </a>
          )}
        </div>
      </div>

      {/* KONTEN UTAMA (SPLIT VIEW) */}
      <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* KIRI: METADATA */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-5 space-y-5">
            
            {/* Badge Jenis SK */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <div className="flex items-start gap-2.5">
                <Tag className="text-yellow-600 mt-0.5" size={16} />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Jenis SK</label>
                  <p className="font-semibold text-yellow-900 text-sm">{data.nama_jenis_sk || 'Umum'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Info Dasar */}
            <div className="space-y-3">
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Nomor SK</label>
                   <p className="text-gray-900 font-bold font-mono text-sm">{data.nomor_sk}</p>
                </div>
                <div className="flex items-start gap-2.5">
                    <Calendar className="text-gray-400 mt-0.5" size={16} />
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Tanggal Ditetapkan</label>
                        <p className="text-gray-800 font-medium text-xs">{formatDateView(data.tanggal_sk)}</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Asal & Tujuan */}
            <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="text-gray-400 mt-0.5" size={16} />
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Asal SK / Unit Kerja</label>
                    <p className="text-gray-800 font-medium bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100 text-xs">
                      {data.nama_asal_surat || '-'}
                    </p>
                  </div>
                </div>
                
                {data.tujuan_sppd && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Tujuan SPPD</label>
                    <p className="text-gray-800 font-medium ml-7 text-xs">{data.tujuan_sppd}</p>
                  </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Perihal */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Perihal / Judul</label>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium text-xs leading-relaxed border border-gray-100">
                {data.perihal_sk}
              </div>
            </div>

            {/* Lainnya */}
            {data.lainnya_sk && (
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Keterangan Lain</label>
                    <p className="text-[11px] text-gray-600 italic">{data.lainnya_sk}</p>
                </div>
            )}

          </div>
        </div>

        {/* KANAN: PDF PREVIEW */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
           <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                 <FileBadge size={14} /> Pratinjau Dokumen
              </span>
              {fileUrl && <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">PDF Viewer</span>}
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
                 <div className="p-3 bg-white rounded-full shadow-sm">
                    <FileText size={32} className="text-gray-300" />
                 </div>
                 <p className="font-medium text-xs">Tidak ada file lampiran</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}