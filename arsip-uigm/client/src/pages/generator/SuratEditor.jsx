import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { Save, Printer, ArrowLeft } from 'lucide-react';

// --- IMPORTS BARU (Form & Template Manager) ---
import FormManager from './components/FormManager';
import TemplateManager from './components/TemplateManager';

export default function SuratEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref untuk fitur cetak (react-to-print)
  const printRef = useRef(null);
  
  // Ambil data dari navigasi (termasuk isEditMode & existingData untuk Edit)
  const { surat_id, sub_id, nama_jenis, isEditMode, existingData } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [bagianList, setBagianList] = useState([]);
  const [foundPejabat, setFoundPejabat] = useState(null);
  
  // autoData menyimpan data hasil generate (Pejabat, Bulan, Tahun, Nomor Urut Baru)
  const [autoData, setAutoData] = useState(null); 

  // State Form Utama
  const [form, setForm] = useState({
    nomor_surat: '---/---/---', 
    lampiran: '-',
    perihal: '',
    kepada: '',      
    kepada_sub: '',  
    di_tempat: 'Palembang',
    isi_surat: '',   
    tembusan: '', 
    tanggal_surat: new Date().toISOString().split('T')[0],
    bagian_id: '', 
    ttd_id: ''
  });

  // --- LOGIC PRINT ---
  const handlePrint = useReactToPrint({
    contentRef: printRef, 
    documentTitle: `Surat-${form.nomor_surat.replace(/\//g, '-')}`,
    onAfterPrint: () => console.log("Cetak Selesai"),
    onPrintError: (error) => console.error("Error Cetak", error),
  });

  // --- LOGIC GENERATE NOMOR & CARI PEJABAT ---
  const fetchNumberAndPejabat = async (selectedBagianId, preserveNumber = false) => {
      if (!surat_id || !selectedBagianId) {
          if (!preserveNumber) setForm(prev => ({ ...prev, nomor_surat: '---/---/---' }));
          setFoundPejabat(null);
          return;
      }
      try {
          const res = await api.get('/generator/number', {
              params: { surat_id, sub_id: sub_id || null, bagian_id: selectedBagianId }
          });
          if (res.data.success) {
              setForm(prev => ({ 
                  ...prev, 
                  nomor_surat: preserveNumber ? prev.nomor_surat : res.data.nomor_surat,
                  ttd_id: res.data.data.pejabat ? res.data.data.pejabat.ttd_id : ''
              }));
              
              setAutoData(res.data.data);
              
              if (res.data.data.pejabat) setFoundPejabat(res.data.data.pejabat);
              else setFoundPejabat(null);
          }
      } catch (error) { console.error(error); }
  };

  // --- INITIAL LOAD (Load Master Data & Handle Edit Mode) ---
  useEffect(() => {
    if (!surat_id) { navigate('/generator'); return; }

    const init = async () => {
        try {
            // 1. Load Data Bagian
            const resBagian = await api.get('/master/bagian');
            setBagianList(resBagian.data);

            // 2. CEK MODE EDIT: Jika ada existingData, masukkan ke Form
            if (isEditMode && existingData) {
                const fmtDate = existingData.tanggal_surat 
                    ? new Date(existingData.tanggal_surat).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0];

                setForm(prev => ({
                    ...prev,
                    nomor_surat: existingData.nomor_surat, 
                    perihal: existingData.perihal || '',
                    kepada: existingData.kepada || '',
                    kepada_sub: existingData.kepada_sub || '',
                    isi_surat: existingData.isi_surat || '',
                    tembusan: existingData.tembusan || '',
                    tanggal_surat: fmtDate,
                    bagian_id: existingData.bagian_id || '',
                    ttd_id: existingData.ttd_id || ''
                }));

                if (existingData.bagian_id) {
                    await fetchNumberAndPejabat(existingData.bagian_id, true);
                    if(existingData.ttd_id) {
                        setForm(prev => ({ ...prev, ttd_id: existingData.ttd_id }));
                    }
                }
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surat_id, sub_id, navigate, isEditMode, existingData]);

  // --- HANDLE PERUBAHAN INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'bagian_id') {
        fetchNumberAndPejabat(value, isEditMode);
    }
  };

  // --- HANDLE SIMPAN KE DATABASE ---
  const handleSave = async () => {
      if (!form.ttd_id) return Swal.fire("Peringatan", "Pilih pimpinan dulu.", "warning");
      
      try {
          const finalNomorUrut = (isEditMode && existingData) ? existingData.nomor_urut : (autoData?.nomor_urut || 0);
          const finalBulan = (isEditMode && existingData) ? existingData.bulan : autoData?.bulan;
          const finalTahun = (isEditMode && existingData) ? existingData.tahun : autoData?.tahun;

          await api.post('/generator/save', {
              surat_id, 
              sub_id, 
              bagian_id: form.bagian_id, 
              ttd_id: form.ttd_id, 
              nomor_surat: form.nomor_surat,
              nomor_urut: finalNomorUrut,
              bulan: finalBulan,
              tahun: finalTahun,
              ...form 
          });

          Swal.fire({ title: 'Tersimpan!', icon: 'success', timer: 1500 });
          setTimeout(() => navigate('/generator'), 1500);

      } catch (err) { 
          console.error(err);
          Swal.fire('Gagal', 'Error simpan data.', 'error'); 
      }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-xs text-gray-500">Loading Editor...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* --- HEADER COMPACT --- */}
      {/* h-16 diubah jadi h-12, px-6 jadi px-4 */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20 relative shrink-0">
         <div className="flex items-center gap-3">
             <button onClick={() => navigate('/generator')} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition">
                <ArrowLeft size={16}/>
             </button>
             <div>
                 {/* Text Title diperkecil */}
                 <h1 className="font-bold text-slate-800 text-sm">
                    {isEditMode ? 'Edit Surat' : 'Editor Surat'}
                 </h1>
                 {/* Subtitle diperkecil */}
                 <p className="text-[10px] text-slate-500">{nama_jenis || 'Draft Baru'}</p>
             </div>
         </div>
         <div className="flex items-center gap-2">
             {/* Tombol Simpan Compact */}
             <button onClick={handleSave} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1.5 hover:bg-slate-50 transition text-slate-700">
                <Save size={14} /> {isEditMode ? 'Simpan' : 'Simpan'}
             </button>
             {/* Tombol Export Compact */}
             <button onClick={handlePrint} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex gap-1.5 shadow hover:bg-indigo-700 transition active:scale-95">
                <Printer size={14} /> Export PDF
             </button>
         </div>
      </header>

      {/* --- BODY (SPLIT VIEW) --- */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* 1. INPUT FORM MANAGER */}
         <FormManager 
             jenisSurat={nama_jenis} 
             form={form} 
             handleChange={handleChange} 
             bagianList={bagianList} 
             foundPejabat={foundPejabat} 
         />
         
         {/* 2. PREVIEW TEMPLATE MANAGER */}
         <TemplateManager 
             mode="preview" 
             jenisSurat={nama_jenis} 
             data={form} 
             foundPejabat={foundPejabat} 
         />
      </div>

      {/* 3. HIDDEN PRINT COMPONENT */}
      <div style={{ display: 'none' }}>
         <TemplateManager 
             ref={printRef}
             mode="cetak" 
             jenisSurat={nama_jenis} 
             data={form} 
             foundPejabat={foundPejabat} 
         />
      </div>

    </div>
  );
}