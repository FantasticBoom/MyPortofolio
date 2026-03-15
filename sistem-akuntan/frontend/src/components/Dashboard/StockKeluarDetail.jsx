import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { Card } from "../common/Card"; // Sesuaikan path import Card Anda
import { Table } from "../common/Table"; // Sesuaikan path import Table Anda
import { formatDate } from "../../utils/formatDate"; // Sesuaikan path utils
import dashboardService from "../../services/dashboardService";

export const StockKeluarDetail = ({ onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetailData();
  }, []);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getStockOutDetails();
      if (result.success) {
        setData(result.data);
      } else {
        setError("Gagal memuat data");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "no", label: "No" },
    { key: "tanggal", label: "Tanggal", render: (val) => formatDate(val) },
    { key: "nama_barang", label: "Nama Barang" },
    {
      key: "jumlah_keluar",
      label: "Jumlah Keluar",
      render: (val, row) => (
        <span className="font-semibold text-red-600">
          {val} {row.satuan || "Unit"}
        </span>
      ),
    },
    { key: "keterangan", label: "Keterangan" },
  ];

  const dataWithNo = data.map((item, idx) => ({ ...item, no: idx + 1 }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Detail Stock Keluar Kemarin
              </h2>
              <p className="text-sm text-gray-500">
                Daftar barang yang keluar pada tanggal kemarin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          {data.length === 0 && !loading ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada barang keluar kemarin.
            </div>
          ) : (
            <Table columns={columns} data={dataWithNo} loading={loading} />
          )}
        </div>
      </Card>
    </div>
  );
};
