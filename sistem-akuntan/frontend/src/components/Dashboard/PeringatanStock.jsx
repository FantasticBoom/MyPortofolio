import { AlertTriangle } from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Table } from "../common/Table";

export const PeringatanStock = ({ data = [], loading = false }) => {
  const columns = [
    { key: "no", label: "No" },
    { key: "nama_barang", label: "Nama Barang" },
    { key: "kategori", label: "Kategori" },
    {
      key: "stock_saat_ini",
      label: "Stock Saat Ini",
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "Kritis" ? "red" : "yellow"}>{value}</Badge>
      ),
    },
  ];

  const dataWithNo = (data || []).map((item, idx) => ({
    ...item,
    no: idx + 1,
  }));

  return (
    <Card className="col-span-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-red-500" />
        <h3 className="text-lg font-semibold">Peringatan Stock Hampir Habis</h3>
      </div>
      <Table
        columns={columns}
        data={dataWithNo}
        loading={loading}
        isEmpty={data.length === 0}
      />
    </Card>
  );
};
