import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; 
import { 
  Save, X, Upload, FileText, Calendar, Hash, 
  Briefcase, MapPin, Target, AlignLeft, Layers, PenTool, Eye, File
} from 'lucide-react';

export default function SuratForm({ onSuccess, onCancel, initialData = null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State untuk Data Master
  const [bagianList, setBagianList] = useState([]);
  const [jenisSuratList, setJenisSuratList] = useState([]); 
  const [subJenisList, setSubJenisList] = useState([]);     
  
  // State Form
  const [formData, setFormData] = useState({
    nomor_surat: '',
    surat_perihal: '',
    asal_surat: '', 
    jenis_surat: '1', 
    surat_lainnya: '', 
    tanggal_surat: new Date().toISOString().split('T')[0],
    tujuan_surat: '',
    inti_surat: '',
    surat_tanda_tangan: ''
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 

  // --- STATE MODAL KONFIRMASI ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null
  });

  // Fetch Master Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBagian, resJenis, resSub] = await Promise.all([
           api.get('/master/bagian'),
           api.get('/master/jenis-surat'),
           api.get('/master/jenis-surat-sub')
        ]);
        setBagianList(resBagian.data);
        setJenisSuratList(resJenis.data);
        setSubJenisList(resSub.data);
      } catch (error) {
        console.error("Error master data", error);
      }
    };
    fetchData();
  }, []);

  // Set Initial Data (Edit)
  useEffect(() => {
    if (initialData) {
      const dateString = initialData.tanggal_surat 
        ? new Date(initialData.tanggal_surat).toISOString().split('T')[0] 
        : '';
      setFormData({
        nomor_surat: initialData.nomor_surat,
        surat_perihal: initialData.surat_perihal,
        asal_surat: initialData.asal_surat,
        jenis_surat: initialData.jenis_surat,
        surat_lainnya: initialData.surat_lainnya, 
        tanggal_surat: dateString,
        tujuan_surat: initialData.tujuan_surat,
        inti_surat: initialData.inti_surat,
        surat_tanda_tangan: initialData.surat_tanda_tangan || ''
      });
    }
  }, [initialData]);

  // Handlers
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // --- LOGIKA UTAMA: STEP 1 ---
  const handlePreSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nomor_surat || !formData.surat_perihal) {
       setModalConfig({
         isOpen: true,
         title: 'Data Belum Lengkap',
         message: 'Mohon isi Nomor Surat dan Perihal sebelum menyimpan.',
         type: 'warning',
         action: () => setModalConfig(prev => ({ ...prev, isOpen: false })) 
       });
       return;
    }

    const isEdit = !!initialData;
    const hasFile = !!file;
    
    setModalConfig({
      isOpen: true,
      title: isEdit ? 'Konfirmasi Perubahan' : 'Konfirmasi Simpan',
      message: hasFile 
        ? `Simpan data ${isEdit ? 'perubahan' : 'baru'} beserta file dokumen?`
        : `Simpan data ${isEdit ? 'perubahan' : 'baru'} ini?`,
      type: 'info',
      action: processSubmit
    });
  };

  // --- LOGIKA UTAMA: STEP 2 ---
  const processSubmit = async () => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key] === null || formData[key] === undefined ? '' : formData[key];
        dataToSend.append(key, value);
      });
      if (file) dataToSend.append('file_surat', file);

      if (initialData) {
        await api.put(`/surat/${initialData.id}`, dataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/surat', dataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setModalConfig(prev => ({ ...prev, isOpen: false }));

      if (onSuccess) onSuccess(); 
      else navigate('/dokumen-surat');

    } catch (error) {
      console.error(error);
      setModalConfig({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan sistem saat menyimpan data.',
        type: 'danger',
        action: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  // Komponen Label Kecil
  const Label = ({ icon: Icon, text, required }) => (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
      <div className="p-0.5 bg-blue-50 text-blue-600 rounded"><Icon size={12} /></div>
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // Class Input Compact
  const inputClass = "w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all duration-200";

  return (
    <>
      <form onSubmit={handlePreSubmit} className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start h-full">
          
          {/* KOLOM KIRI: INPUT FORM */}
          <div className="space-y-4 bg-white p-1 rounded-lg">
             <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wider">Informasi Surat</h3>
                
                {/* Inputs */}
                <div><Label icon={Hash} text="Nomor Surat" required /><input type="text" name="nomor_surat" required className={inputClass} value={formData.nomor_surat} onChange={handleChange} /></div>
                <div><Label icon={Calendar} text="Tanggal Surat" required /><input type="date" name="tanggal_surat" required className={inputClass} value={formData.tanggal_surat} onChange={handleChange} /></div>
                
                {/* Selects */}
                <div>
                   <Label icon={Briefcase} text="Jenis Surat" />
                   <div className="relative">
                      <select name="jenis_surat" className={`${inputClass} appearance-none cursor-pointer`} value={formData.jenis_surat} onChange={handleChange}>
                         {jenisSuratList.map(j => <option key={j.surat_id} value={j.surat_id}>{j.surat_nama_jenis}</option>)}
                      </select>
                   </div>
                </div>

                {parseInt(formData.jenis_surat) === 2 && (
                   <div className="animate-in fade-in slide-in-from-top-1"><Label icon={Layers} text="Sub Jenis" /><select name="surat_lainnya" className={inputClass} value={formData.surat_lainnya} onChange={handleChange}><option value="">-- Pilih --</option>{subJenisList.map(sub => <option key={sub.sub_id} value={sub.sub_id}>{sub.sub_nama_jenis}</option>)}</select></div>
                )}

                <div className="grid grid-cols-2 gap-3">
                   <div><Label icon={MapPin} text="Asal" required /><select name="asal_surat" required className={inputClass} value={formData.asal_surat} onChange={handleChange}><option value="">-- Pilih --</option>{bagianList.map(i => <option key={i.bagian_id} value={i.bagian_id}>{i.nama_bagian}</option>)}</select></div>
                   <div><Label icon={Target} text="Tujuan" required /><select name="tujuan_surat" required className={inputClass} value={formData.tujuan_surat} onChange={handleChange}><option value="">-- Pilih --</option>{bagianList.map(i => <option key={i.bagian_id} value={i.bagian_id}>{i.nama_bagian}</option>)}</select></div>
                </div>

                <div><Label icon={PenTool} text="Penanda Tangan" required /><select name="surat_tanda_tangan" required className={inputClass} value={formData.surat_tanda_tangan} onChange={handleChange}><option value="">-- Pilih --</option>{bagianList.map(i => <option key={i.bagian_id} value={i.bagian_id}>{i.nama_bagian} (Kepala)</option>)}</select></div>

                {/* Upload Compact */}
                <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-50 mt-2">
                   <Label icon={Upload} text={initialData ? "Ganti File PDF" : "Upload File PDF"} />
                   <div className="relative border border-dashed border-gray-300 bg-white rounded p-2 text-center hover:border-blue-400 cursor-pointer transition-colors">
                      <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                      <span className="text-[10px] text-gray-500 font-medium block truncate">{file ? file.name : "Klik pilih file PDF"}</span>
                   </div>
                </div>

                <div className="pt-3 border-t border-gray-50 space-y-3">
                   <div><Label icon={FileText} text="Perihal" required /><textarea name="surat_perihal" rows="2" required className={inputClass} value={formData.surat_perihal} onChange={handleChange} /></div>
                   <div><Label icon={AlignLeft} text="Ringkasan" /><textarea name="inti_surat" rows="2" className={inputClass} value={formData.inti_surat} onChange={handleChange} /></div>
                </div>

                {/* Buttons Compact */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
                   <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition">Batal</button>
                   <button type="submit" disabled={loading} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition">{loading ? "Menyimpan..." : "Simpan"}</button>
                </div>
             </div>
          </div>

          {/* KOLOM KANAN: PREVIEW COMPACT */}
          <div className="hidden lg:block sticky top-0 h-[80vh] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-inner flex flex-col">
             <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase"><Eye size={14} className="text-blue-600" /><span>Preview</span></div>
                {previewUrl && <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-[10px] text-red-500 hover:text-red-700 hover:underline">Hapus</button>}
             </div>
             <div className="flex-1 p-2 overflow-hidden relative h-full bg-gray-200">
                {previewUrl ? (
                  <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded bg-white shadow-sm" /> 
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded border border-dashed border-gray-300">
                    <File size={32} className="opacity-30 mb-2" />
                    <p className="text-[10px]">Pilih file di kiri untuk pratinjau</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </form>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        isLoading={loading}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.action}
      />
    </>
  );
}