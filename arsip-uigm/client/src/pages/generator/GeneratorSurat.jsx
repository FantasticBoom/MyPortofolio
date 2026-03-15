import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { 
    FilePlus, 
    History, 
    FileText, 
    X, 
    Trash2, 
    Edit, 
    Upload, 
    Send, 
    FileCheck 
} from 'lucide-react';

export default function GeneratorSurat() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [history, setHistory] = useState([]);
  const [jenisSuratList, setJenisSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State khusus untuk menangani ID mana yang sedang di-upload
  const [selectedIdForUpload, setSelectedIdForUpload] = useState(null);

  // State Sub Jenis Surat (Logika Modal)
  const [selectedMainSurat, setSelectedMainSurat] = useState(null); 
  const [subSuratList, setSubSuratList] = useState([]); 
  const [step, setStep] = useState(1); 

  // --- FETCH DATA UTAMA ---
  const fetchData = async () => {
    try {
      const [resHist, resJenis] = await Promise.all([
        api.get('/generator/history'),
        api.get('/master/jenis-surat')
      ]);
      setHistory(resHist.data);
      setJenisSuratList(resJenis.data);
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. HANDLE DELETE (Dengan Konfirmasi) ---
  const handleDelete = async (id, nomor) => {
    const result = await Swal.fire({
        title: 'Hapus Surat?',
        text: `Data surat nomor ${nomor} akan dihapus permanen beserta filenya.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/generator/delete/${id}`);
            Swal.fire('Terhapus!', 'Data surat berhasil dihapus.', 'success');
            fetchData(); // Refresh tabel
        } catch (error) {
            console.error(error);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus.', 'error');
        }
    }
  };

  // --- 2. HANDLE EDIT (Navigasi ke Editor) ---
  const handleEdit = (item) => {
    // Cek apakah sudah di-apply (sudah arsip). Jika ya, tolak edit.
    if (item.is_applied > 0) {
        Swal.fire('Info', 'Surat yang sudah diarsipkan tidak dapat diedit kembali.', 'info');
        return;
    }

    // Navigasi dengan membawa state
    navigate(`/generator/editor/${item.surat_id}`, { 
        state: { 
            surat_id: item.surat_id, 
            sub_id: item.sub_id,
            nama_jenis: item.surat_nama_jenis + (item.sub_nama_jenis ? ` - ${item.sub_nama_jenis}` : ''),
            isEditMode: true, // Flag edit mode
            existingData: item // Bawa seluruh data row
        } 
    });
  };

  // --- 3. HANDLE UPLOAD (Trigger Input File) ---
  const triggerUpload = (id) => {
      setSelectedIdForUpload(id);
      // Trigger klik pada elemen input hidden
      if(fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      // Jika user cancel atau tidak ada file
      if (!file || !selectedIdForUpload) return;

      const formData = new FormData();
      formData.append('file_surat', file);
      formData.append('id', selectedIdForUpload);

      try {
          Swal.fire({ title: 'Mengupload...', didOpen: () => Swal.showLoading() });
          
          await api.post('/generator/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });

          Swal.fire('Berhasil', 'File PDF berhasil disimpan.', 'success');
          fetchData(); // Refresh untuk update status file di tabel
      } catch (error) {
          console.error(error);
          Swal.fire('Gagal', 'Upload gagal.', 'error');
      } finally {
          // Reset input agar event onChange bisa mentrigger file yang sama jika perlu
          e.target.value = null; 
          setSelectedIdForUpload(null);
      }
  };

  // --- 4. HANDLE APPLY (Migrasi ke Arsip dengan Konfirmasi) ---
  const handleApply = async (id, nomor) => {
      const result = await Swal.fire({
          title: 'Apply ke Arsip?',
          html: `Anda akan mengarsipkan surat <b>${nomor}</b> secara permanen.<br/>Data akan disalin ke tabel Arsip Dokumen.`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya, Apply',
          confirmButtonColor: '#10b981', // Warna Emerald
          cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
          try {
              Swal.fire({ title: 'Memproses...', didOpen: () => Swal.showLoading() });
              
              await api.post('/generator/apply', { id });
              
              Swal.fire('Berhasil!', 'Surat telah sukses masuk ke arsip.', 'success');
              fetchData(); // Refresh untuk update status Applied
          } catch (error) {
              console.error(error);
              Swal.fire('Gagal', error.response?.data?.message || 'Gagal melakukan apply.', 'error');
          }
      }
  };

  // --- LOGIKA MODAL PILIH JENIS SURAT ---
  const handleMainSelect = async (jenis) => {
    try {
        const resSub = await api.get('/master/jenis-surat-sub'); 
        const subs = resSub.data.filter(s => s.surat_id === jenis.surat_id);

        if (subs.length > 0) {
            setSelectedMainSurat(jenis);
            setSubSuratList(subs);
            setStep(2);
        } else {
            navigate(`/generator/editor/${jenis.surat_id}`, { 
                state: { 
                    surat_id: jenis.surat_id, 
                    nama_jenis: jenis.surat_nama_jenis 
                } 
            });
        }
    } catch (error) {
        // Fallback jika gagal fetch sub
        navigate(`/generator/editor/${jenis.surat_id}`, { 
            state: { 
                surat_id: jenis.surat_id, 
                nama_jenis: jenis.surat_nama_jenis 
            } 
        });
    }
  };

  const handleSubSelect = (sub) => {
      navigate(`/generator/editor/${selectedMainSurat.surat_id}`, { 
          state: { 
              surat_id: selectedMainSurat.surat_id, 
              sub_id: sub.sub_id,
              nama_jenis: `${selectedMainSurat.surat_nama_jenis} - ${sub.sub_nama_jenis}`
          } 
      });
  };

  const closeModal = () => { setIsModalOpen(false); setStep(1); setSelectedMainSurat(null); };

  // --- RENDER COMPONENT ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans space-y-6 animate-fade-in-up">
      {/* Input File Hidden untuk Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {/* Header Compact */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Generator Surat</h1>
          <p className="text-slate-500 mt-0.5 text-[10px]">Buat surat resmi, cetak, upload scan, dan apply ke arsip.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex gap-1.5 items-center shadow-md transition active:scale-95"
        >
           <FilePlus size={16} /> Buat Surat Baru
        </button>
      </div>

      {/* Tabel History Compact */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
        <div className="flex items-center gap-2 mb-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">
            <History size={14} /> Riwayat Pembuatan Surat
        </div>
        <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wide">
                  <tr>
                    <th className="px-4 py-2.5">Nomor Surat</th>
                    <th className="px-4 py-2.5">Perihal</th>
                    <th className="px-4 py-2.5 text-center">File Scan</th>
                    <th className="px-4 py-2.5 text-center">Status Arsip</th>
                    <th className="px-4 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px]">
                  {history.map((item, idx) => {
                      // Cek status dari data
                      const isApplied = item.is_applied > 0; 
                      const hasFile = !!item.file_path;

                      return (
                      <tr key={item.id} className="hover:bg-slate-50 group transition animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                          {/* Info Nomor */}
                          <td className="px-4 py-2.5 align-top">
                              <div className="font-mono font-bold text-indigo-600 text-[11px]">{item.nomor_surat}</div>
                              <div className="text-[10px] text-slate-400">
                                  {new Date(item.tanggal_surat).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                              </div>
                          </td>
                          
                          {/* Info Perihal */}
                          <td className="px-4 py-2.5 align-top max-w-xs">
                              <div className="font-semibold text-slate-700 text-[11px]">{item.surat_nama_jenis}</div>
                              <div className="text-slate-500 line-clamp-1" title={item.perihal}>{item.perihal || '-'}</div>
                          </td>
                          
                          {/* Kolom File Upload */}
                          <td className="px-4 py-2.5 align-top text-center">
                             {hasFile ? (
                                 <div className="flex items-center justify-center gap-1.5">
                                     <a 
                                        href={`${import.meta.env.VITE_API_URL}${item.file_path}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-1.5 bg-slate-100 rounded-md text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition" 
                                        title="Lihat PDF"
                                     >
                                        <FileText size={14}/>
                                     </a>
                                     {!isApplied && (
                                        <button 
                                            onClick={() => triggerUpload(item.id)} 
                                            className="p-1.5 bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition" 
                                            title="Ganti File"
                                        >
                                            <Upload size={14}/>
                                        </button>
                                     )}
                                 </div>
                             ) : (
                                 <button 
                                    onClick={() => triggerUpload(item.id)} 
                                    className="flex items-center gap-1 mx-auto text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition"
                                 >
                                     <Upload size={12} /> Upload
                                 </button>
                             )}
                          </td>

                          {/* Kolom Status Apply */}
                          <td className="px-4 py-2.5 align-top text-center">
                              {isApplied ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      <FileCheck size={12} /> Terarsip
                                  </span>
                              ) : (
                                  hasFile ? (
                                      <button 
                                        onClick={() => handleApply(item.id, item.nomor_surat)} 
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded shadow hover:bg-emerald-600 transition active:scale-95"
                                      >
                                          <Send size={12} /> Apply
                                      </button>
                                  ) : (
                                      <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">Pending Scan</span>
                                  )
                              )}
                          </td>

                          {/* Kolom Aksi */}
                          <td className="px-4 py-2.5 align-top text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                      onClick={() => handleEdit(item)}
                                      disabled={isApplied} 
                                      className={`p-1.5 rounded-md transition ${isApplied ? 'text-slate-300 cursor-not-allowed' : 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'}`}
                                      title="Edit Data"
                                  >
                                      <Edit size={14} />
                                  </button>
                                  <button 
                                      onClick={() => handleDelete(item.id, item.nomor_surat)}
                                      className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                      title="Hapus Data"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  )})} 
                  
                  {history.length === 0 && (
                      <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                              <div className="flex flex-col items-center">
                                  <FileText size={32} className="mb-2 opacity-20"/>
                                  <p>Belum ada riwayat surat dibuat.</p>
                              </div>
                          </td>
                      </tr>
                  )}
                </tbody>
            </table>
        </div>
      </div>
      
      {/* MODAL PILIH SURAT (Fixed Full Screen Blur + Scrollable Content) */}
      {isModalOpen && (
        <div className="relative z-50" role="dialog" aria-modal="true">
          
          {/* 1. LAYER BACKDROP: Fixed & Blur (Selalu memenuhi layar) */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />

          {/* 2. LAYER WRAPPER: Scrollable (Jika konten panjang) */}
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-10 text-center sm:p-0">
                
                {/* 3. MODAL CONTENT */}
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-3xl p-6 my-8 animate-scale-up">
                    <button onClick={closeModal} className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
                    
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        {step === 1 ? 'Pilih Jenis Surat' : `Pilih Kategori ${selectedMainSurat?.surat_nama_jenis}`}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {step === 1 ? (
                        jenisSuratList.map(jenis => (
                            <button key={jenis.surat_id} onClick={() => handleMainSelect(jenis)} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-left transition group">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition"><FileText size={16} /></div>
                                <h3 className="font-bold text-slate-800 text-xs">{jenis.surat_nama_jenis}</h3>
                            </button>
                        ))
                    ) : (
                        subSuratList.map(sub => (
                            <button key={sub.sub_id} onClick={() => handleSubSelect(sub)} className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-left transition group">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition"><FileText size={16} /></div>
                                <h3 className="font-bold text-slate-800 text-xs">{sub.sub_nama_jenis}</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Kode: {sub.kode_surat}</p>
                            </button>
                        ))
                    )}
                    </div>
                    
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="mt-6 text-xs text-slate-500 hover:text-indigo-600 underline">Kembali ke Menu Utama</button>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}