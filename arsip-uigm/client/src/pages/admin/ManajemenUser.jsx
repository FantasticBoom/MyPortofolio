import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Plus, Edit, Trash2, X, Save, Search, UserCheck, Shield, ShieldCheck 
} from 'lucide-react';

export default function ManajemenUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  // PERHATIKAN: field 'user' disini mengacu pada kolom 'user' di database (username)
  const [form, setForm] = useState({ 
    id: null, 
    user: '', // <-- Field ini mapping ke kolom 'user' di DB
    password: '', 
    nama_lengkap: '', 
    role: 'user',
    foto_profil: null 
  });
  const [isEdit, setIsEdit] = useState(false);

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    try {
      const res = await api.get('/master/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Gagal ambil users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- HITUNG STATISTIK ---
  const stats = {
    total: users.length,
    super_admin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    user: users.filter(u => u.role === 'user').length
  };

  // --- HANDLE FORM & DELETE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Hapus foto_profil dari payload json jika null 
      if (!payload.foto_profil) delete payload.foto_profil; 

      if (isEdit) {
        await api.put(`/master/users/${form.id}`, payload);
      } else {
        await api.post('/master/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus user ini?')) {
      await api.delete(`/master/users/${id}`);
      fetchUsers();
    }
  };

  const openAdd = () => { 
    // Reset form dengan field 'user' kosong
    setForm({ id: null, user: '', password: '', nama_lengkap: '', role: 'user', foto_profil: null }); 
    setIsEdit(false); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (u) => { 
    // Load data user ke form (u.user masuk ke form.user)
    setForm({ ...u, password: '' }); 
    setIsEdit(true); 
    setIsModalOpen(true); 
  };

  // Filter Search (Mencari berdasarkan nama_lengkap atau user)
  const filteredUsers = users.filter(u => 
    u.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    u.user?.toLowerCase().includes(search.toLowerCase()) // <-- Search by field 'user'
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* HEADER PAGE */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
        <p className="text-gray-500 text-sm">Kelola data pengguna sistem dan hak akses.</p>
      </div>

      {/* --- BAGIAN 1: INFO CARDS (STATISTIK) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pengguna */}
        <div className="bg-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30 relative overflow-hidden">
           <Users className="absolute -right-4 -bottom-4 text-white/20 w-32 h-32" />
           <div className="relative z-10">
             <h2 className="text-4xl font-bold mb-1">{stats.total}</h2>
             <p className="text-blue-100 font-medium text-sm">Total Pengguna</p>
           </div>
        </div>

        {/* Card 2: Super Admin */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <ShieldCheck className="absolute -right-4 -bottom-4 text-gray-100 w-32 h-32" />
           <div className="relative z-10">
             <h2 className="text-4xl font-bold text-gray-800 mb-1">{stats.super_admin}</h2>
             <p className="text-gray-500 font-medium text-sm">Super Admin</p>
           </div>
        </div>

        {/* Card 3: Admin */}
        <div className="bg-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-600/30 relative overflow-hidden">
           <Shield className="absolute -right-4 -bottom-4 text-white/20 w-32 h-32" />
           <div className="relative z-10">
             <h2 className="text-4xl font-bold mb-1">{stats.admin}</h2>
             <p className="text-cyan-100 font-medium text-sm">Admin</p>
           </div>
        </div>

        {/* Card 4: User Biasa */}
        <div className="bg-green-500 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30 relative overflow-hidden">
           <UserCheck className="absolute -right-4 -bottom-4 text-white/20 w-32 h-32" />
           <div className="relative z-10">
             <h2 className="text-4xl font-bold mb-1">{stats.user}</h2>
             <p className="text-green-100 font-medium text-sm">User</p>
           </div>
        </div>
      </div>

      {/* --- BAGIAN 2: TABEL PENGGUNA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar Table */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-50/30">
          <div className="flex items-center gap-2 text-blue-800 font-bold">
            <Users size={20} /> Daftar Pengguna Sistem
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau username..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <button 
                onClick={openAdd} 
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
             >
                <Plus size={16} /> Tambah Pengguna
             </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">No</th>
                <th className="px-6 py-4">Foto Profil</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                {/* Header Tampilan tetap "Username", tapi isinya field 'user' */}
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 text-center">Role</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-6 py-4">
                    {/* Kolom Foto Profil */}
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                      {u.foto_profil ? (
                        <img src={`http://localhost:5000/uploads/profiles/${u.foto_profil}`} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                          {u.nama_lengkap?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{u.nama_lengkap}</td>
                  
                  {/* PENTING: Mengambil data dari field 'user' database */}
                  <td className="px-6 py-4 text-gray-500 font-mono">{u.user}</td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      u.role === 'super_admin' ? 'bg-red-50 text-red-600 border-red-100' :
                      u.role === 'admin' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-400">Data pengguna tidak ditemukan.</div>
          )}
        </div>
      </div>

      {/* --- MODAL FORM USER --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field User (Username) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Username</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={form.user} onChange={e => setForm({...form, user: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Lengkap</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Role Akses</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                  value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">User Biasa</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{isEdit ? 'Password Baru (Opsional)' : 'Password'}</label>
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={isEdit ? "Biarkan kosong jika tidak ubah" : "Minimal 6 karakter"}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
                  required={!isEdit} />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-1">
                  <Save size={18} /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}