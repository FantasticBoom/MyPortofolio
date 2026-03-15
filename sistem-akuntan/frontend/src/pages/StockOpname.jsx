import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle,
  Calendar, // Icon Calendar untuk filter
} from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { StockOpnameTable } from "../components/StockOpname/StockOpnameTable";
import { ModalTambahStockOpname } from "../components/StockOpname/ModalTambahStockOpname";
import { ModalKonfirmasi } from "../components/common/ModalKonfirmasi";
import stockOpnameService from "../services/stockOpnameService";
import bukuKasService from "../services/bukuKasService"; // Import ini untuk ambil data periode
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate"; // Pastikan punya util ini

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const StockOpname = () => {
  // --- State Data ---
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- State Notifikasi Sukses (Toast) ---
  const [successMessage, setSuccessMessage] = useState(null);

  // --- State Modal Form (Tambah/Edit) ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // --- State Modal Hapus ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- State Filter Periode (PENGGANTI BULAN/TAHUN) ---
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  // 1. Fetch Periods saat pertama kali load
  useEffect(() => {
    fetchPeriods();
  }, []);

  // 2. Fetch Data saat selectedPeriodId berubah
  useEffect(() => {
    if (selectedPeriodId) {
      fetchData();
    } else {
      // Reset data jika tidak ada periode dipilih
      setData([]);
      setSummary(null);
      setLoading(false);
    }
  }, [selectedPeriodId]);

  // Fungsi Helper Notifikasi
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Helper untuk mendapatkan objek periode yang sedang dipilih
  const getSelectedPeriodData = () => {
    return periods.find((p) => p.id == selectedPeriodId);
  };

  // --- API CALLS ---

  const fetchPeriods = async () => {
    try {
      // Kita gunakan service bukuKas atau buat service baru untuk getPeriods
      const result = await bukuKasService.getPeriods();
      if (result.success && result.data.length > 0) {
        setPeriods(result.data);
        // Otomatis pilih periode terbaru (index 0)
        setSelectedPeriodId(result.data[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat periode:", err);
      setError("Gagal memuat data periode");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Panggil API dengan parameter period_id
      // Pastikan stockOpnameService.getAll sudah dimodifikasi untuk menerima { period_id }
      const [resultAll, resultSummary] = await Promise.all([
        stockOpnameService.getAll({ period_id: selectedPeriodId }),
        stockOpnameService.getSummary({ period_id: selectedPeriodId }), // Kirim period_id juga untuk summary
      ]);

      if (resultAll.success) setData(resultAll.data);
      if (resultSummary.success) setSummary(resultSummary.data);
    } catch (err) {
      setError("Gagal memuat data stock opname");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockOpname = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        stock_fisik: parseInt(formData.stock_fisik),
        stock_kartu: parseInt(formData.stock_kartu),
        harga_satuan: parseFloat(formData.harga_satuan) || 0,
        period_id: selectedPeriodId, // Tambahkan ID periode saat create
      };

      let result;
      if (editingId) {
        result = await stockOpnameService.update(editingId, payload);
      } else {
        result = await stockOpnameService.create(payload);
      }

      if (result.success) {
        setShowModal(false);
        setEditingId(null);
        setEditingData(null);
        await fetchData();
        showSuccess(
          editingId ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!"
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStockOpname = async (id) => {
    try {
      const result = await stockOpnameService.getById(id);
      if (result.success) {
        setEditingId(id);
        setEditingData(result.data);
        setShowModal(true);
      }
    } catch (err) {
      setError("Gagal memuat data edit");
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteExecute = async () => {
    try {
      const result = await stockOpnameService.delete(deleteId);
      if (result.success) {
        await fetchData();
        setShowDeleteModal(false);
        setDeleteId(null);
        showSuccess("Data berhasil dihapus!");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal menghapus data");
    }
  };

  // Export PDF Logic
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const currentPeriod = getSelectedPeriodData();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN STOCK OPNAME", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const leftMargin = 14;
      let yPos = 30;

      const headerDetails = [
        { label: "Nama SPPG", value: ": Seberang Ulu 2" },
        { label: "Kelurahan/Desa", value: ": 16 Ulu" },
        { label: "Kecamatan", value: ": Seberang Ulu 2" },
        { label: "Kabupaten/kota", value: ": Palembang" },
        { label: "Provinsi", value: ": Sumatera Selatan" },
      ];

      headerDetails.forEach((item) => {
        doc.text(item.label, leftMargin, yPos);
        doc.text(item.value, leftMargin + 35, yPos);
        yPos += 6;
      });

      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Periode Laporan", leftMargin, yPos);

      // --- BAGIAN INI YANG DIPERBAIKI ---
      let periodeLabel = ": -";

      if (currentPeriod) {
        // Opsi format tanggal: "15 Desember 2025"
        const dateOptions = { day: "numeric", month: "long", year: "numeric" };

        // Pastikan konversi ke object Date berhasil
        const startDate = new Date(currentPeriod.start_date);
        const endDate = new Date(currentPeriod.end_date);

        const start = startDate.toLocaleDateString("id-ID", dateOptions);
        const end = endDate.toLocaleDateString("id-ID", dateOptions);

        // Hasil: ": 15 Desember 2025 s.d 29 Desember 2025"
        periodeLabel = `: ${start} s.d ${end}`;
      }

      doc.text(periodeLabel, leftMargin + 35, yPos);
      // -----------------------------------

      const tableColumn = [
        "No.",
        "Nama Bahan",
        "Satuan",
        "Stok Fisik",
        "Stok di Kartu",
        "Selisih",
        "Harga Satuan",
        "Total",
        "Keterangan",
      ];
      const tableRows = [];

      data.forEach((item, index) => {
        const rowData = [
          index + 1,
          item.nama_item,
          item.satuan,
          item.stock_fisik,
          item.stock_kartu,
          item.selisih,
          formatCurrency(item.harga_satuan),
          formatCurrency(item.total),
          item.keterangan || "",
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos + 10,
        theme: "grid",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        styles: {
          fontSize: 8,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
        },
      });

      const finalY = (doc.lastAutoTable?.finalY || yPos + 10) + 10;

      doc.text("Mengetahui,", leftMargin + 10, finalY);
      doc.text("Kepala SPPG Seberang Ulu 2", leftMargin, finalY + 5);
      doc.text("( M. Alfaridzi Swardana, S.T )", leftMargin, finalY + 30);

      const rightMargin = 140;
      doc.text(
        `Palembang, ${new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        rightMargin,
        finalY
      );
      doc.text("Akuntan SPPG Seberang ulu 2", rightMargin, finalY + 5);
      doc.text("( Mei Sari, S.Ak )", rightMargin, finalY + 30);

      const fileName = currentPeriod
        ? `Stock_Opname_${currentPeriod.nama_periode}.pdf`
        : "Stock_Opname.pdf";

      doc.save(fileName);
      showSuccess("Laporan PDF berhasil didownload!");
    } catch (error) {
      console.error("Gagal export PDF", error);
      setError("Gagal membuat file PDF");
    }
  };

  return (
    <MainLayout>
      {/* Notifikasi Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 transition-all">
          <CheckCircle size={20} className="text-white" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Opname</h1>
            <p className="text-gray-600">
              Pencocokan antara stock fisik dengan stock di kartu
            </p>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {/* Filter Periode Baru */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-300 shadow-sm">
              <Calendar size={20} className="text-blue-600" />
              <select
                className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer min-w-[200px]"
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
              >
                <option value="" disabled>
                  -- Pilih Periode --
                </option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_periode}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              disabled={!selectedPeriodId || data.length === 0}
            >
              <FileText size={20} />
              Export PDF
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setEditingData(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              disabled={!selectedPeriodId}
            >
              <Plus size={20} />
              Tambah
            </button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {/* Jika belum pilih periode, tampilkan pesan */}
        {!selectedPeriodId ? (
          <Card className="text-center py-10 text-gray-500">
            <p>Silakan pilih periode terlebih dahulu untuk menampilkan data.</p>
          </Card>
        ) : (
          <>
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Total Item</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalItems}
                  </p>
                </Card>
                <Card className="bg-orange-50 border border-orange-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Item dengan Selisih
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summary.itemsWithVariance}
                  </p>
                </Card>
                <Card className="bg-red-50 border border-red-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Total Selisih Qty
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.totalSelisih}
                  </p>
                </Card>
                <Card className="bg-green-50 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Total Nilai Persediaan
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalNilai)}
                  </p>
                </Card>
              </div>
            )}

            {summary && summary.itemsWithVariance > 0 && (
              <Card className="bg-yellow-50 border border-yellow-200 flex gap-3">
                <AlertTriangle
                  className="text-yellow-600 flex-shrink-0"
                  size={24}
                />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">
                    Perhatian: Ada {summary.itemsWithVariance} item dengan
                    selisih stock
                  </p>
                  <p className="text-sm text-yellow-700">
                    Total selisih qty: {summary.totalSelisih} unit.
                  </p>
                </div>
              </Card>
            )}

            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Data Stock Opname</h2>
                <button
                  onClick={fetchData}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100 transition"
                  title="Refresh Data"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="overflow-x-auto">
                  <StockOpnameTable
                    data={data}
                    loading={loading}
                    onDelete={confirmDelete}
                    onEdit={handleEditStockOpname}
                  />
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {showModal && (
        <ModalTambahStockOpname
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setEditingData(null);
          }}
          onSubmit={handleAddStockOpname}
          isLoading={submitting}
          initialData={editingData}
          // Opsional: Kirim data periode ke modal jika tanggal otomatis
          selectedPeriod={getSelectedPeriodData()}
        />
      )}

      <ModalKonfirmasi
        isOpen={showDeleteModal}
        title="Hapus Data Stock Opname"
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDeleteExecute}
        onClose={() => setShowDeleteModal(false)}
        type="danger"
      />
    </MainLayout>
  );
};
