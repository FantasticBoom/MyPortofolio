import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatCurrency";

export const GraphDanaPengajuan = ({ data = [] }) => {
  // Cek jika data kosong
  if (data.length === 0) {
    return (
      <Card className="col-span-full">
        <h3 className="text-lg font-semibold mb-4">
          Dana Pengajuan Per Periode
        </h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p>Belum ada data proposal.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">
          Statistik Dana Proposal & Dana diterima
        </h3>
        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Realisasi Anggaran
        </span>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            <XAxis
              dataKey="periode"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickMargin={10}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickFormatter={(value) => {
                if (value >= 1000000000)
                  return (value / 1000000000).toFixed(1) + "M";
                if (value >= 1000000)
                  return (value / 1000000).toFixed(0) + "Jt";
                return value;
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
              }}
              formatter={(value) => [formatCurrency(value), ""]}
              labelStyle={{
                color: "#374151",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            />

            <Legend verticalAlign="top" height={36} />

            {/* Garis 1: Dana Diajukan */}
            <Line
              type="monotone"
              dataKey="dana_diajukan"
              stroke="#3b82f6" // Biru
              strokeWidth={3}
              activeDot={{ r: 8 }}
              dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
              name="Dana Diajukan"
              animationDuration={1500}
            />

            {/* Garis 2: Dana Diterima */}
            <Line
              type="monotone"
              dataKey="dana_diterima"
              stroke="#10b981" // Hijau
              strokeWidth={3}
              activeDot={{ r: 8 }}
              dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
              name="Dana Diterima (Realisasi)"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
