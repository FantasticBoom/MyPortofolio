import { useState, useEffect } from "react";
import { Plus, RefreshCw, FileDown, CheckCircle, X } from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/Common/Card";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { BukuKasTable } from "../components/BukuKas/BukuKasTable";
import { ModalTambahBukuKas } from "../components/BukuKas/ModalTambahBukuKas";
import { FilterBukuKas } from "../components/BukuKas/FilterBukuKas";
import { ModalKonfirmasi } from "../components/Common/ModalKonfirmasi"; // Pastikan path import ini benar
import bukuKasService from "../services/bukuKasService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const BukuKas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State untuk Modal Konfirmasi
  const [deleteId, setDeleteId] = useState(null); // Menyimpan ID yang akan dihapus

  const [notification, setNotification] = useState(null);

  // State Periods
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
      setData([]);
      setLoading(false);
    }
  }, [selectedPeriodId]);

  const fetchPeriods = async () => {
    try {
      const result = await bukuKasService.getPeriods();
      if (result.success && result.data.length > 0) {
        setPeriods(result.data);
        setSelectedPeriodId(result.data[0].id.toString());
      }
    } catch (err) {
      console.error("Gagal memuat periode:", err);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedPeriodId) {
        setData([]);
        setLoading(false);
        return;
      }

      const result = await bukuKasService.getAll(selectedPeriodId);

      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError("Gagal memuat data buku kas");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBukuKas = async (formData) => {
    try {
      setSubmitting(true);
      const result = await bukuKasService.create(formData);

      if (result.success) {
        setShowModal(false);
        showNotification("Data transaksi berhasil disimpan!");
        await fetchData();
      } else {
        showNotification(result.message || "Gagal menyimpan data", "error");
      }
    } catch (err) {
      showNotification("Gagal menyimpan data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIKA HAPUS DATA ---

  // 1. Fungsi ini dipanggil saat tombol hapus di tabel diklik
  const handleClickDelete = (id) => {
    setDeleteId(id); // Simpan ID
    setShowDeleteModal(true); // Buka Modal Konfirmasi
  };

  // 2. Fungsi ini dipanggil saat user menekan "Hapus" di Modal Konfirmasi
  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setSubmitting(true); // Pakai loading state yang ada atau buat baru
      const result = await bukuKasService.delete(deleteId);

      if (result.success) {
        showNotification("Data transaksi berhasil dihapus!");
        await fetchData();
      } else {
        showNotification(result.message || "Gagal menghapus data", "error");
      }
    } catch (err) {
      showNotification("Gagal menghapus data", "error");
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false); // Tutup modal
      setDeleteId(null); // Reset ID
    }
  };

  // -------------------------

  const handleViewBuktiNota = (fileName) => {
    if (!fileName) return;
    // Sesuaikan URL base ini dengan setup backend Anda
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    const fileUrl = `${baseUrl}/uploads/${fileName}`;
    window.open(fileUrl, "_blank");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Ambil data periode saat ini
      const currentPeriodData = periods.find(
        (p) => p.id.toString() === selectedPeriodId
      );

      // Format Rentang Periode
      let periodeText = "";
      if (currentPeriodData) {
        const startDate = new Date(currentPeriodData.start_date);
        const endDate = new Date(currentPeriodData.end_date);
        const options = { day: "2-digit", month: "long", year: "numeric" };
        periodeText = `${startDate.toLocaleDateString(
          "id-ID",
          options
        )} s.d ${endDate.toLocaleDateString("id-ID", options)}`;
      }

      // --- 1. JUDUL & PERIODE (Tengah) ---
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BUKU KAS UMUM", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${periodeText}`, 105, 22, { align: "center" });

      // --- 2. INFORMASI SPPG (Kiri Atas) ---
      // Koordinat awal
      let infoY = 35;
      const lineHeight = 6;
      const leftMargin = 14;
      const labelWidth = 35; // Lebar area label sebelum titik dua

      doc.setFontSize(10);

      const infoData = [
        { label: "Nama SPPG", value: ": Pendidikan Gani Nusantara" },
        { label: "Kelurahan/Desa", value: ": 16 Ulu" },
        { label: "Kecamatan", value: ": Seberang Ulu 2" },
        { label: "Kabupaten/Kota", value: ": Palembang" },
        { label: "Provinsi", value: ": Sumatera Selatan" },
      ];

      infoData.forEach((item) => {
        doc.text(item.label, leftMargin, infoY);
        doc.text(item.value, leftMargin + labelWidth, infoY);
        infoY += lineHeight;
      });

      // --- 3. TABEL DATA ---
      let runningBalance = 0;
      const sortedData = [...data].sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
      );

      const tableData = sortedData.map((item, index) => {
        const debit = parseFloat(item.pemasukan) || 0;
        const kredit = parseFloat(item.pengeluaran) || 0;
        runningBalance = runningBalance + debit - kredit;

        return [
          index + 1,
          new Date(item.tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "2-digit", // Format 10-Nov-25
          }),
          item.kode_akun || "-",
          item.no_bukti || "-",
          item.uraian || "-",
          debit > 0 ? `Rp ${debit.toLocaleString("id-ID")}` : "-",
          kredit > 0 ? `Rp ${kredit.toLocaleString("id-ID")}` : "-",
          `Rp ${runningBalance.toLocaleString("id-ID")}`,
        ];
      });

      autoTable(doc, {
        startY: infoY + 5, // Mulai setelah bagian Informasi SPPG
        head: [
          [
            "No",
            "Tanggal",
            "Kode",
            "No. Bukti",
            "Uraian",
            "Pemasukan (Debet)",
            "Pengeluaran (Kredit)",
            "Saldo",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: "middle",
        },
        headStyles: {
          fillColor: [255, 255, 255], // Header putih (sesuai gambar biasanya plain) atau biarkan default
          textColor: [0, 0, 0],
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: "center",
          fontStyle: "bold",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 }, // No
          1: { halign: "center", cellWidth: 20 }, // Tanggal
          2: { halign: "center", cellWidth: 15 }, // Kode
          3: { halign: "center", cellWidth: 15 }, // No Bukti
          5: { halign: "right" }, // Debet
          6: { halign: "right" }, // Kredit
          7: { halign: "right" }, // Saldo
        },
        didParseCell: function (data) {
          // Opsional: Untuk memastikan border hitam disemua sel seperti gambar
          data.cell.styles.lineColor = [0, 0, 0];
          data.cell.styles.lineWidth = 0.1;
        },
      });

      // --- 4. TANDA TANGAN (Footer) ---
      // Ambil posisi Y terakhir setelah tabel selesai
      let finalY = doc.lastAutoTable.finalY + 15;

      // Cek apakah halaman cukup, jika tidak tambah halaman baru
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      const currentDate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Kiri (Mengetahui)
      const leftSignX = 14;
      doc.text("Mengetahui,", leftSignX, finalY);
      doc.text("Kepala SPPG Seberang Ulu 2", leftSignX, finalY + 5);

      doc.text("(M. Alfaridzi Swardana, S.T)", leftSignX, finalY + 35); // Nama Kiri

      // Kanan (Pembuat)
      const rightSignX = 140;
      doc.text(`Palembang, ${currentDate}`, rightSignX, finalY); // Tanggal dinamis
      doc.text("Akuntan SPPG Seberang ulu 2", rightSignX, finalY + 5);

      doc.text("(Mei Sari, S.Ak)", rightSignX, finalY + 35); // Nama Kanan

      // --- 5. CATATAN PENTING ---
      let noteY = finalY + 45; // Di bawah tanda tangan

      // Cek page break lagi
      if (noteY > 270) {
        doc.addPage();
        noteY = 20;
      }

      doc.setFont("helvetica", "normal");
      doc.text("Catatan Penting:", 14, noteY);
      doc.text(
        "1. Seluruh transaksi uang keluar dan masuk wajib dicatat pada BKU.",
        14,
        noteY + 5
      );
      doc.text(
        "2. Pencatatan secara tertib dengan mengikuti kronologis waktu/kejadian transaksi dan secara harian.",
        14,
        noteY + 10
      );
      doc.text(
        "3. Periode adalah periode operasional dapur SPPG selama 2 pekan/minggu.",
        14,
        noteY + 15
      );

      // Simpan File
      const periodName = currentPeriodData?.nama_periode || "Unknown";
      doc.save(`Buku-Kas-${periodName}.pdf`);
      showNotification("PDF Berhasil diunduh!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      showNotification("Gagal membuat PDF", "error");
    }
  };

  const getSelectedPeriodData = () => {
    if (!selectedPeriodId || !periods.length) return null;
    return periods.find((p) => p.id.toString() === selectedPeriodId);
  };

  return (
    <MainLayout>
      {/* Notifikasi Floating */}
      {notification && (
        <div className="fixed top-5 right-5 z-[70] animate-fade-in-down">
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

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buku Kas</h1>
            <p className="text-gray-600">
              Pencatatan pemasukan dan pengeluaran kas
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            disabled={!selectedPeriodId}
          >
            <Plus size={20} />
            Tambah Transaksi
          </button>
        </div>

        {error && (
          <Card className="bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="flex items-center justify-between flex-wrap gap-4">
          <FilterBukuKas
            selectedPeriodId={selectedPeriodId}
            onChange={setSelectedPeriodId}
            periods={periods}
          />
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              disabled={loading || data.length === 0}
            >
              <FileDown size={18} />
              Export PDF
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              disabled={!selectedPeriodId}
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Daftar Transaksi Kas</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedPeriodId
              ? `Menampilkan transaksi untuk ${
                  getSelectedPeriodData()?.nama_periode || "periode terpilih"
                }`
              : "Pilih periode untuk menampilkan transaksi"}
          </p>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <BukuKasTable
                data={data}
                loading={loading}
                onDelete={handleClickDelete} // Menggunakan handler baru
                onView={handleViewBuktiNota}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Modal Tambah Data */}
      {showModal && (
        <ModalTambahBukuKas
          onClose={() => setShowModal(false)}
          onSubmit={handleAddBukuKas}
          isLoading={submitting}
          selectedPeriod={getSelectedPeriodData()}
        />
      )}

      {/* Modal Konfirmasi Hapus (Custom) */}
      <ModalKonfirmasi
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus data transaksi ini? Data yang dihapus tidak dapat dikembalikan."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isLoading={submitting}
      />
    </MainLayout>
  );
};
