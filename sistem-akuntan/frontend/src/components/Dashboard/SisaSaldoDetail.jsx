import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Table } from "../common/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import api from "../../services/api";

export const SisaSaldoDetail = ({ onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Semua Periode");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/buku-kas");

      if (response.data.success) {
        const bukuKasData = response.data.data || [];

        // Calculate totals
        const totalPemasukan = bukuKasData.reduce(
          (sum, item) => sum + (item.pemasukan || 0),
          0
        );
        const totalPengeluaran = bukuKasData.reduce(
          (sum, item) => sum + (item.pengeluaran || 0),
          0
        );
        const sisaSaldo = totalPemasukan - totalPengeluaran;

        setData({
          totalPemasukan,
          totalPengeluaran,
          sisaSaldo,
          transactions: bukuKasData,
        });
      }
    } catch (err) {
      setError("Gagal memuat data sisa saldo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions =
    data?.transactions?.filter((item) => {
      if (!filterType) return true;
      if (filterType === "pemasukan") return item.pemasukan > 0;
      if (filterType === "pengeluaran") return item.pengeluaran > 0;
      return true;
    }) || [];

  const columns = [
    { key: "no", label: "No" },
    { key: "tanggal", label: "Tanggal", render: (value) => formatDate(value) },
    { key: "sumber_dana", label: "Sumber Dana" },
    { key: "keterangan", label: "Keterangan" },
    {
      key: "pemasukan",
      label: "Pemasukan",
      render: (value) =>
        value > 0 ? (
          <span className="text-green-600 font-semibold">
            {formatCurrency(value)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "pengeluaran",
      label: "Pengeluaran",
      render: (value) =>
        value > 0 ? (
          <span className="text-red-600 font-semibold">
            {formatCurrency(value)}
          </span>
        ) : (
          "-"
        ),
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">Sisa Saldo & Sumber Dana</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.totalPemasukan || 0)}
            </p>
          </Card>

          <Card className="bg-red-50 border border-red-200">
            <p className="text-sm text-gray-600 mb-2">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(data?.totalPengeluaran || 0)}
            </p>
          </Card>

          <Card className="bg-blue-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Sisa Saldo</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data?.sisaSaldo || 0)}
            </p>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === null
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType("pemasukan")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === "pemasukan"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType("pengeluaran")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterType === "pengeluaran"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data transaksi
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredTransactions.map((item, idx) => ({
                ...item,
                no: idx + 1,
              }))}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
