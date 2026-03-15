import { Trash2, Edit2 } from "lucide-react";
import { Table } from "../Common/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { Badge } from "../common/Badge";

export const StockOpnameTable = ({
  data = [],
  loading = false,
  onDelete,
  onEdit,
}) => {
  const columns = [
    { key: "no", label: "No" },
    { key: "nama_item", label: "Nama Bahan" },
    { key: "satuan", label: "Satuan" },
    { key: "stock_fisik", label: "Stock Fisik" },
    { key: "stock_kartu", label: "Stock di Kartu" },
    {
      key: "selisih",
      label: "Selisih",
      render: (value) => (
        <Badge variant={value === 0 ? "gray" : value > 0 ? "green" : "red"}>
          {value > 0 ? "+" : ""}
          {value}
        </Badge>
      ),
    },
    {
      key: "harga_satuan",
      label: "Harga Satuan",
      render: (value) => formatCurrency(value),
    },
    {
      key: "total",
      label: "Total",
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
