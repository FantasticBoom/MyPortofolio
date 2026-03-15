import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SuratForm from './SuratForm';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; 
import { 
  Plus, Search, Trash2, Download, Eye, ChevronLeft, ChevronRight, FileText, List, X, Edit 
} from 'lucide-react';

export default function DokumenSurat() {
  // --- STATE DATA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Form (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- STATE MODAL KONFIRMASI ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- STATE FILTER & PAGINATION ---
  const [search, setSearch] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterSubJenis, setFilterSubJenis] = useState('');
  
  // Data Master Options
  const [jenisOption, setJenisOption] = useState([]); 
  const [subJenisOptions, setSubJenisOptions] = useState([]); 

  const [pagination, setPagination] = useState({
    page: 1, limit: 10, totalPages: 1, totalRecords: 0
  });

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const navigate = useNavigate();

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await api.get('/master/jenis-surat');
        setJenisOption(res.data);
      } catch (err) { console.error("Gagal ambil jenis surat", err); }
    };
    fetchMaster();
  }, []);

  // 2. Logic Cascading Sub Jenis
  useEffect(() => {
    if (parseInt(filterJenis) === 2) {
      const fetchSub = async () => {
        try {
          const res = await api.get('/master/jenis-surat-sub');
          const filtered = res.data.filter(item => item.surat_id === 2);
          setSubJenisOptions(filtered);
        } catch (err) { console.error("Gagal ambil sub jenis", err); }
      };
      fetchSub();
    } else {
      setFilterSubJenis('');
      setSubJenisOptions([]);
    }
  }, [filterJenis]);

  // 3. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 4. Fetch Data Surat
  const fetchSurat = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        bulan: filterBulan,
        tahun: filterTahun,
        jenis_surat: filterJenis,
        sub_jenis: filterSubJenis
      };

      const res = await api.get('/surat', { params });
      
      setData(res.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        totalRecords: res.data.pagination.totalRecords
      }));

    } catch (error) { console.error("Gagal ambil surat", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSurat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, debouncedSearch, filterBulan, filterTahun, filterJenis, filterSubJenis]);

  // --- HANDLERS ---
  const handleOpenAdd = () => { setEditData(null); setIsModalOpen(true); };
  const handleOpenEdit = (item) => { setEditData(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditData(null); };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleView = (id) => {
    navigate(`/dokumen-surat/${id}`);
  };

  const handleDeleteClick = (item) => {
    setModalConfig({
      isOpen: true,
      title: 'Hapus Dokumen?',
      message: `Apakah Anda yakin ingin menghapus surat nomor "${item.nomor_surat}"? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger', 
      action: () => executeDelete(item.id)
    });
  };

  const executeDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/surat/${id}`);
      setModalConfig(prev => ({ ...prev, isOpen: false })); 
      fetchSurat(); 
    } catch (error) {
      console.error("Gagal hapus", error);
      alert('Gagal menghapus data. Silakan coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 6}, (_, i) => currentYear - 4 + i);

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans relative">
      
      {/* HEADER: Font diperkecil tapi layout tetap */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dokumen Surat</h1>
          <p className="text-gray-500 text-[10px]">Kelola arsip surat masuk dan keluar</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200"
        >
          <Plus size={16} />
          <span>Tambah Surat</span>
        </button>
      </div>

      {/* --- CONTENT TABEL --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in-up">
        
        {/* TOOLBAR: Input lebih kecil (h-8 atau py-1.5) */}
        <div className="p-3 border-b border-gray-100 flex flex-col xl:flex-row gap-3 items-center justify-between bg-gray-50/50">
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center">
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-yellow-300 transition-colors">
                <List size={14} className="text-gray-400" />
                <span>Show</span>
                <select 
                    value={pagination.limit}
                    onChange={handleLimitChange}
                    className="bg-transparent border-none p-0 text-gray-700 focus:ring-0 cursor-pointer font-bold outline-none text-xs"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Cari Nomor / Perihal..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
            <select 
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-100 outline-none"
              value={filterJenis}
              onChange={(e) => handleFilterChange(setFilterJenis, e.target.value)}
            >
              <option value="">Semua Jenis</option>
              {jenisOption.map((jenis) => (
                <option key={jenis.surat_id} value={jenis.surat_id}>{jenis.surat_nama_jenis}</option>
              ))}
            </select>

            {parseInt(filterJenis) === 2 && (
              <select 
                className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-100 outline-none animate-fade-in-up"
                value={filterSubJenis}
                onChange={(e) => handleFilterChange(setFilterSubJenis, e.target.value)}
              >
                <option value="">Semua Sub Jenis</option>
                {subJenisOptions.map((sub) => (
                  <option key={sub.sub_id} value={sub.sub_id}>{sub.sub_nama_jenis}</option>
                ))}
              </select>
            )}

            <select 
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-100 outline-none"
              value={filterBulan}
              onChange={(e) => handleFilterChange(setFilterBulan, e.target.value)}
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>

            <select 
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-100 outline-none"
              value={filterTahun}
              onChange={(e) => handleFilterChange(setFilterTahun, e.target.value)}
            >
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABEL DATA: Font diperkecil, Padding dikurangi */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 uppercase text-[10px] tracking-wide">
              <tr>
                <th className="px-4 py-3 w-10 text-center">No</th>
                <th className="px-4 py-3 w-56">Nomor & Jenis</th>
                <th className="px-4 py-3">Perihal</th>
                <th className="px-4 py-3 w-40">Tujuan</th>
                <th className="px-4 py-3 w-28">Tanggal</th>
                <th className="px-4 py-3 w-16 text-center">File</th>
                <th className="px-4 py-3 w-24 text-right">Aksi</th> 
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-6 mx-auto"></div></td>
                    <td className="px-4 py-3 space-y-2"><div className="h-3 bg-gray-200 rounded w-3/4"></div><div className="h-2 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-4 py-3 space-y-2"><div className="h-3 bg-gray-200 rounded w-full"></div><div className="h-2 bg-gray-200 rounded w-2/3"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-6 bg-gray-200 rounded-full mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-6 w-12 bg-gray-200 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500 animate-fade-in-up">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <FileText size={32} className="text-gray-300" />
                      </div>
                      <p className="text-xs">Tidak ada data surat yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/40 transition-colors duration-200 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-2.5 text-center text-gray-500">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    
                    <td className="px-4 py-2.5">
                      {/* LAYOUT TETAP: Flex Column */}
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-bold text-gray-800 text-xs group-hover:text-blue-600 transition-colors">
                          {item.nomor_surat}
                        </span>
                        {/* BADGE JENIS (DIPERKECIL) */}
                        <div className="text-[8px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wide flex items-center gap-1">
                          <span>{item.surat_nama_jenis || 'TANPA JENIS'}</span>
                          {/* SUB JENIS TETAP ADA */}
                          {item.sub_nama_jenis && (
                             <>
                               <span className="text-gray-400">-</span>
                               <span className="text-blue-600">{item.sub_nama_jenis}</span>
                             </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="font-medium text-gray-700 line-clamp-2 leading-snug" title={item.surat_perihal}>{item.surat_perihal}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1" title={item.inti_surat}>{item.inti_surat}</div>
                    </td>

                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100 block w-fit">
                        {item.nama_tujuan_surat || item.tujuan_surat || '-'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap font-mono text-[10px]">
                      {new Date(item.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    
                    <td className="px-4 py-2.5 text-center">
                      {item.path_file_surat ? (
                        <a href={`http://localhost:5000/${item.path_file_surat}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 transform hover:scale-110 shadow-sm" title="Unduh">
                          <Download size={12} />
                        </a>
                      ) : '-'}
                    </td>
                    
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleView(item.id)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-600 hover:text-white transition-all hover:shadow-sm active:scale-95" title="Detail">
                          <Eye size={14} />
                        </button>
                        
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-500 hover:text-white transition-all hover:shadow-sm active:scale-95"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>

                        <button 
                          onClick={() => handleDeleteClick(item)} 
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all hover:shadow-sm active:scale-95" 
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: Font diperkecil */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-3">
           <span className="text-xs text-gray-500">Menampilkan <b>{data.length}</b> dari total <b>{pagination.totalRecords}</b> data</span>
           <div className="flex items-center gap-2">
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all active:scale-95">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-medium text-gray-700 px-2">Halaman {pagination.page} dari {pagination.totalPages}</span>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all active:scale-95">
                <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* --- POPUP FORM & MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-in slide-in-from-top-4 duration-200" style={{ maxHeight: '85vh' }}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl shrink-0">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editData ? <><Edit className="text-yellow-500" /> Edit Dokumen Surat</> : <><FileText className="text-blue-600" /> Input Surat Baru</>}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <SuratForm initialData={editData} onSuccess={() => { handleCloseModal(); fetchSurat(); }} onCancel={handleCloseModal} />
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        isLoading={deleteLoading} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.action}
      />
    </div>
  );
}