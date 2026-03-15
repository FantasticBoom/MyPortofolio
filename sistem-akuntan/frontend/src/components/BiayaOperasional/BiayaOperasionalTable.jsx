import { Trash2, Edit2 } from "lucide-react";
import { Table } from "../common/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { Badge } from "../common/Badge";

// --- PERUBAHAN LABEL DI SINI ---
const JENIS_BIAYA_LABELS = {
  biaya_sewa: "Insentif Mitra", // Label diubah
  biaya_operasional: "Biaya Operasional",
  biaya_bahan_baku: "Biaya Bahan Baku",
};

const JENIS_BIAYA_COLORS = {
  biaya_sewa: "blue",
  biaya_operasional: "green",
  biaya_bahan_baku: "red",
};

export const BiayaOperasionalTable = ({
  data = [],
  loading = false,
  onDelete,
  onEdit,
}) => {
  const columns = [
    { key: "no", label: "No" },
    {
      key: "tanggal",
      label: "Tanggal",
      render: (value) => formatDate(value),
    },
    { key: "kode", label: "Kode" },
    { key: "uraian", label: "Uraian" },
    {
      key: "jenis_biaya",
      label: "Jenis Biaya",
      render: (value) => (
        <Badge variant={JENIS_BIAYA_COLORS[value]}>
          {JENIS_BIAYA_LABELS[value] || value}
        </Badge>
      ),
    },
    { key: "qty", label: "Qty" },
    { key: "satuan", label: "Satuan" },
    {
      key: "harga_satuan",
      label: "Harga Satuan",
      render: (value) => formatCurrency(value),
    },
    {
      key: "nominal",
      label: "Nominal",
      render: (value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
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
