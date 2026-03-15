import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Plus, Edit, Trash2, X, Save } from 'lucide-react';

export default function ManajemenBagian() {
  const [bagian, setBagian] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nama_bagian: '', kode_bagian: '' });
  const [isEdit, setIsEdit] = useState(false);

  const fetchBagian = async () => {
    const res = await api.get('/master/bagian');
    setBagian(res.data);
  };
  useEffect(() => { fetchBagian(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/master/bagian/${form.id}`, form);
      else await api.post('/master/bagian', form);
      setIsModalOpen(false); fetchBagian();
    } catch (err) { alert('Gagal menyimpan'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus unit kerja ini?')) {
      await api.delete(`/master/bagian/${id}`); fetchBagian();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">Unit Kerja</h1><p className="text-gray-500 text-sm">Kelola daftar bagian/fakultas</p></div>
        <button onClick={() => { setForm({nama_bagian:'', kode_bagian:''}); setIsEdit(false); setIsModalOpen(true); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex gap-2 shadow-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Tambah Bagian
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-6 py-4">Kode</th><th className="px-6 py-4">Nama Bagian</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {bagian.map(b => (
              <tr key={b.bagian_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-gray-600">{b.kode_bagian}</td>
                <td className="px-6 py-4 font-medium">{b.nama_bagian}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => { setForm({id: b.bagian_id, nama_bagian: b.nama_bagian, kode_bagian: b.kode_bagian}); setIsEdit(true); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(b.bagian_id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-6"><h3 className="text-lg font-bold">{isEdit ? 'Edit Bagian' : 'Tambah Bagian'}</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nama Bagian (cth: Fakultas Teknik)" required className="w-full border rounded-lg px-3 py-2" value={form.nama_bagian} onChange={e => setForm({...form, nama_bagian: e.target.value})} />
              <input type="text" placeholder="Kode Bagian (cth: FT)" required className="w-full border rounded-lg px-3 py-2" value={form.kode_bagian} onChange={e => setForm({...form, kode_bagian: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex justify-center gap-2"><Save size={18}/> Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}