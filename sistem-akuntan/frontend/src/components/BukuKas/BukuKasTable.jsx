import { Trash2, Eye } from "lucide-react";
import { Table } from "../common/Table";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export const BukuKasTable = ({
  data = [],
  loading = false,
  onDelete,
  onView,
}) => {
  const columns = [
    { key: "no", label: "No" },
    {
      key: "tanggal",
      label: "Tanggal",
      render: (value) => formatDate(value),
    },
    { key: "kode_akun", label: "Kode" },
    { key: "no_bukti", label: "No Bukti" },

    // --- PERBAIKAN DI SINI ---
    {
      key: "uraian",
      label: "Uraian",
      render: (value, row) => {
        // Cek apakah keterangan ada dan tidak kosong (hanya spasi)
        if (row.keterangan && row.keterangan.trim() !== "") {
          return (
            <span>
              {value} -{" "}
              <span className="text-gray-600 italic">{row.keterangan}</span>
            </span>
          );
        }
        // Jika keterangan kosong, tampilkan uraian saja
        return value;
      },
    },
    // -------------------------

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
    {
      key: "saldo",
      label: "Saldo",
      render: (value) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.bukti_nota && (
            <button
              onClick={() => onView(row.bukti_nota)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
              title="Lihat Bukti Nota"
            >
              <Eye size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Hapus Data"
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
