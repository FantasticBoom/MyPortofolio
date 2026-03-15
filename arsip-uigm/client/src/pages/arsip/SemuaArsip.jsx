import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Search, Calendar, FileText, FileBadge, RefreshCw, Filter, Loader2,
  ChevronLeft, ChevronRight, List
} from 'lucide-react';

export default function SemuaArsip() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  
  // State Dropdown
  const [jenisOptions, setJenisOptions] = useState([]); 
  const [selectedJenis, setSelectedJenis] = useState(''); 
  const [loadingJenis, setLoadingJenis] = useState(false); 
  const [subJenisOptions, setSubJenisOptions] = useState([]);
  const [selectedSubJenis, setSelectedSubJenis] = useState('');
  const [loadingSubJenis, setLoadingSubJenis] = useState(false);

  // State Tanggal
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [selectedYear, setSelectedYear] = useState('');   

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  const months = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
    { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchJenis = async () => {
      setJenisOptions([]); setSelectedJenis(''); setSubJenisOptions([]); setSelectedSubJenis('');
      if (kategori === 'Semua') return;
      setLoadingJenis(true);
      try {
        const endpoint = kategori === 'Surat' ? '/arsip/jenis-surat' : '/arsip/jenis-sk';
        const res = await api.get(endpoint);
        setJenisOptions(res.data.data); 
      } catch (error) { console.error("Gagal ambil jenis", error); } finally { setLoadingJenis(false); }
    };
    fetchJenis();
  }, [kategori]);

  useEffect(() => {
    const fetchSubJenis = async () => {
      setSubJenisOptions([]); setSelectedSubJenis('');
      if (kategori === 'Surat' && selectedJenis) {
        setLoadingSubJenis(true);
        try {
          const res = await api.get('/arsip/jenis-surat-sub', { params: { surat_id: selectedJenis } });
          setSubJenisOptions(res.data.data);
        } catch (error) { console.error("Gagal ambil sub jenis", error); } finally { setLoadingSubJenis(false); }
      }
    };
    fetchSubJenis();
  }, [kategori, selectedJenis]);

  const fetchArsip = async () => {
    setLoading(true);
    setCurrentPage(1); 
    try {
      let params = {
        q: search,
        kategori: kategori !== 'Semua' ? kategori : '',
        jenis_id: selectedJenis,
        sub_jenis_id: selectedSubJenis,
        start_date: '',
        end_date: ''
      };

      if (selectedYear && selectedMonth) {
        const startDateVal = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
        const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDateVal = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${lastDayOfMonth}`;
        params.start_date = startDateVal;
        params.end_date = endDateVal;
      } else if (selectedYear && !selectedMonth) {
        params.start_date = `${selectedYear}-01-01`;
        params.end_date = `${selectedYear}-12-31`;
      }
      
      const res = await api.get('/arsip', { params });
      setData(res.data.data); 
    } catch (error) { console.error("Gagal cari arsip", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchArsip(); }, []);
  const handleKeyDown = (e) => { if (e.key === 'Enter') fetchArsip(); };
  
  const handleReset = () => {
    setSearch(''); setKategori('Semua'); 
    setJenisOptions([]); setSelectedJenis('');
    setSubJenisOptions([]); setSelectedSubJenis(''); 
    setSelectedMonth(''); setSelectedYear('');  
    setCurrentPage(1); 
    setTimeout(() => { window.location.reload(); }, 100);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-2">
        <div>
          <h1 className="text-base font-bold text-gray-800">Semua Arsip</h1>
          <p className="text-gray-500 text-[10px] mt-0.5">Pencarian terpusat dokumen Surat dan SK</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[9px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          <Filter size={10} /> <span>Filter Lanjutan</span>
        </div>
      </div>

      {/* Filter Card (Dikembalikan ke ukuran Compact Normal h-9) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Kata Kunci */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Kata Kunci</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Cari..." className="w-full pl-9 pr-3 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none transition"
                value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          
          {/* Kategori */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Kategori</label>
            <select className="w-full px-3 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              value={kategori} onChange={(e) => setKategori(e.target.value)}
            >
              <option value="Semua">Semua Dokumen</option>
              <option value="Surat">Surat Menyurat</option>
              <option value="SK">Surat Keputusan (SK)</option>
            </select>
          </div>
          
          {/* Jenis Dokumen */}
          <div>
            {kategori !== 'Semua' ? (
              <>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                  Jenis {kategori === 'Surat' ? 'Surat' : 'SK'}
                </label>
                <div className="relative">
                  <select 
                    className="w-full px-3 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    value={selectedJenis} onChange={(e) => setSelectedJenis(e.target.value)} disabled={loadingJenis}
                  >
                    <option value="">Semua Jenis</option>
                    {jenisOptions.map((opt) => (
                      <option key={kategori === 'Surat' ? opt.surat_id : opt.sk_id} value={kategori === 'Surat' ? opt.surat_id : opt.sk_id}>
                        {kategori === 'Surat' ? opt.surat_nama_jenis : opt.sk_nama_jenis}
                      </option>
                    ))}
                  </select>
                  {loadingJenis && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-gray-400" size={12} /></div>}
                </div>
              </>
            ) : <div className="hidden md:block"></div>}
          </div>
          
          {/* Sub Jenis / Cari */}
          {subJenisOptions.length > 0 ? (
            <div>
               <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Sub Jenis</label>
               <div className="relative">
                  <select 
                    className="w-full px-3 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                    value={selectedSubJenis} onChange={(e) => setSelectedSubJenis(e.target.value)} disabled={loadingSubJenis}
                  >
                    <option value="">Semua Sub Jenis</option>
                    {subJenisOptions.map((opt) => (
                      <option key={opt.sub_id} value={opt.sub_id}>{opt.sub_nama_jenis}</option>
                    ))}
                  </select>
                  {loadingSubJenis && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-gray-400" size={12} /></div>}
               </div>
            </div>
          ) : (
            <div className="flex justify-end">
                <button onClick={fetchArsip} className="w-auto px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2">
                <Search size={14} /> Cari
                </button>
            </div>
          )}
        </div>
        
        {subJenisOptions.length > 0 && (
           <div className="flex justify-end mt-3 border-t border-gray-50 pt-3">
              <button onClick={fetchArsip} className="w-auto px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2">
                <Search size={14} /> Cari Arsip
              </button>
           </div>
        )}

        {/* Filter Bulan/Tahun */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-50">
           <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Bulan</label>
              <select className="w-full px-3 h-9 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">Semua Bulan</option>
                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
           </div>
           <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tahun</label>
              <select className="w-full px-3 h-9 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>
           <div className="hidden md:block"></div>
           <div className="flex justify-end">
              <button onClick={handleReset} className="w-auto px-4 h-9 text-[10px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100 flex items-center justify-center gap-1 mt-auto">
                <RefreshCw size={12} /> Reset Filter
              </button>
           </div>
        </div>
      </div>

      {/* --- HASIL PENCARIAN & PAGINATION --- */}
      <div className="flex flex-col space-y-3">
        
        {/* Show Entries Control */}
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit">
          <div className="flex items-center gap-2">
             <List size={16} className="text-gray-400" />
             
             {/* --- INI YANG DIPERKECIL --- */}
             {/* Tulisan 'Show' dibuat kecil (text-[10px] uppercase) */}
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Show</span>
             
             {/* Dropdown Angka tetap normal/sedikit lebih besar agar mudah diklik */}
             <select 
               className="font-bold text-gray-800 border-none outline-none bg-transparent cursor-pointer focus:ring-0 p-0 text-xs"
               value={itemsPerPage}
               onChange={(e) => {
                 setItemsPerPage(Number(e.target.value));
                 setCurrentPage(1);
               }}
             >
               <option value="10">10</option>
               <option value="25">25</option>
               <option value="50">50</option>
               <option value="100">100</option>
             </select>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/30 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-semibold w-16 text-center">Tipe</th>
                  <th className="px-4 py-3 font-semibold">Nomor</th>
                  <th className="px-4 py-3 font-semibold">Perihal</th>
                  <th className="px-4 py-3 font-semibold">Jenis</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                   <tr><td colSpan="6" className="p-8 text-center text-xs text-gray-400">Sedang mencari data...</td></tr>
                ) : data.length === 0 ? (
                   <tr><td colSpan="6" className="p-8 text-center text-xs text-gray-400">Belum ada data yang cocok.</td></tr>
                ) : (
                  currentItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-4 py-2.5 text-center">
                        {item.kategori === 'Surat' ? (
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto border border-blue-100"><FileText size={16} /></div>
                        ) : (
                          <div className="w-8 h-8 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mx-auto border border-yellow-100"><FileBadge size={16} /></div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-gray-800">{item.nomor}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 max-w-xs truncate">{item.perihal}</td>
                      <td className="px-4 py-2.5">
                          <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-gray-500 bg-gray-50 rounded px-2 w-fit">{item.nama_jenis || '-'}</span>
                              {item.nama_sub_jenis && (
                                  <span className="text-[9px] text-blue-600 bg-blue-50 rounded px-2 w-fit">{item.nama_sub_jenis}</span>
                              )}
                          </div>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-gray-500 font-mono">
                        <div className="flex items-center gap-1.5"><Calendar size={12} />{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                         <a href={item.kategori === 'Surat' ? `/surat` : `/sk`} className="text-[10px] font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-blue-100">Lihat Detail</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination */}
        {data.length > 0 && (
           <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 px-1">
              <div>
                Menampilkan <b>{indexOfFirstItem + 1}</b> sampai <b>{Math.min(indexOfLastItem, data.length)}</b> dari <b>{data.length}</b> data
              </div>

              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage === 1}
                   className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600"
                 >
                   <ChevronLeft size={14} />
                 </button>
                 
                 <span className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 font-medium text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                 </span>

                 <button 
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage === totalPages}
                   className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600"
                 >
                   <ChevronRight size={14} />
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}