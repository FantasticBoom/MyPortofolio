import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  FileDown,
  CheckCircle,
  X,
  Printer,
} from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { BiayaOperasionalTable } from "../components/BiayaOperasional/BiayaOperasionalTable";
import { ModalTambahBiayaOperasional } from "../components/BiayaOperasional/ModalTambahBiayaOperasional";
import { FilterBiayaOperasional } from "../components/BiayaOperasional/FilterBiayaOperasional";
import { ModalKonfirmasi } from "../components/common/ModalKonfirmasi";
import biayaOperasionalService from "../services/biayaOperasionalService";
import { formatCurrency } from "../utils/formatCurrency";
import logoInstansi from "../assets/bgn.png";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const JENIS_BIAYA_LABELS = {
  biaya_operasional: "Biaya Operasional",
  biaya_bahan_baku: "Biaya Bahan Baku",
  biaya_sewa: "Insentif Mitra",
};

const KODE_SURAT = {
  biaya_operasional: "LBO",
  biaya_bahan_baku: "LBB",
  biaya_sewa: "LIM",
  "": "LAP",
};

const JENIS_BIAYA_COLORS = {
  biaya_insentif: "blue",
  biaya_operasional: "green",
  biaya_bahan_baku: "red",
  biaya_sewa: "blue",
};

