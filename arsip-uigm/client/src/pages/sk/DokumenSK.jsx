import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SKForm from './SKForm';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { 
  Plus, Search, Trash2, Download, Calendar, 
  FileBadge, X, Edit, Eye, List, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

export default function DokumenSK() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, totalPages: 1, totalRecords: 0
  });

  // Master Data
  const [jenisOption, setJenisOption] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, title: '', message: '', type: 'info', action: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
        try {
            const res = await api.get('/master/jenis-sk');
            setJenisOption(res.data);
        } catch (err) { console.error("Gagal ambil jenis SK", err); }
    };
    fetchMaster();
  }, []);

  // 2. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 })); 
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 3. Fetch Data SK
  const fetchSK = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        bulan: filterBulan,
        tahun: filterTahun,
        jenis_sk: filterJenis
      };

      const res = await api.get('/sk', { params });
      
      if (res.data.data) {
          setData(res.data.data);
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.pagination.totalPages,
            totalRecords: res.data.pagination.totalRecords
          }));
      } else {
          if(Array.isArray(res.data)) setData(res.data);
          else setData([]);
      }

    } catch (error) { console.error("Gagal ambil SK:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, debouncedSearch, filterBulan, filterTahun, filterJenis]);

  // --- HANDLERS ---
  const handleLimitChange = (e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  const handleFilterChange = (setter, value) => { setter(value); setPagination(prev => ({ ...prev, page: 1 })); };

  const handleOpenAdd = () => { setEditData(null); setIsModalOpen(true); };
  const handleOpenEdit = (item) => { setEditData(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditData(null); };
  const handleView = (id) => navigate(`/dokumen-sk/${id}`);

  const handleDeleteClick = (item) => {
    setModalConfig({
        isOpen: true,
        title: 'Hapus SK?',
        message: `Yakin ingin menghapus SK Nomor "${item.nomor_sk}"?`,
        type: 'danger',
        action: () => executeDelete(item.id)
    });
  };

  const executeDelete = async (id) => {
    setDeleteLoading(true);
    try {
        await api.delete(`/sk/${id}`);
        setModalConfig(prev => ({...prev, isOpen: false}));
        fetchSK();
    } catch (error) { alert('Gagal menghapus data.'); } 
    finally { setDeleteLoading(false); }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 6}, (_, i) => currentYear - 4 + i);

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans relative">
      
      {/* HEADER COMPACT */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 animate-in fade-in slide-in-from-top-6 duration-500">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dokumen SK</h1>
          <p className="text-gray-500 text-[10px]">Arsip Surat Keputusan Rektor & Pejabat</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-yellow-500/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Tambah SK
        </button>
      </div>

      {/* CONTAINER TABEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          
          {/* TOOLBAR FILTER COMPACT */}
          <div className="p-3 border-b border-gray-100 flex flex-col xl:flex-row gap-3 items-center justify-between bg-gray-50/50">
            
            {/* Filter Kiri */}
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center">
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-yellow-300 transition-colors">
                    <List size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Show</span>
                    <select 
                        value={pagination.limit}
                        onChange={handleLimitChange}
                        className="bg-transparent border-none p-0 text-gray-700 focus:ring-0 cursor-pointer font-bold outline-none text-xs"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="relative w-full md:w-60 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-yellow-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Cari Nomor SK / Perihal..." 
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-xs transition-all hover:border-yellow-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Kanan */}
            <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
                <select 
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-yellow-400 transition-colors focus:ring-2 focus:ring-yellow-100 outline-none shadow-sm"
                    value={filterJenis}
                    onChange={(e) => handleFilterChange(setFilterJenis, e.target.value)}
                >
                    <option value="">Semua Jenis SK</option>
                    {jenisOption.map((j) => (
                        <option key={j.sk_id} value={j.sk_id}>{j.sk_nama_jenis}</option>
                    ))}
                </select>

                <select 
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-yellow-400 transition-colors focus:ring-2 focus:ring-yellow-100 outline-none shadow-sm"
                    value={filterBulan}
                    onChange={(e) => handleFilterChange(setFilterBulan, e.target.value)}
                >
                    <option value="">Bulan</option>
                    {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((b, i) => (
                        <option key={i} value={i+1}>{b}</option>
                    ))}
                </select>

                <select 
                    className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-yellow-400 transition-colors focus:ring-2 focus:ring-yellow-100 outline-none shadow-sm"
                    value={filterTahun}
                    onChange={(e) => handleFilterChange(setFilterTahun, e.target.value)}
                >
                    <option value="">Tahun</option>
                    {years.map(year => ( <option key={year} value={year}>{year}</option> ))}
                </select>
            </div>
          </div>

          {/* TABLE CONTENT COMPACT */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr className="text-[10px] uppercase tracking-wide">
                  <th className="px-4 py-3 text-center w-10">No</th>
                  <th className="px-4 py-3 w-1/4">Nomor & Jenis SK</th>
                  <th className="px-4 py-3 w-1/3">Perihal</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-center">File</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                
                {/* --- STATE LOADING --- */}
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-6 mx-auto"></div></td>
                        <td className="px-4 py-3 space-y-1"><div className="h-3 bg-gray-100 rounded w-3/4"></div><div className="h-2 bg-gray-100 rounded w-1/2"></div></td>
                        <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-full"></div></td>
                        <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-20"></div></td>
                        <td className="px-4 py-3"><div className="h-6 w-6 bg-gray-100 rounded-full mx-auto"></div></td>
                        <td className="px-4 py-3"><div className="h-6 w-16 bg-gray-100 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  
                  /* --- STATE KOSONG --- */
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500 animate-in fade-in zoom-in duration-300">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="bg-gray-50 p-3 rounded-full">
                          <FileText size={32} className="text-gray-300" />
                        </div>
                        <p className="text-xs">Data SK tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  
                  /* --- STATE DATA --- */
                  data.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-yellow-50/40 transition-colors duration-200 group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      
                      <td className="px-4 py-2.5 align-top text-center text-gray-500 font-medium">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="px-4 py-2.5 align-top">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-gray-800 text-xs group-hover:text-yellow-700 transition-colors duration-200">
                                {item.nomor_sk}
                            </span>
                            {/* BADGE DIPERKECIL (9px) SESUAI PERMINTAAN */}
                            <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-yellow-100 text-yellow-700 uppercase tracking-wide border border-yellow-200 group-hover:bg-yellow-200 transition-colors">
                                {item.nama_jenis_sk || 'Umum'}
                            </span>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 align-top">
                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed group-hover:text-gray-900 transition-colors" title={item.perihal_sk}>
                            {item.perihal_sk}
                        </p>
                      </td>

                      <td className="px-4 py-2.5 align-top">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 whitespace-nowrap font-mono">
                          <Calendar size={12} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                          {new Date(item.tanggal_sk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="px-4 py-2.5 align-top text-center">
                        {item.path_file_sk ? (
                          <a href={`http://localhost:5000/${item.path_file_sk}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm hover:scale-110 duration-200" title="Download PDF">
                            <Download size={12} />
                          </a>
                        ) : <span className="text-gray-300 text-[10px]">-</span>}
                      </td>

                      <td className="px-4 py-2.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                           
                           <button onClick={() => handleView(item.id)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md duration-200" title="Lihat Detail">
                              <Eye size={14} />
                           </button>
                           
                           <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-500 hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md duration-200" title="Edit Data">
                              <Edit size={14} />
                           </button>
                           
                           <button onClick={() => handleDeleteClick(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 hover:shadow-md duration-200" title="Hapus Data">
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

          {/* PAGINATION COMPACT */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <span className="text-xs text-gray-500">Menampilkan <b className="text-gray-800">{data.length}</b> dari total <b className="text-gray-800">{pagination.totalRecords}</b> data</span>
             <div className="flex items-center gap-2">
                <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all active:scale-95 duration-200">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium text-gray-700 px-3 py-0.5 bg-white border border-gray-200 rounded shadow-sm">
                    {pagination.page} / {pagination.totalPages || 1}
                </span>
                <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} disabled={pagination.page >= pagination.totalPages} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all active:scale-95 duration-200">
                  <ChevronRight size={14} />
                </button>
             </div>
          </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-in slide-in-from-top-4 duration-300 transform scale-100" style={{ maxHeight: '85vh' }}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl shrink-0">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editData ? <><Edit className="text-yellow-600" /> Edit Dokumen SK</> : <><FileBadge className="text-yellow-600" /> Input SK Baru</>}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-400 transition-colors duration-200"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <SKForm initialData={editData} onSuccess={() => { handleCloseModal(); fetchSK(); }} onCancel={handleCloseModal} />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS --- */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        isLoading={deleteLoading}
        onClose={() => setModalConfig(prev => ({...prev, isOpen: false}))}
        onConfirm={modalConfig.action}
      />
    </div>
  );
}