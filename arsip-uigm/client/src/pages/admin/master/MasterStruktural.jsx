import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  ChevronLeft, 
  ArrowRight,
  CreditCard
} from 'lucide-react';

export default function MasterStruktural() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [form, setForm] = useState({ 
    id: null, 
    jabatan: '', 
    nama: '', 
    nik: '', 
    nitk: '', 
    nidn: '', 
    nuptk: '', 
    nidk: ''
  });
  const [isEdit, setIsEdit] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await api.get('/master/struktural');
      setData(res.data);
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLE ACTIONS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/master/struktural/${form.id}`, form);
      } else {
        await api.post('/master/struktural', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus data pejabat struktural ini?')) {
      try {
        await api.delete(`/master/struktural/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const openAdd = () => { 
    setForm({ id: null, jabatan: '', nama: '', nik: '', nitk: '', nidn: '', nuptk: '', nidk: '' }); 
    setIsEdit(false); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (item) => { 
    setForm({ ...item }); 
    setIsEdit(true); 
    setIsModalOpen(true); 
  };

  // Filter Search
  const filteredData = data.filter(item => 
    item.nama?.toLowerCase().includes(search.toLowerCase()) ||
    item.jabatan?.toLowerCase().includes(search.toLowerCase()) ||
    item.nik?.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans space-y-8 animate-fade-in-up">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/admin/master" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-3 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Pejabat Struktural</h1>
          <p className="text-slate-500 mt-2 text-base">Kelola data pejabat lengkap dengan NIK, NIDN, dan identitas lainnya.</p>
        </div>
        
        <button 
           onClick={openAdd} 
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95"
        >
           <Plus size={20} /> Tambah Data
        </button>
      </div>

      {/* --- CONTENT CARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Search Bar */}
           <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Cari nama, jabatan, atau NIK..." 
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           {/* Stats Kecil */}
           <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Users size={16} />
              <span>Total: <strong className="text-slate-800">{filteredData.length}</strong> Pejabat</span>
           </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 w-12">#</th>
                {/* UBAH DISINI: Set lebar spesifik agar lebih kecil */}
                <th className="px-6 py-4 w-[250px]">Nama Pejabat</th>
                {/* UBAH DISINI: Set lebar spesifik agar lebih kecil */}
                <th className="px-6 py-4 w-[200px]">Jabatan</th>
                <th className="px-6 py-4 text-center w-[180px]">Identitas (NIK)</th>
                <th className="px-6 py-4">Nomor Induk Lainnya</th>
                <th className="px-6 py-4 text-right w-24">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">Sedang memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={24} />
                        </div>
                        <p className="text-sm">Data struktural tidak ditemukan.</p>
                    </div>
                </td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-medium text-sm">{idx + 1}</td>
                    
                    {/* Nama (Ditambah truncate agar tidak melebar) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-full">
                         <div className="w-8 h-8 min-w-[2rem] rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                            {item.nama.substring(0,2).toUpperCase()}
                         </div>
                         <span className="font-semibold text-slate-800 truncate max-w-[180px]" title={item.nama}>{item.nama}</span>
                      </div>
                    </td>
                    
                    {/* Jabatan (Ditambah truncate) */}
                    <td className="px-6 py-4">
                       <div className="truncate max-w-[160px]" title={item.jabatan}>
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {item.jabatan}
                        </span>
                       </div>
                    </td>

                    {/* NIK */}
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                       {item.nik || '-'}
                    </td>

                    {/* Nomor Induk Lain (Jarak diperlebar) */}
                    <td className="px-6 py-4">
                       {/* UBAH DISINI: gap-x-4 jadi gap-x-8, gap-y-1 jadi gap-y-2 */}
                       <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-500">
                          <div>NIDN: <span className="font-mono text-slate-800">{item.nidn || '-'}</span></div>
                          <div>NITK: <span className="font-mono text-slate-800">{item.nitk || '-'}</span></div>
                          <div>NUPTK: <span className="font-mono text-slate-800">{item.nuptk || '-'}</span></div>
                          <div>NIDK: <span className="font-mono text-slate-800">{item.nidk || '-'}</span></div>
                       </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-400 text-center">
           Menampilkan seluruh data pejabat struktural
        </div>
      </div>

      {/* --- CLEAN MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl ring-1 ring-slate-900/5 relative my-8">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
               <X size={24} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                 {isEdit ? 'Ubah Data Struktural' : 'Tambah Data Struktural'}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Lengkapi form identitas di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Baris 1: Nama & Jabatan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                   <input 
                     type="text" required 
                     className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                     value={form.nama} 
                     onChange={e => setForm({...form, nama: e.target.value})} 
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-sm font-semibold text-slate-700">Jabatan</label>
                   <input 
                     type="text" required 
                     className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                     value={form.jabatan} 
                     onChange={e => setForm({...form, jabatan: e.target.value})} 
                   />
                 </div>
              </div>

              {/* Baris 2: NIK */}
              <div className="space-y-1">
                 <label className="text-sm font-semibold text-slate-700">Nomor Induk Kependudukan (NIK)</label>
                 <div className="relative">
                   <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                   <input 
                     type="text" 
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                     value={form.nik} 
                     onChange={e => setForm({...form, nik: e.target.value})} 
                   />
                 </div>
              </div>

              {/* Baris 3: ID Akademik (Grid 4 Kolom) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <CreditCard size={12}/> Identitas Akademik
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-600">NIDN</label>
                     <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                       value={form.nidn} onChange={e => setForm({...form, nidn: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-600">NITK</label>
                     <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                       value={form.nitk} onChange={e => setForm({...form, nitk: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-600">NUPTK</label>
                     <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                       value={form.nuptk} onChange={e => setForm({...form, nuptk: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-slate-600">NIDK</label>
                     <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                       value={form.nidk} onChange={e => setForm({...form, nidk: e.target.value})} />
                   </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                   type="submit" 
                   className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2"
                >
                   Simpan <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}