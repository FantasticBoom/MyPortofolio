import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, Search, Clock } from 'lucide-react';

export default function LogAktivitas() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/logs'); // Mengambil data dari endpoint /api/logs
        setLogs(res.data);
      } catch (error) {
        console.error("Gagal ambil logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter Search Client-side
  const filteredLogs = logs.filter(log => 
    log.username?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Laporan Aktivitas User</h1>
        <p className="text-gray-500 text-sm">Memantau aktivitas login dan penggunaan sistem</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari User atau Aktivitas..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Aktivitas</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(log.created_at || log.waktu).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{log.username}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold uppercase">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{log.action}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}