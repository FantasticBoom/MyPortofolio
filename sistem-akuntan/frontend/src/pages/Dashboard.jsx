import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { SisaSaldoCard } from "../components/Dashboard/SisaSaldoCard";
import { StockKeluarCard } from "../components/Dashboard/StockKeluarCard";
import { GraphDanaPengajuan } from "../components/Dashboard/GraphDanaPengajuan";
import { PeringatanStock } from "../components/Dashboard/PeringatanStock";
import { SisaSaldoDetail } from "../components/Dashboard/SisaSaldoDetail";
import { StockKeluarDetail } from "../components/Dashboard/StockKeluarDetail";

import { useDashboard } from "../hooks/useDashboard";
import { formatCurrency } from "../utils/formatCurrency";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { summary, graphData, stockWarnings, loading, error, refresh } =
    useDashboard();

  const [showSisaSaldoDetail, setShowSisaSaldoDetail] = useState(false);

  const [showStockKeluarDetail, setShowStockKeluarDetail] = useState(false);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Card className="bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SisaSaldoCard
            sisaSaldo={summary?.sisaSaldo || 0}
            onClick={() => setShowSisaSaldoDetail(true)}
          />

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Dana Yang diterima
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalPemasukan || 0)}
                </p>
              </div>
              {/* Icon SVG... */}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Pengeluaran
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.totalPengeluaran || 0)}
                </p>
              </div>
              {/* Icon SVG... */}
            </div>
          </Card>

          {/* UPDATE DISINI: Tambahkan onClick */}
          <StockKeluarCard
            stockKeluar={summary?.stockKeluarKemarin || 0}
            onClick={() => setShowStockKeluarDetail(true)}
          />
        </div>

        {/* Graph */}
        <GraphDanaPengajuan data={graphData} />

        {/* Peringatan Stock */}
        <PeringatanStock data={stockWarnings} loading={false} />
      </div>

      {/* Modal Sisa Saldo Detail */}
      {showSisaSaldoDetail && (
        <SisaSaldoDetail onClose={() => setShowSisaSaldoDetail(false)} />
      )}

      {/* Modal Stock Keluar Detail */}
      {showStockKeluarDetail && (
        <StockKeluarDetail onClose={() => setShowStockKeluarDetail(false)} />
      )}
    </MainLayout>
  );
};
