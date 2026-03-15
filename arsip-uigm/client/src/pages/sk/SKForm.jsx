import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; 
import { 
  Save, X, Upload, FileBadge, Calendar, Hash, 
  MapPin, AlignLeft, PenTool, Eye, File, Target 
} from 'lucide-react';

export default function SKForm({ onSuccess, onCancel, initialData = null }) {
  const [loading, setLoading] = useState(false);
  
  // Data Master
  const [bagianList, setBagianList] = useState([]);
  const [jenisSKList, setJenisSKList] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    nomor_sk: '',
    perihal_sk: '',
    id_jenis_sk: '',
    asal_surat_sk: '',
    tanggal_sk: new Date().toISOString().split('T')[0],
    tujuan_sppd: '', 
    lainnya_sk: '',
    sk_tanda_tangan: ''
  });
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 

  // State Modal Konfirmasi
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null
  });

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resBagian, resJenis] = await Promise.all([
            api.get('/master/bagian'),
            api.get('/master/jenis-sk')
        ]);
        setBagianList(resBagian.data);
        setJenisSKList(resJenis.data);
      } catch (error) { console.error("Error Master Data", error); }
    };
    fetchMaster();
  }, []);

  // 2. Initial Data (Edit Mode)
  useEffect(() => {
    if (initialData) {
      const dateString = initialData.tanggal_sk 
        ? new Date(initialData.tanggal_sk).toISOString().split('T')[0] 
        : '';
        
      setFormData({
        nomor_sk: initialData.nomor_sk,
        perihal_sk: initialData.perihal_sk,
        id_jenis_sk: initialData.id_jenis_sk,
        asal_surat_sk: initialData.asal_surat_sk,
        tanggal_sk: dateString,
        tujuan_sppd: initialData.tujuan_sppd || '',
        lainnya_sk: initialData.lainnya_sk || '',
        sk_tanda_tangan: initialData.sk_tanda_tangan || ''
      });
    }
  }, [initialData]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // --- LOGIKA SIMPAN DENGAN MODAL ---
  const handlePreSubmit = (e) => {
    e.preventDefault();

    // Validasi
    if (!formData.nomor_sk || !formData.perihal_sk || !formData.id_jenis_sk) {
        setModalConfig({
            isOpen: true,
            title: 'Data Belum Lengkap',
            message: 'Mohon lengkapi Nomor SK, Perihal, dan Jenis SK.',
            type: 'warning',
            action: () => setModalConfig(prev => ({...prev, isOpen: false}))
        });
        return;
    }

    const isEdit = !!initialData;
    const hasFile = !!file;

    setModalConfig({
        isOpen: true,
        title: isEdit ? 'Update SK' : 'Simpan SK Baru',
        message: hasFile 
            ? `Anda akan menyimpan data SK beserta file dokumen baru. Lanjutkan?`
            : `Anda akan menyimpan data SK ini. Lanjutkan?`,
        type: 'info',
        action: processSubmit
    });
  };

  const processSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const val = formData[key] === null || formData[key] === undefined ? '' : formData[key];
        data.append(key, val);
      });
      if (file) data.append('file', file); 

      if (initialData) {
        await api.put(`/sk/${initialData.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/sk', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      setModalConfig(prev => ({ ...prev, isOpen: false }));
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      setModalConfig({
        isOpen: true,
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan sistem saat menyimpan data SK.',
        type: 'danger',
        action: () => setModalConfig(prev => ({...prev, isOpen: false}))
      });
    } finally {
      setLoading(false);
    }
  };

  // Komponen Label Compact
  const Label = ({ icon: Icon, text, required }) => (
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
      <div className="p-0.5 bg-yellow-50 text-yellow-600 rounded"><Icon size={12} /></div>
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // Class Input Compact
  const inputClass = "w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 focus:border-yellow-500 focus:bg-white transition-all duration-200";

  return (
    <>
      <form onSubmit={handlePreSubmit} className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start h-full">
          
          {/* KOLOM KIRI: FORM INPUT COMPACT */}
          <div className="space-y-4 bg-white p-1 rounded-lg">
            <div className="space-y-3">
              {/* Header Section Diperkecil */}
              <h3 className="text-xs font-bold text-gray-400 border-b border-gray-100 pb-1 mb-2 uppercase tracking-wider">Informasi Surat Keputusan</h3>
              
              {/* Inputs */}
              <div><Label icon={Hash} text="Nomor SK" required /><input type="text" name="nomor_sk" required className={inputClass} value={formData.nomor_sk} onChange={handleChange} placeholder="Contoh: SK/2026/001" /></div>
              
              <div><Label icon={Calendar} text="Tanggal SK" required /><input type="date" name="tanggal_sk" required className={inputClass} value={formData.tanggal_sk} onChange={handleChange} /></div>

              <div>
                <Label icon={FileBadge} text="Jenis SK" required />
                <div className="relative">
                    <select name="id_jenis_sk" required className={`${inputClass} cursor-pointer`} value={formData.id_jenis_sk} onChange={handleChange}>
                        <option value="">-- Pilih Jenis SK --</option>
                        {jenisSKList.map(j => <option key={j.sk_id} value={j.sk_id}>{j.sk_nama_jenis}</option>)}
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div><Label icon={MapPin} text="Asal / Unit Kerja" /><select name="asal_surat_sk" className={inputClass} value={formData.asal_surat_sk} onChange={handleChange}><option value="">-- Pilih --</option>{bagianList.map(b => <option key={b.bagian_id} value={b.bagian_id}>{b.nama_bagian}</option>)}</select></div>
                 <div><Label icon={Target} text="Tujuan SPPD (Opsional)" /><input type="text" name="tujuan_sppd" className={inputClass} value={formData.tujuan_sppd} onChange={handleChange} placeholder="Kota / Lokasi" /></div>
              </div>

              <div>
                  <Label icon={PenTool} text="Penanda Tangan" />
                  <select name="sk_tanda_tangan" className={inputClass} value={formData.sk_tanda_tangan} onChange={handleChange}>
                     <option value="">-- Pilih Penanda Tangan --</option>
                     {bagianList.map(b => <option key={b.bagian_id} value={b.bagian_id}>{b.nama_bagian} (Kepala)</option>)}
                  </select>
              </div>

              {/* Upload Compact */}
              <div className="bg-yellow-50/30 p-3 rounded-lg border border-yellow-100 mt-2">
                  <Label icon={Upload} text={initialData ? "Ganti Dokumen SK (Opsional)" : "Upload Dokumen SK"} />
                  <div className="relative border border-dashed border-gray-300 bg-white rounded p-2 text-center hover:border-yellow-500 cursor-pointer transition">
                      <input type="file" accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                      <div className="flex items-center justify-center gap-1.5 text-gray-500">
                          <span className="text-[10px] font-medium truncate">{file ? file.name : "Klik pilih file PDF"}</span>
                      </div>
                  </div>
              </div>

              <div className="pt-3 border-t border-gray-50 space-y-3">
                  <div><Label icon={AlignLeft} text="Perihal / Judul SK" required /><textarea name="perihal_sk" rows="2" required className={inputClass} value={formData.perihal_sk} onChange={handleChange} /></div>
                  <div><Label icon={AlignLeft} text="Keterangan Lainnya" /><textarea name="lainnya_sk" rows="2" className={inputClass} value={formData.lainnya_sk} onChange={handleChange} /></div>
              </div>

              {/* Buttons Compact */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
                 <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition">Batal</button>
                 <button type="submit" disabled={loading} className="px-4 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 shadow-sm transition">{loading ? "Menyimpan..." : "Simpan"}</button>
              </div>

            </div>
          </div>

          {/* KOLOM KANAN: PREVIEW COMPACT */}
          <div className="hidden lg:block sticky top-0 h-[80vh] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-inner flex flex-col">
             <div className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase"><Eye size={14} className="text-yellow-600" /><span>Preview</span></div>
                {previewUrl && <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="text-[10px] text-red-500 hover:text-red-700 hover:underline">Hapus</button>}
             </div>
             <div className="flex-1 p-2 overflow-hidden relative h-full bg-gray-200">
                {previewUrl ? <iframe src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full rounded bg-white shadow-sm block" title="Preview" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded border border-dashed border-gray-300"><File size={32} className="opacity-30 mb-2" /><p className="text-[10px]">Pilih file di kiri</p></div>}
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
        onClose={() => setModalConfig(prev => ({...prev, isOpen: false}))}
        onConfirm={modalConfig.action}
      />
    </>
  );
}