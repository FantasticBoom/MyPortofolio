import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { 
  FileBadge, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  ChevronLeft, 
  ArrowRight,
  Files
} from 'lucide-react';

export default function MasterJenisSK() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form (Sesuai kolom DB: sk_nama_jenis)
  const [form, setForm] = useState({ 
    id: null, 
    sk_nama_jenis: ''
  });
  const [isEdit, setIsEdit] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await api.get('/master/jenis-sk');
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
        await api.put(`/master/jenis-sk/${form.id}`, form);
      } else {
        await api.post('/master/jenis-sk', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus jenis SK ini secara permanen?')) {
      try {
        await api.delete(`/master/jenis-sk/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const openAdd = () => { 
    setForm({ id: null, sk_nama_jenis: '' }); 
    setIsEdit(false); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (item) => { 
    setForm({ 
      id: item.sk_id, 
      sk_nama_jenis: item.sk_nama_jenis 
    }); 
    setIsEdit(true); 
    setIsModalOpen(true); 
  };

  // Filter Search
  const filteredData = data.filter(item => 
    item.sk_nama_jenis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans space-y-8 animate-fade-in-up">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/admin/master" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-3 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Jenis SK</h1>
          <p className="text-slate-500 mt-2 text-base">Kelola kategori Surat Keputusan (SK) yang tersedia.</p>
        </div>
        
        <button 
           onClick={openAdd} 
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95"
        >
           <Plus size={20} /> Tambah SK
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
                placeholder="Cari nama SK..." 
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           {/* Stats Kecil */}
           <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Files size={16} />
              <span>Total: <strong className="text-slate-800">{filteredData.length}</strong> Kategori</span>
           </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 w-20">#</th>
                <th className="px-8 py-4">Nama Jenis SK</th>
                <th className="px-8 py-4 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">Sedang memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="3" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileBadge size={24} />
                        </div>
                        <p className="text-sm">Data jenis SK tidak ditemukan.</p>
                    </div>
                </td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.sk_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4 text-slate-400 font-medium text-sm">{idx + 1}</td>
                    
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                         {/* Avatar Inisial */}
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                            {item.sk_nama_jenis.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-800">{item.sk_nama_jenis}</p>
                         </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.sk_id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Hapus">
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
        
        {/* Simple Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-400 text-center">
           Menampilkan seluruh kategori SK
        </div>
      </div>

      {/* --- CLEAN MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-slate-900/5 relative">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
               <X size={24} />
            </button>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">
                 {isEdit ? 'Ubah Jenis SK' : 'Tambah Jenis SK'}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Lengkapi informasi di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Jenis SK</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Contoh: SK Pengangkatan"
                  value={form.sk_nama_jenis} 
                  onChange={e => setForm({...form, sk_nama_jenis: e.target.value})} 
                />
              </div>
              
              <div className="pt-2 flex gap-3">
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