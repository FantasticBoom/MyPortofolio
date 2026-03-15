import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  FileDown,
  CheckCircle,
  X,
  Filter,
} from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { KartuStockTable } from "../components/KartuStock/KartuStockTable";
import { ModalTambahKartuStock } from "../components/KartuStock/ModalTambahKartuStock";
import { FilterKartuStock } from "../components/KartuStock/FilterKartuStock";
import { ModalKonfirmasi } from "../components/common/ModalKonfirmasi";

import kartuStockService from "../services/kartuStockService";
import manajemenService from "../services/manajemenService";
import { formatCurrency } from "../utils/formatCurrency";

// --- IMPORT PDF LIBRARY ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const KartuStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // State Filter Kode
  const [selectedKode, setSelectedKode] = useState("");

  // --- STATE BARU: PERIODE DARI DATABASE ---
  const [periodList, setPeriodList] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  // State Notifikasi & Modal Delete
  const [notification, setNotification] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // 1. Fetch Data Periode saat halaman dimuat
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await manajemenService.getPeriods();
        if (res.success && res.data.length > 0) {
          setPeriodList(res.data);
          // Opsional: Otomatis pilih periode paling baru (index 0)
          setSelectedPeriodId(res.data[0].id);
        }
      } catch (err) {
        console.error("Gagal memuat periode:", err);
      }
    };
    fetchPeriods();
  }, []);

  // 2. Fetch Data Kartu Stock saat Kode dipilih
  useEffect(() => {
    if (selectedKode) {
      fetchData();
    } else {
      setData([]);
    }
  }, [selectedKode]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchData = async () => {
    if (!selectedKode) return;

    try {
      setLoading(true);
      setError(null);
      const result = await kartuStockService.getByKode(selectedKode);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal memuat data kartu stock");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD HANDLERS ---
  const handleAddKartuStock = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        stock_awal: parseInt(formData.stock_awal) || 0,
        masuk: parseInt(formData.masuk) || 0,
        keluar: parseInt(formData.keluar) || 0,
        harga_satuan: parseFloat(formData.harga_satuan) || 0,
      };

      let result;
      if (editingId) {
        result = await kartuStockService.update(editingId, payload);
      } else {
        result = await kartuStockService.create(payload);
      }

      if (result.success) {
        setShowModal(false);
        setEditingId(null);
        setEditingData(null);
        await fetchData();
        showNotification(
          editingId ? "Data berhasil diupdate!" : "Data berhasil disimpan!"
        );
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal menyimpan data");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditKartuStock = async (id) => {
    try {
      const result = await kartuStockService.getById(id);
      if (result.success) {
        setEditingId(id);
        setEditingData(result.data);
        setShowModal(true);
      }
    } catch (err) {
      setError("Gagal memuat data untuk diedit");
      console.error(err);
    }
  };

  const onTriggerDelete = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const result = await kartuStockService.delete(deleteId);
      if (result.success) {
        await fetchData();
        showNotification("Data berhasil dihapus!", "success");
        setDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        showNotification(result.message || "Gagal menghapus", "error");
      }
    } catch (err) {
      showNotification("Terjadi kesalahan sistem", "error");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- LOGIKA FILTERING ---
  const currentPeriod = useMemo(() => {
    if (!selectedPeriodId) return null;
    return periodList.find((p) => String(p.id) === String(selectedPeriodId));
  }, [periodList, selectedPeriodId]);

  const filteredData = useMemo(() => {
    if (!currentPeriod) return data;

    return data.filter((item) => {
      const itemDate = new Date(item.tanggal);
      const startDate = new Date(currentPeriod.start_date);
      const endDate = new Date(currentPeriod.end_date);

      itemDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [data, currentPeriod]);

  // --- CALCULATE SUMMARY ---
  const summary = filteredData.reduce(
    (acc, item) => ({
      totalMasuk: acc.totalMasuk + (parseFloat(item.masuk) || 0),
      totalKeluar: acc.totalKeluar + (parseFloat(item.keluar) || 0),
      totalNilai: acc.totalNilai + (parseFloat(item.nilai_persediaan) || 0),
    }),
    { totalMasuk: 0, totalKeluar: 0, totalNilai: 0 }
  );

  // --- EXPORT PDF FUNCTION (UPDATED) ---
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF("l", "mm", "a4");

      // 1. Sort A-Z
      const sortedDataForPDF = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateA - dateB || a.id - b.id;
      });

      const itemInfo = sortedDataForPDF.length > 0 ? sortedDataForPDF[0] : {};
      const namaBahan = itemInfo.nama_barang || "Nama Barang Tidak Tersedia";
      const satuan = itemInfo.satuan_barang || "-";

      // 2. Logic Format Tanggal Periode (Indonesia)
      const formatDateIndo = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      };

      let periodeText = "Semua Waktu";
      let fileNamePeriode = "All";

      if (currentPeriod) {
        // Format: 10 November 2025 s.d 22 November 2025
        const start = formatDateIndo(currentPeriod.start_date);
        const end = formatDateIndo(currentPeriod.end_date);
        periodeText = `${start} s.d ${end}`;
        
        // Untuk nama file (hapus spasi agar aman)
        fileNamePeriode = currentPeriod.nama_periode.replace(/\s+/g, "-");
      }

      // --- HEADER PDF ---
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("KARTU STOK", 148.5, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      const startY = 25;
      const lineHeight = 6;

      // Baris 1: Nama Bahan
      doc.text(`Nama Bahan`, 14, startY);
      doc.text(`: ${namaBahan}`, 50, startY);

      // Baris 2: Kode Akun
      doc.text(`Kode Akun`, 14, startY + lineHeight);
      doc.text(`: ${selectedKode}`, 50, startY + lineHeight);

      // Baris 3: Satuan
      doc.text(`Satuan`, 14, startY + lineHeight * 2);
      doc.text(`: ${satuan}`, 50, startY + lineHeight * 2);

      // Baris 4: Periode (Dipindah ke bawah Satuan)
      doc.text(`Periode`, 14, startY + lineHeight * 3);
      doc.text(`: ${periodeText}`, 50, startY + lineHeight * 3);

      // --- TABLE ---
      const tableBody = sortedDataForPDF.map((item, index) => {
        const stockAwal = parseInt(item.stock_awal) || 0;
        const masuk = parseInt(item.masuk) || 0;
        const keluar = parseInt(item.keluar) || 0;
        const stokAkhir = stockAwal + masuk - keluar;
        const hargaSatuan = parseFloat(item.harga_satuan) || 0;
        const nilaiPersediaan = stokAkhir * hargaSatuan;

        return [
          index + 1,
          new Date(item.tanggal).toLocaleDateString("id-ID"),
          stockAwal,
          masuk === 0 ? "" : masuk,
          keluar === 0 ? "" : keluar,
          stokAkhir,
          `Rp ${hargaSatuan.toLocaleString("id-ID")}`,
          `Rp ${nilaiPersediaan.toLocaleString("id-ID")}`,
          item.keterangan || "",
        ];
      });

      autoTable(doc, {
        startY: 60, // Diturunkan karena header bertambah 1 baris
        head: [
          [
            "No.",
            "Tanggal",
            "Stock Awal",
            "Masuk",
            "Keluar",
            "Stok Akhir",
            "Harga Satuan",
            "Nilai Persediaan",
            "Keterangan",
          ],
        ],
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2,
          valign: "middle",
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "center", cellWidth: 25 },
          2: { halign: "center", cellWidth: 20 },
          3: { halign: "center", cellWidth: 20 },
          4: { halign: "center", cellWidth: 20 },
          5: { halign: "center", cellWidth: 20 },
          6: { halign: "right", cellWidth: 35 },
          7: { halign: "right", cellWidth: 40 },
          8: { halign: "left" },
        },
      });

      const fileName = `Kartu-Stok-${selectedKode}-${fileNamePeriode}.pdf`;
      doc.save(fileName);
      showNotification("PDF berhasil diunduh!");
    } catch (err) {
      console.error("Error creating PDF:", err);
      showNotification("Gagal membuat PDF", "error");
    }
  };

  return (
    <MainLayout>
      {notification && (
        <div className="fixed top-5 right-5 z-[100] animate-fade-in-down">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <X size={20} />
            )}
            <span className="font-semibold">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <ModalKonfirmasi
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Stock"
        message="Apakah Anda yakin? Stok akhir akan dikalkulasi ulang."
        confirmLabel="Ya, Hapus"
        isLoading={isDeleting}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kartu Stock</h1>
            <p className="text-gray-600">
              Pencatatan keluar masuk barang berdasarkan kode
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setEditingData(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus size={20} /> Tambah Data
          </button>
        </div>

        {error && (
          <Card className="bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <FilterKartuStock
              selectedKode={selectedKode}
              onChange={setSelectedKode}
              loading={loading}
            />

            {selectedKode && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-300 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-600" />
                  <label className="text-sm font-semibold text-gray-700">
                    Periode:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPeriodId}
                      onChange={(e) => setSelectedPeriodId(e.target.value)}
                      className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px] cursor-pointer"
                    >
                      <option value="">-- Pilih Periode --</option>
                      {periodList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama_periode}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExportPDF}
                  disabled={filteredData.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Export ke PDF"
                >
                  <FileDown size={18} />
                  Export PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={fetchData}
            disabled={!selectedKode}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </Card>

        {selectedKode && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Total Masuk</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.totalMasuk}
                </p>
              </Card>

              <Card className="bg-orange-50 border border-orange-200">
                <p className="text-sm text-gray-600 mb-2">Total Keluar</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.totalKeluar}
                </p>
              </Card>

              <Card className="bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Total Nilai</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalNilai)}
                </p>
              </Card>
            </div>

            <Card>
              <h2 className="text-lg font-semibold mb-4">
                Kartu Stock:{" "}
                <span className="text-blue-600">{selectedKode}</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Periode Aktif:{" "}
                <strong>
                  {currentPeriod ? currentPeriod.nama_periode : "Semua Data"}
                </strong>
              </p>

              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="overflow-x-auto">
                  <KartuStockTable
                    data={filteredData}
                    loading={loading}
                    onDelete={onTriggerDelete}
                    onEdit={handleEditKartuStock}
                  />
                  {filteredData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada data transaksi pada periode ini.
                    </div>
                  )}
                </div>
              )}
            </Card>
          </>
        )}

        {!selectedKode && (
          <Card>
            <div className="text-center py-12 text-gray-500 flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <RefreshCw size={32} className="text-gray-400" />
              </div>
              <p>
                Silakan pilih <strong>Kode Barang</strong> pada filter di atas
                untuk melihat data.
              </p>
            </div>
          </Card>
        )}
      </div>

      {showModal && (
        <ModalTambahKartuStock
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setEditingData(null);
          }}
          onSubmit={handleAddKartuStock}
          isLoading={submitting}
          initialData={editingData}
        />
      )}
    </MainLayout>
  );
};