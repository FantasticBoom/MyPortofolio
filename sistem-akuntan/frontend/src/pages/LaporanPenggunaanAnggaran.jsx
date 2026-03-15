import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  FileDown,
  CheckCircle,
} from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useForm } from "../hooks/useForm";
import penggunaanAnggaranService from "../services/penggunaanAnggaranService";
// Pastikan path utils benar
import { formatCurrency } from "../utils/formatCurrency";
// Pastikan path logo benar
import logoInstansi from "../assets/bgn.png";

// --- LIBRARY PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- HELPER FORMAT TANGGAL INDONESIA ---
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// --- DATA OPSI ITEM ---
const ITEM_OPTIONS = [
  "Biaya Sewa",
  "Biaya Operasional",
  "Biaya Bahan Baku",
  "Biaya Insentif Mitra",
];

export const LaporanPenggunaanAnggaran = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [reportData, setReportData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State Notification & Modal
  const [notification, setNotification] = useState(null); // State notifikasi baru
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State konfirmasi hapus

  // State Modal Form
  const [showRincianModal, setShowRincianModal] = useState(false);
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);

  // State Edit
  const [editingRincian, setEditingRincian] = useState(null);
  const [editingKeterangan, setEditingKeterangan] = useState(null);

  // --- 1. INITIAL LOAD (Master Data) ---
  useEffect(() => {
    fetchPeriods();
  }, []);

  // --- HELPER SHOW NOTIFICATION ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await penggunaanAnggaranService.getPeriods();
      if (result.success) {
        setPeriods(result.data);
      }
    } catch (err) {
      setError("Gagal memuat daftar periode");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE SELECT PERIOD ---
  const handleSelectPeriod = async (period) => {
    setSelectedPeriod(period);
    setError(null);
    setReportData(null);

    try {
      const result = await penggunaanAnggaranService.getByPeriodId(period.id);
      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error("Gagal memuat detail report", err);
    }
  };

  const ensureReportExists = async () => {
    if (reportData) return reportData.main.id;
    const payload = {
      period_id: selectedPeriod.id,
      periode: selectedPeriod.nama_periode,
      tanggal_awal: selectedPeriod.start_date,
      tanggal_akhir: selectedPeriod.end_date,
    };
    const result = await penggunaanAnggaranService.create(payload);
    if (result.success) {
      const newData = await penggunaanAnggaranService.getByPeriodId(
        selectedPeriod.id
      );
      setReportData(newData.data);
      return result.data.id;
    }
    throw new Error("Gagal inisialisasi laporan");
  };

  // --- 3. FORMS & HANDLERS ---
  const rincianForm = useForm(
    { item: "", dana_diajukan: "", dana_terealisasi: "" },
    async (formData) => {
      try {
        setSubmitting(true);
        let parentId;
        if (editingRincian) {
          const result = await penggunaanAnggaranService.updateRincian(
            editingRincian.id,
            formData
          );
          if (result.success) showNotification("Rincian diperbarui!");
        } else {
          parentId = await ensureReportExists();
          const payload = {
            penggunaan_anggaran_id: parentId,
            ...formData,
            dana_diajukan: parseFloat(formData.dana_diajukan) || 0,
            dana_terealisasi: parseFloat(formData.dana_terealisasi) || 0,
          };
          const result = await penggunaanAnggaranService.addRincian(payload);
          if (result.success) showNotification("Rincian ditambahkan!");
        }
        const updated = await penggunaanAnggaranService.getByPeriodId(
          selectedPeriod.id
        );
        setReportData(updated.data);
        closeRincianModal();
      } catch (err) {
        showNotification("Terjadi kesalahan saat menyimpan", "error");
      } finally {
        setSubmitting(false);
      }
    }
  );

  const keteranganForm = useForm(
    { item: "", keterangan: "" },
    async (formData) => {
      try {
        setSubmitting(true);
        let parentId;
        if (editingKeterangan) {
          const result = await penggunaanAnggaranService.updateKeterangan(
            editingKeterangan.id,
            formData
          );
          if (result.success) showNotification("Keterangan diperbarui!");
        } else {
          parentId = await ensureReportExists();
          const payload = {
            penggunaan_anggaran_id: parentId,
            ...formData,
          };
          const result = await penggunaanAnggaranService.addKeterangan(payload);
          if (result.success) showNotification("Keterangan ditambahkan!");
        }
        const updated = await penggunaanAnggaranService.getByPeriodId(
          selectedPeriod.id
        );
        setReportData(updated.data);
        closeKeteranganModal();
      } catch (err) {
        showNotification("Gagal menyimpan keterangan", "error");
      } finally {
        setSubmitting(false);
      }
    }
  );

  // Modal Helpers
  const openAddRincian = () => {
    setEditingRincian(null);
    rincianForm.resetForm();
    setShowRincianModal(true);
  };
  const openEditRincian = (item) => {
    setEditingRincian(item);
    rincianForm.setFormData({
      item: item.item,
      dana_diajukan: item.dana_diajukan,
      dana_terealisasi: item.dana_terealisasi,
    });
    setShowRincianModal(true);
  };
  const closeRincianModal = () => {
    setShowRincianModal(false);
    setEditingRincian(null);
    rincianForm.resetForm();
  };
  const openAddKeterangan = () => {
    setEditingKeterangan(null);
    keteranganForm.resetForm();
    setShowKeteranganModal(true);
  };
  const openEditKeterangan = (item) => {
    setEditingKeterangan(item);
    keteranganForm.setFormData({
      item: item.item,
      keterangan: item.keterangan,
    });
    setShowKeteranganModal(true);
  };
  const closeKeteranganModal = () => {
    setShowKeteranganModal(false);
    setEditingKeterangan(null);
    keteranganForm.resetForm();
  };

  // --- DELETE HANDLERS (MENGGUNAKAN CUSTOM MODAL, BUKAN ALERT) ---
  const promptDeleteRincian = (id) => {
    setDeleteConfirm({ id, type: "rincian" });
  };

  const promptDeleteKeterangan = (id) => {
    setDeleteConfirm({ id, type: "keterangan" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === "rincian") {
        await penggunaanAnggaranService.deleteRincian(deleteConfirm.id);
      } else {
        await penggunaanAnggaranService.deleteKeterangan(deleteConfirm.id);
      }

      // Refresh data
      const updated = await penggunaanAnggaranService.getByPeriodId(
        selectedPeriod.id
      );
      setReportData(updated.data);
      showNotification("Data berhasil dihapus");
    } catch (err) {
      showNotification("Gagal menghapus data", "error");
    } finally {
      setDeleteConfirm(null); // Tutup modal konfirmasi
    }
  };

  // Helpers UI
  const calculateTotal = (items, key) =>
    items?.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0) || 0;

  const getPercentage = (actual, target) => {
    if (!target || target === 0) return 0;
    const pct = (actual / target) * 100;
    return Math.min(100, Math.round(pct));
  };

  // --- 4. EXPORT PDF FUNCTION (SESUAI GAMBAR ACUAN) ---
  const handleExportPDF = () => {
    if (!reportData) return;

    // A4 Portrait
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let currentY = 15;

    // --- 1. LOGO & JUDUL (Center) ---
    // Logo di tengah atas
    const logoSize = 25;
    try {
      doc.addImage(
        logoInstansi,
        "PNG",
        centerX - logoSize / 2,
        currentY,
        logoSize,
        logoSize
      );
    } catch (e) {
      console.warn("Logo tidak dapat dimuat");
    }

    currentY += logoSize + 5;

    // Judul Laporan
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN PENGGUNAAN ANGGARAN", centerX, currentY, {
      align: "center",
    });
    currentY += 5;

    // Nomor Surat
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text("Nomor : 023 /LPA/ SPPGSU2/ XI /2025", centerX, currentY, {
      align: "center",
    });
    currentY += 10;

    // --- 2. PERIODE & IDENTITAS ---
    const tglAwal = formatDate(reportData.main.tanggal_awal);
    const tglAkhir = formatDate(reportData.main.tanggal_akhir);

    doc.setFontSize(10);
    // Periode (Left)
    doc.text(`Periode ${tglAwal} s.d ${tglAkhir}`, 10, currentY);
    currentY += 6;

    // Yang bertanda tangan
    doc.text("Yang bertanda tangan di bawah :", 10, currentY);
    currentY += 6;

    // Identitas Block
    const labelX = 25;
    const colonX = 60;
    const valueX = 62;
    const rowHeight = 5;

    const identities = [
      { label: "Nama", value: "M. Alfaridzi Swardana, S.T" },
      { label: "Jabatan", value: "Kepala Satuan Pelayanan Pemenuhan Gizi" },
      {
        label: "Yayasan/SPPG",
        value: "Pendidikan Gani Nusantara/Seberang Ulu II",
      },
    ];

    identities.forEach((id) => {
      doc.text(id.label, labelX, currentY);
      doc.text(":", colonX, currentY);
      doc.text(id.value, valueX, currentY);
      currentY += rowHeight;
    });
    currentY += 5;

    // Pengantar
    doc.text(
      "Dengan ini menyampaikan Laporan pengguna dana sebagai berikut :",
      10,
      currentY
    );
    currentY += 8;

    // --- 3. BAGIAN I: RINCIAN KEUANGAN ---
    doc.setFont("times", "bold");
    doc.text("I. RINCIAN KEUANGAN", 10, currentY);
    currentY += 2;

    const table1Body = reportData.rincian.map((item) => [
      item.item, // Item name
      ":",
      item.dana_diajukan > 0
        ? `Rp. ${parseInt(item.dana_diajukan).toLocaleString("id-ID")}`
        : "",
      `Rp. ${parseInt(item.dana_terealisasi).toLocaleString("id-ID")}`,
      `Rp. ${parseInt(item.sisa_dana).toLocaleString("id-ID")}`,
    ]);

    const totalDiajukan = calculateTotal(reportData.rincian, "dana_diajukan");
    const totalTerealisasi = calculateTotal(
      reportData.rincian,
      "dana_terealisasi"
    );
    const totalSisa = calculateTotal(reportData.rincian, "sisa_dana");

    autoTable(doc, {
      startY: currentY,
      margin: { left: 10, right: 20 },
      head: [
        [
          { content: "", styles: { halign: "left" } },
          { content: "", styles: { halign: "left" } },
          { content: "Dana Diajukan (Rp)", styles: { halign: "left" } },
          { content: "Dana Terealisasi (Rp)", styles: { halign: "left" } },
          { content: "Sisa Dana (Rp)", styles: { halign: "left" } },
        ],
      ],
      body: table1Body,
      foot: [
        [
          "Total",
          ":",
          `Rp. ${totalDiajukan.toLocaleString("id-ID")}`,
          `Rp. ${totalTerealisasi.toLocaleString("id-ID")}`,
          `Rp. ${totalSisa.toLocaleString("id-ID")}`,
        ],
      ],
      theme: "plain",
      styles: { font: "times", fontSize: 10, cellPadding: 1 },
      headStyles: { fontStyle: "normal", textColor: [0, 0, 0] },
      footStyles: { fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 5 },
        2: { cellWidth: 40, halign: "left" },
        3: { cellWidth: 40, halign: "left" },
        4: { cellWidth: 40, halign: "left" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // --- 4. BAGIAN II: KETERANGAN ---
    doc.setFont("times", "bold");
    doc.text("II. KETERANGAN", 10, currentY);
    currentY += 5;

    doc.setFont("times", "normal");
    const textKeterangan =
      "Dana yang telah digunakan sesuai dengan kebutuhan kegiatan yang telah direncanakan, dengan rincian sebagai berikut :";
    const splitText = doc.splitTextToSize(textKeterangan, pageWidth - 40);
    doc.text(splitText, 10, currentY);
    currentY += splitText.length * 5 + 3;

    const table2Body = reportData.keterangan.map((item) => [
      item.item,
      ":",
      item.keterangan,
    ]);

    // Hardcode Virtual Account sesuai gambar
    table2Body.push(["Virtual Account/No. rekening", ":", "8102500300381"]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: 10 },
      body: table2Body,
      theme: "plain",
      styles: { font: "times", fontSize: 10, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 5 },
        2: { cellWidth: "auto" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // --- 5. FOOTER (Sisa Dana) - UPDATE: CENTER ALIGN ---
    doc.setFont("times", "normal");

    // Baris 1: Sisa dana (CENTER)
    doc.text(
      `Sisa dana sebesar Rp. ${totalSisa.toLocaleString(
        "id-ID"
      )} Akan dialihkan ke periode selanjutnya.`,
      centerX,
      currentY,
      { align: "center" }
    );

    currentY += 5;

    // Baris 2: Pengalihan (CENTER)
    const footerText2 =
      "Pengalihan sisa dana ini bertujuan untuk mendukung kegiatan yang telah direncanakan pada Periode.";
    doc.text(footerText2, centerX, currentY, { align: "center" });

    currentY += 15;

    // --- 6. TANDA TANGAN ---
    // Tanggal
    const currentDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(`Palembang, ${currentDate}`, pageWidth - 33, currentY, {
      align: "right",
    });
    currentY += 5;

    const signBlockY = currentY;
    const signSpace = 25;

    doc.setFontSize(11);

    // KIRI
    const leftX = 45;
    doc.text("Pihak Pertama", leftX, signBlockY, { align: "center" });
    doc.text("Yayasan Pendidikan Gani Nusantara", leftX, signBlockY + 5, {
      align: "center",
    });
    doc.text("Emy Febriani", leftX, signBlockY + signSpace + 5, {
      align: "center",
    });
    doc.setLineWidth(0.1);
    doc.line(25, signBlockY + signSpace + 6, 65, signBlockY + signSpace + 6); // Garis bawah nama

    // KANAN
    const rightX = pageWidth - 45;
    doc.text("Pihak Kedua", rightX, signBlockY, { align: "center" });
    doc.text("Staff Akuntansi SPPG Seberang Ulu II", rightX, signBlockY + 5, {
      align: "center",
    });
    doc.text("Mei Sari, S.Ak", rightX, signBlockY + signSpace + 5, {
      align: "center",
    });
    doc.line(
      pageWidth - 65,
      signBlockY + signSpace + 6,
      pageWidth - 25,
      signBlockY + signSpace + 6
    );

    // TENGAH BAWAH
    const centerSignY = signBlockY + signSpace + 15;
    doc.text("Mengetahui", centerX, centerSignY, { align: "center" });
    doc.text("Kepala SPPG Seberang Ulu II", centerX, centerSignY + 5, {
      align: "center",
    });
    doc.text(
      "M. Alfaridzi Swardana, S.T",
      centerX,
      centerSignY + signSpace + 5,
      { align: "center" }
    );
    doc.line(
      centerX - 30,
      centerSignY + signSpace + 6,
      centerX + 30,
      centerSignY + signSpace + 6
    );

    // Simpan PDF
    doc.save(`LPA_${reportData.main.periode.replace(/\s+/g, "_")}.pdf`);

    // NOTIFIKASI EXPORT BERHASIL
    showNotification("Laporan berhasil diunduh!", "success");
  };

  return (
    <MainLayout>
      {/* NOTIFIKASI TOAST (Pojok Kanan Atas) */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in-down">
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

      {/* CUSTOM MODAL KONFIRMASI HAPUS */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl transform scale-100 transition-transform">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hapus Data?
              </h3>
              <p className="text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak
                dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Laporan Penggunaan Anggaran
            </h1>
            <p className="text-gray-600">
              Pilih periode di sebelah kiri untuk mengelola laporan.
            </p>
          </div>

          {/* BUTTON EXPORT PDF */}
          {reportData && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm"
            >
              <FileDown size={20} />
              Export PDF
            </button>
          )}
        </div>

        {error && (
          <Card className="bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SIDEBAR LIST PERIODE */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Daftar Periode</h2>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : periods.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada periode master.
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {periods.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPeriod(p)}
                      className={`w-full text-left p-3 rounded-lg transition border ${
                        selectedPeriod?.id === p.id
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold">{p.nama_periode}</div>
                      <div className="text-sm opacity-75">
                        {formatDate(p.start_date)} - {formatDate(p.end_date)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* DETAIL PANEL */}
          <div className="lg:col-span-2 space-y-8">
            {selectedPeriod ? (
              <>
                {/* 1. RINCIAN KEUANGAN */}
                <Card className="overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Rincian Keuangan - {selectedPeriod.nama_periode}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedPeriod.start_date)} s/d{" "}
                        {formatDate(selectedPeriod.end_date)}
                      </p>
                    </div>
                    <button
                      onClick={openAddRincian}
                      className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition shadow-sm"
                    >
                      <Plus size={16} />
                      Tambah Rincian
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="py-3 pr-4 font-medium w-12">No</th>
                          <th className="py-3 pr-4 font-medium">Item</th>
                          <th className="py-3 pr-4 font-medium">
                            Dana Diajukan
                          </th>
                          <th className="py-3 pr-4 font-medium">Terealisasi</th>
                          <th className="py-3 pr-4 font-medium">Sisa</th>
                          <th className="py-3 font-medium w-32">Realisasi</th>
                          <th className="py-3 w-20 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {!reportData ||
                        !reportData.rincian ||
                        reportData.rincian.length === 0 ? (
                          <tr>
                            <td
                              colSpan="7"
                              className="py-8 text-center text-gray-400"
                            >
                              Belum ada rincian data
                            </td>
                          </tr>
                        ) : (
                          reportData.rincian.map((item, index) => {
                            const percent = getPercentage(
                              item.dana_terealisasi,
                              item.dana_diajukan
                            );
                            return (
                              <tr
                                key={item.id}
                                className="group hover:bg-gray-50"
                              >
                                <td className="py-4 text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="py-4 font-medium text-gray-900">
                                  {item.item}
                                </td>
                                <td className="py-4 text-gray-900">
                                  {formatCurrency(item.dana_diajukan)}
                                </td>
                                <td className="py-4 text-green-600 font-medium">
                                  {formatCurrency(item.dana_terealisasi)}
                                </td>
                                <td className="py-4 text-orange-500 font-medium">
                                  {formatCurrency(item.sisa_dana)}
                                </td>
                                <td className="py-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-black rounded-full"
                                        style={{ width: `${percent}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-700">
                                      {percent}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => openEditRincian(item)}
                                      className="text-blue-500 hover:text-blue-700 transition"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        promptDeleteRincian(item.id)
                                      }
                                      className="text-gray-400 hover:text-red-600 transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {/* FOOTER TOTAL */}
                      {reportData?.rincian?.length > 0 && (
                        <tfoot className="border-t border-gray-200">
                          <tr>
                            <td
                              colSpan="2"
                              className="py-4 text-right font-bold text-gray-900 pr-4"
                            >
                              Total:
                            </td>
                            <td className="py-4 font-bold text-gray-900">
                              {formatCurrency(
                                calculateTotal(
                                  reportData.rincian,
                                  "dana_diajukan"
                                )
                              )}
                            </td>
                            <td className="py-4 font-bold text-green-600">
                              {formatCurrency(
                                calculateTotal(
                                  reportData.rincian,
                                  "dana_terealisasi"
                                )
                              )}
                            </td>
                            <td className="py-4 font-bold text-orange-600">
                              {formatCurrency(
                                calculateTotal(reportData.rincian, "sisa_dana")
                              )}
                            </td>
                            <td colSpan="2"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </Card>

                {/* 2. KETERANGAN DETAIL */}
                <Card>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Keterangan Detail
                      </h3>
                    </div>
                    <button
                      onClick={openAddKeterangan}
                      className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition shadow-sm"
                    >
                      <Plus size={16} />
                      Tambah Keterangan
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="py-3 pr-4 font-medium w-12">No</th>
                          <th className="py-3 pr-4 font-medium w-1/3">Item</th>
                          <th className="py-3 font-medium">Keterangan</th>
                          <th className="py-3 w-20 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {!reportData ||
                        !reportData.keterangan ||
                        reportData.keterangan.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="py-8 text-center text-gray-400"
                            >
                              Belum ada keterangan
                            </td>
                          </tr>
                        ) : (
                          reportData.keterangan.map((item, index) => (
                            <tr
                              key={item.id}
                              className="group hover:bg-gray-50"
                            >
                              <td className="py-4 text-gray-500">
                                {index + 1}
                              </td>
                              <td className="py-4 font-medium text-gray-900">
                                {item.item}
                              </td>
                              <td className="py-4 text-gray-600">
                                {item.keterangan}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => openEditKeterangan(item)}
                                    className="text-blue-500 hover:text-blue-700 transition"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      promptDeleteKeterangan(item.id)
                                    }
                                    className="text-gray-400 hover:text-red-600 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="text-center py-20 bg-gray-50 border-dashed">
                <p className="text-gray-500">
                  Pilih periode dari daftar di sebelah kiri untuk melihat detail
                  laporan.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* --- MODAL RINCIAN (ADD & EDIT) --- */}
        {showRincianModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingRincian ? "Edit Rincian" : "Tambah Rincian"}
                </h3>
                <button
                  onClick={closeRincianModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={rincianForm.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Item
                  </label>
                  <select
                    name="item"
                    value={rincianForm.formData.item}
                    onChange={rincianForm.handleChange}
                    className="input-field w-full"
                    required
                  >
                    <option value="">-- Pilih Jenis Biaya --</option>
                    {ITEM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dana Diajukan
                    </label>
                    <input
                      type="number"
                      name="dana_diajukan"
                      value={rincianForm.formData.dana_diajukan}
                      onChange={rincianForm.handleChange}
                      className="input-field w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terealisasi
                    </label>
                    <input
                      type="number"
                      name="dana_terealisasi"
                      value={rincianForm.formData.dana_terealisasi}
                      onChange={rincianForm.handleChange}
                      className="input-field w-full"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-[#0F172A] text-white py-2.5 rounded-lg hover:bg-gray-800 font-medium"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingRincian
                    ? "Update Rincian"
                    : "Simpan Rincian"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL KETERANGAN (ADD & EDIT) --- */}
        {showKeteranganModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingKeterangan ? "Edit Keterangan" : "Tambah Keterangan"}
                </h3>
                <button
                  onClick={closeKeteranganModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form
                onSubmit={keteranganForm.handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={keteranganForm.formData.item}
                    onChange={keteranganForm.handleChange}
                    className="input-field w-full"
                    required
                    placeholder="Item terkait (Misal: Biaya Sewa)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={keteranganForm.formData.keterangan}
                    onChange={keteranganForm.handleChange}
                    rows="4"
                    className="input-field w-full resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-[#0F172A] text-white py-2.5 rounded-lg hover:bg-gray-800 font-medium"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingKeterangan
                    ? "Update Keterangan"
                    : "Simpan Keterangan"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
