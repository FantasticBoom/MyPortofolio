import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileSignature, Plus, Edit, Trash2, X, Save } from 'lucide-react';

export default function ManajemenPejabat() {
  const [pejabat, setPejabat] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nama_pejabat: '', jabatan: '', status: 'Aktif' });
  const [isEdit, setIsEdit] = useState(false);

  const fetchPejabat = async () => {
    const res = await api.get('/master/pejabat');
    setPejabat(res.data);
  };
  useEffect(() => { fetchPejabat(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/master/pejabat/${form.id}`, form);
      else await api.post('/master/pejabat', form);
      setIsModalOpen(false); fetchPejabat();
    } catch (err) { alert('Gagal menyimpan'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus pejabat ini?')) { await api.delete(`/master/pejabat/${id}`); fetchPejabat(); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">Pejabat Penanda Tangan</h1><p className="text-gray-500 text-sm">Kelola daftar pejabat untuk dropdown surat/SK</p></div>
        <button onClick={() => { setForm({nama_pejabat:'', jabatan:'', status:'Aktif'}); setIsEdit(false); setIsModalOpen(true); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex gap-2 shadow-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Tambah Pejabat
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-6 py-4">Nama Pejabat</th><th className="px-6 py-4">Jabatan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {pejabat.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-700">{p.nama_pejabat}</td>
                <td className="px-6 py-4 text-gray-600">{p.jabatan}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setForm(p); setIsEdit(true); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-6"><h3 className="text-lg font-bold">{isEdit ? 'Edit Pejabat' : 'Tambah Pejabat'}</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nama Pejabat (Beserta Gelar)" required className="w-full border rounded-lg px-3 py-2" value={form.nama_pejabat} onChange={e => setForm({...form, nama_pejabat: e.target.value})} />
              <input type="text" placeholder="Jabatan (cth: Rektor)" required className="w-full border rounded-lg px-3 py-2" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} />
              <select className="w-full border rounded-lg px-3 py-2 bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex justify-center gap-2"><Save size={18}/> Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}