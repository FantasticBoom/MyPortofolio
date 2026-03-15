import { Trash2, Edit2 } from "lucide-react";
import { Table } from "../Common/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export const KartuStockTable = ({
  data = [],
  loading = false,
  onDelete,
  onEdit,
}) => {
  const columns = [
    { key: "no", label: "No" },
    { key: "tanggal", label: "Tanggal", render: (value) => formatDate(value) },
    { key: "stock_awal", label: "Stock Awal" },
    { key: "masuk", label: "Masuk" },
    { key: "keluar", label: "Keluar" },
    {
      key: "stock_akhir",
      label: "Stock Akhir",
      render: (value) => (
        <span className="font-semibold text-blue-600">{value}</span>
      ),
    },
    {
      key: "harga_satuan",
      label: "Harga Satuan",
      render: (value) => formatCurrency(value),
    },
    {
      key: "nilai_persediaan",
      label: "Nilai Persediaan",
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    { key: "keterangan", label: "Keterangan" },
    {
      key: "aksi",
      label: "Aksi",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const dataWithNo = (data || []).map((item, idx) => ({
    ...item,
    no: idx + 1,
  }));

  return (
    <Table
      columns={columns}
      data={dataWithNo}
      loading={loading}
      isEmpty={data.length === 0}
    />
  );
};
