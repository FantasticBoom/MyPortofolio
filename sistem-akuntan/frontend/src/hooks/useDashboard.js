import { useState, useEffect } from "react";
import dashboardService from "../services/dashboardService";

export const useDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [stockWarnings, setStockWarnings] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, graphRes, warningsRes, stockRes] = await Promise.all(
          [
            dashboardService.getSummary(),
            dashboardService.getGraphData(),
            dashboardService.getStockWarnings(),
            dashboardService.getCurrentMonthStock(),
          ]
        );

        setSummary(summaryRes.data);
        setGraphData(graphRes.data || []);
        setStockWarnings(warningsRes.data || []);
        setCurrentStock(stockRes.data?.totalStock || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refresh = async () => {
    await fetchDashboardData();
  };

  return {
    summary,
    graphData,
    stockWarnings,
    currentStock,
    loading,
    error,
    refresh,
  };
};