export const LaporanBiayaOperasional = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [nomorUrutSurat, setNomorUrutSurat] = useState("01");

  const [selectedPeriode, setSelectedPeriode] = useState("");
  const [selectedJenisBiaya, setSelectedJenisBiaya] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (selectedPeriode) {
      fetchData();
      fetchSummary();
    } else {
      setData([]);
      setSummary(null);
    }
  }, [selectedPeriode, selectedJenisBiaya]);

  const getDynamicTitle = () => {
    if (selectedJenisBiaya && JENIS_BIAYA_LABELS[selectedJenisBiaya]) {
      return `Laporan ${JENIS_BIAYA_LABELS[selectedJenisBiaya]}`;
    }
    return "Laporan Biaya Operasional";
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchData = async () => {
    if (!selectedPeriode) return;
    try {
      setLoading(true);
      setError(null);
      const result = await biayaOperasionalService.getAll(
        selectedPeriode,
        selectedJenisBiaya
      );
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal memuat data laporan biaya operasional");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!selectedPeriode) return;
    try {
      const result = await biayaOperasionalService.getSummaryByPeriode(
        selectedPeriode
      );
      if (result.success) {
        setSummary(result.data);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const handleAddBiayaOperasional = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...formData,
        qty: parseInt(formData.qty) || 0,
        harga_satuan: parseFloat(formData.harga_satuan) || 0,
        nominal:
          parseFloat(formData.nominal) ||
          parseInt(formData.qty || 0) * parseFloat(formData.harga_satuan || 0),
      };

      let result;
      if (editingId) {
        result = await biayaOperasionalService.update(editingId, payload);
      } else {
        result = await biayaOperasionalService.create(payload);
      }

      if (result.success) {
        setShowModal(false);
        setEditingId(null);
        setEditingData(null);
        if (selectedPeriode) {
          await fetchData();
          await fetchSummary();
        }
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

  const handleEditBiayaOperasional = async (id) => {
    try {
      const result = await biayaOperasionalService.getById(id);
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setSubmitting(true);
      const result = await biayaOperasionalService.delete(deleteId);
      if (result.success) {
        await fetchData();
        await fetchSummary();
        showNotification("Data berhasil dihapus!");
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        setError(result.message);
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError("Gagal menghapus data");
      console.error(err);
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExportModal = () => {
    setNomorUrutSurat("01");
    setShowExportModal(true);
  };

  // LOGIC EXPORT PDF
  const processExportPDF = () => {
    try {
      setShowExportModal(false);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const titleText = getDynamicTitle().toUpperCase();

      // PERSIAPAN DATA PERIODE
      let startDateObj = new Date();
      let periodeValue = "-";

      if (data.length > 0 && data[0].period_start && data[0].period_end) {
        startDateObj = new Date(data[0].period_start);
        const endDateObj = new Date(data[0].period_end);

        const options = { day: "numeric", month: "long", year: "numeric" };
        const startDateStr = startDateObj.toLocaleDateString("id-ID", options);
        const endDateStr = endDateObj.toLocaleDateString("id-ID", options);
        periodeValue = `${startDateStr} s.d ${endDateStr}`;
      } else if (data.length > 0 && data[0].nama_periode) {
        periodeValue = data[0].nama_periode;
      }

      // --- NOMOR SURAT ---
      const toRoman = (num) => {
        const roman = [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
          "XII",
        ];
        return roman[num] || "";
      };
      const kodeJenis = KODE_SURAT[selectedJenisBiaya] || "LAP";
      const bulanRomawi = toRoman(startDateObj.getMonth());
      const tahun = startDateObj.getFullYear();
      const instansiCode = "SPPGSU2";
      const nomorSurat = `Nomor: ${nomorUrutSurat}/${kodeJenis}/${instansiCode}/${bulanRomawi}/${tahun}`;

      // --- TANGGAL CETAK ---
      const now = new Date();
      const formattedDateShort = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // --- HEADER & LOGO ---
      const logoWidth = 25;
      const logoHeight = 25;
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = 10;
      try {
        doc.addImage(logoInstansi, "PNG", logoX, logoY, logoWidth, logoHeight);
      } catch (imgErr) {
        console.warn("Logo gagal dimuat", imgErr);
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, pageWidth / 2, 40, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(nomorSurat, pageWidth / 2, 46, { align: "center" });

      // --- INFO BLOCK ---
      const startY = 55;
      const lineHeight = 5;
      const labelX = 14;
      const colonX = 35;
      const valueX = 37;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      // 1. Hari / Tanggal
      doc.text("Hari / Tanggal", labelX, startY);
      doc.text(":", colonX, startY);
      doc.text(formattedDateShort, valueX, startY);

      // 2. Nama
      doc.text("Nama", labelX, startY + lineHeight);
      doc.text(":", colonX, startY + lineHeight);
      doc.text(
        "Yayasan Pendidikan Gani Nusantara Palembang",
        valueX,
        startY + lineHeight
      );

      // 3. Alamat
      doc.text("Alamat", labelX, startY + lineHeight * 2);
      doc.text(":", colonX, startY + lineHeight * 2);
      const alamat =
        "Jln. DI. Panjaitan Lr. Sikam No. 2215 RT. 044 RW. 014 Kec. Seberang Ulu 2 Kota Palembang, Sumatera Selatan";
      const splitAlamat = doc.splitTextToSize(alamat, 150);
      doc.text(splitAlamat, valueX, startY + lineHeight * 2);

      // 4. PERIODE
      const alamatEndY = startY + lineHeight * 2 + splitAlamat.length * 4 + 2;

      doc.text("Periode", labelX, alamatEndY);
      doc.text(":", colonX, alamatEndY);
      doc.text(periodeValue, valueX, alamatEndY);

      // TABEL
      const tableStartY = alamatEndY + 8;

      const tableBody = data.map((item, index) => {
        const qty = item.qty || 0;
        const satuan = item.satuan || "-";
        const harga = parseFloat(item.harga_satuan) || 0;
        const total = parseFloat(item.nominal) || 0;
        const tanggalItem = item.tanggal
          ? new Date(item.tanggal).toLocaleDateString("id-ID")
          : "-";
        const kode = item.kode || "-";
        const uraian = item.uraian || item.nama_biaya || "Tanpa Nama";
        const keterangan = item.keterangan || "";

        return [
          index + 1,
          tanggalItem,
          kode,
          uraian,
          qty,
          satuan,
          `Rp ${harga.toLocaleString("id-ID")}`,
          `Rp ${total.toLocaleString("id-ID")}`,
          keterangan,
        ];
      });

      const grandTotal = data.reduce(
        (acc, curr) => acc + (parseFloat(curr.nominal) || 0),
        0
      );

      autoTable(doc, {
        startY: tableStartY,
        head: [
          [
            "No",
            "Tanggal",
            "Kode",
            "Uraian",
            "Qty",
            "Satuan",
            "Harga Satuan",
            "Nominal (Rp)",
            "Keterangan",
          ],
        ],
        body: tableBody,
        foot: [
          [
            {
              content: "Total",
              colSpan: 7,
              styles: { halign: "center", fontStyle: "bold" },
            },
            {
              content: `Rp ${grandTotal.toLocaleString("id-ID")}`,
              styles: { fontStyle: "bold", halign: "right" },
            },
            "",
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 8,
          font: "helvetica",
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { halign: "center", cellWidth: 20 },
          2: { halign: "center", cellWidth: 15 },
          3: { halign: "left" },
          4: { halign: "center", cellWidth: 10 },
          5: { halign: "center", cellWidth: 15 },
          6: { halign: "right", cellWidth: 25 },
          7: { halign: "right", cellWidth: 25 },
          8: { halign: "left", cellWidth: 20 },
        },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Palembang, ${formattedDateShort}`, pageWidth - 20, finalY, {
        align: "right",
      });
      const signY = finalY + 10;
      doc.text("Mengetahui", 33, signY);
      doc.text("Kepala SPPG Seberang Ulu 2", 20, signY + 5);
      doc.text("(M. Alfaridzi Swardana, S.T)", 20, signY + 30);
      doc.text("Akuntan SPPG Seberang Ulu 2", pageWidth - 20, signY + 5, {
        align: "right",
      });
      doc.text("(Mei Sari, S.Ak)", pageWidth - 40, signY + 30, {
        align: "right",
      });

      doc.save(`Laporan-${titleText}-Periode ${periodeValue}.pdf`);
      showNotification("Laporan berhasil diunduh!");
    } catch (err) {
      console.error("Gagal export PDF:", err);
      showNotification("Gagal membuat PDF", "error");
    }
  };

  return (
    <MainLayout>
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

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getDynamicTitle()}
            </h1>
            <p className="text-gray-600">
              Laporan biaya operasional per periode berdasarkan jenis biaya
            </p>
          </div>
          <button
            onClick={() => {
              if (!selectedPeriode) {
                showNotification("Pilih periode terlebih dahulu!", "error");
                return;
              }
              setEditingId(null);
              setEditingData(null);
              setShowModal(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
              selectedPeriode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedPeriode}
          >
            <Plus size={20} />
            Tambah Entri
          </button>
        </div>

        {error && (
          <Card className="bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="flex flex-wrap items-center gap-4">
          <FilterBiayaOperasional
            periode={selectedPeriode}
            jenis_biaya={selectedJenisBiaya}
            onPeriodeChange={setSelectedPeriode}
            onJenisChange={setSelectedJenisBiaya}
            loading={loading}
          />
          <div className="flex items-center gap-2">
            {data.length > 0 && (
              <button
                onClick={handleOpenExportModal}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold animate-fade-in whitespace-nowrap"
                title="Download PDF"
              >
                <FileDown size={18} />
                Export PDF
              </button>
            )}
            <button
              onClick={() => {
                fetchData();
                fetchSummary();
              }}
              disabled={!selectedPeriode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </Card>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summary.byType.map((item) => (
              <Card
                key={item.jenis_biaya}
                className={`border-l-4 ${
                  JENIS_BIAYA_COLORS[item.jenis_biaya] === "blue"
                    ? "border-l-blue-600 bg-blue-50"
                    : JENIS_BIAYA_COLORS[item.jenis_biaya] === "green"
                    ? "border-l-green-600 bg-green-50"
                    : "border-l-red-600 bg-red-50"
                }`}
              >
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {JENIS_BIAYA_LABELS[item.jenis_biaya]}
                </p>
                <p className="text-2xl font-bold mb-1">
                  {formatCurrency(item.total)}
                </p>
                <p className="text-xs text-gray-600">{item.count} item</p>
              </Card>
            ))}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Total Keseluruhan
              </p>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {formatCurrency(summary.total)}
              </p>
            </Card>
          </div>
        )}

        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {selectedPeriode
              ? `${getDynamicTitle()} - ${
                  data.length > 0 ? data[0].nama_periode : "(Data Kosong)"
                }`
              : "Pilih Periode Terlebih Dahulu"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedPeriode
              ? "Daftar biaya operasional dengan perincian qty, harga satuan, dan nominal"
              : "Silakan pilih periode dari filter di atas"}
          </p>
          {loading ? (
            <LoadingSpinner />
          ) : selectedPeriode ? (
            <div className="overflow-x-auto">
              <BiayaOperasionalTable
                data={data}
                loading={loading}
                onDelete={handleDeleteClick}
                onEdit={handleEditBiayaOperasional}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Pilih periode dari filter untuk melihat data
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <ModalTambahBiayaOperasional
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setEditingData(null);
          }}
          onSubmit={handleAddBiayaOperasional}
          isLoading={submitting}
          initialData={editingData}
          periodeId={selectedPeriode}
        />
      )}

      <ModalKonfirmasi
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={executeDelete}
        title="Hapus Biaya Operasional"
        message="Apakah Anda yakin ingin menghapus data biaya operasional ini? Data yang dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isLoading={submitting}
      />

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="font-bold text-lg">Cetak Laporan</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Urut Surat
                </label>
                <input
                  type="text"
                  value={nomorUrutSurat}
                  onChange={(e) => setNomorUrutSurat(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: 01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: Nomor/Kode/Instansi/Bulan/Tahun
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={processExportPDF}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Cetak PDF
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};
