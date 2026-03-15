import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { 
  FileSignature, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  ChevronLeft, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function MasterTTD() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form (Sesuai kolom DB: jabatan, nama_pejabat, NIDN, status)
  const [form, setForm] = useState({ 
    id: null, 
    nama_pejabat: '', 
    jabatan: '', 
    NIDN: '',
    status: 'Aktif' 
  });
  const [isEdit, setIsEdit] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const res = await api.get('/master/ttd');
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
        await api.put(`/master/ttd/${form.id}`, form);
      } else {
        await api.post('/master/ttd', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus pejabat ini secara permanen?')) {
      try {
        await api.delete(`/master/ttd/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus data');
      }
    }
  };

  const openAdd = () => { 
    setForm({ id: null, nama_pejabat: '', jabatan: '', NIDN: '', status: 'Aktif' }); 
    setIsEdit(false); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (item) => { 
    setForm({ 
      id: item.ttd_id, 
      nama_pejabat: item.nama_pejabat, 
      jabatan: item.jabatan, 
      NIDN: item.NIDN,
      status: item.status 
    }); 
    setIsEdit(true); 
    setIsModalOpen(true); 
  };

  // Filter Search
  const filteredData = data.filter(item => 
    item.nama_pejabat?.toLowerCase().includes(search.toLowerCase()) ||
    item.jabatan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans space-y-8 animate-fade-in-up">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link to="/admin/master" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-3 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pejabat Penanda Tangan</h1>
          <p className="text-slate-500 mt-2 text-base">Kelola daftar pejabat yang berwenang menandatangani surat/SK.</p>
        </div>
        
        <button 
           onClick={openAdd} 
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95"
        >
           <Plus size={20} /> Tambah Pejabat
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
                placeholder="Cari nama pejabat atau jabatan..." 
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           {/* Stats Kecil */}
           <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserCheck size={16} />
              <span>Total: <strong className="text-slate-800">{filteredData.length}</strong> Pejabat</span>
           </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 w-20">#</th>
                <th className="px-8 py-4">Nama Pejabat</th>
                <th className="px-8 py-4">Jabatan</th>
                <th className="px-8 py-4">NIDN</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">Sedang memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileSignature size={24} />
                        </div>
                        <p className="text-sm">Data pejabat tidak ditemukan.</p>
                    </div>
                </td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.ttd_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4 text-slate-400 font-medium text-sm">{idx + 1}</td>
                    
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                         {/* Avatar Inisial */}
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                            {item.nama_pejabat.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-800">{item.nama_pejabat}</p>
                         </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-4 text-slate-600 font-medium text-sm">
                       {item.jabatan}
                    </td>

                    <td className="px-8 py-4 text-slate-500 font-mono text-sm">
                       {item.NIDN || '-'}
                    </td>

                    <td className="px-8 py-4 text-center">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                         item.status === 'Aktif' 
                           ? 'bg-green-100 text-green-700 border border-green-200' 
                           : 'bg-slate-100 text-slate-600 border border-slate-200'
                       }`}>
                         {item.status}
                       </span>
                    </td>
                    
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openEdit(item)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="Edit">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.ttd_id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Hapus">
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
           Menampilkan seluruh data pejabat penanda tangan
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
                 {isEdit ? 'Ubah Data Pejabat' : 'Tambah Pejabat Baru'}
              </h3>
              <p className="text-slate-500 text-sm mt-1">Lengkapi informasi pejabat di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap & Gelar</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Contoh: Dr. Ir. H. Herri Setiawan, S.Kom., M.Kom."
                  value={form.nama_pejabat} 
                  onChange={e => setForm({...form, nama_pejabat: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Jabatan</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Contoh: Rektor / Dekan FIK"
                  value={form.jabatan} 
                  onChange={e => setForm({...form, jabatan: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">NIDN (Opsional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    placeholder="Contoh: 02240..."
                    value={form.NIDN} 
                    onChange={e => setForm({...form, NIDN: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                    value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
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