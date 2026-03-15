import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  UploadCloud,
  Eye,
  TrendingDown,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Save,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2"; // IMPORT SWEETALERT
import { MainLayout } from "../components/Layout/MainLayout";
import { formatCurrency } from "../utils/formatCurrency";
import proposalService from "../services/proposalService";

// Sesuaikan URL backend Anda
const API_BASE_URL = "http://localhost:5000/uploads/";

export const DanaProposal = () => {
  // --- STATE UNTUK PERIODE ---
  const [periodList, setPeriodList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // --- STATE DATA ---
  const [diajukan, setDiajukan] = useState(0);
  const [diterima, setDiterima] = useState(0);

  // --- STATE FILE ---
  const [docDiajukan, setDocDiajukan] = useState(null);
  const [docDiterima, setDocDiterima] = useState(null);
  const [existingDocDiajukan, setExistingDocDiajukan] = useState(null);
  const [existingDocDiterima, setExistingDocDiterima] = useState(null);

  const [loading, setLoading] = useState(false);

  // Hitung Selisih
  const selisih = (parseFloat(diajukan) || 0) - (parseFloat(diterima) || 0);

  // 1. Load List Periode
  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const result = await proposalService.getPeriods();
      if (result.success && result.data.length > 0) {
        setPeriodList(result.data);
        setSelectedPeriod(result.data[0].nama_periode);
      }
    } catch (error) {
      console.error("Gagal mengambil list periode:", error);
      // Notifikasi Error Halus (Toast)
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Periode",
        text: "Periksa koneksi server database Anda.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // 2. Load Data Proposal
  useEffect(() => {
    if (selectedPeriod) {
      loadProposalData();
    }
  }, [selectedPeriod]);

  const loadProposalData = async () => {
    if (!selectedPeriod) return;
    try {
      setLoading(true);
      const result = await proposalService.getByPeriode(selectedPeriod);

      if (result && result.data) {
        const data = result.data;
        setDiajukan(data.dana_diajukan || 0);
        setDiterima(data.dana_diterima || 0);
        setExistingDocDiajukan(data.dokumen_pengajuan);
        setExistingDocDiterima(data.dokumen_penerimaan);
      } else {
        resetForm();
      }

      setDocDiajukan(null);
      setDocDiterima(null);
    } catch (error) {
      console.error("Gagal memuat data proposal:", error);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDiajukan(0);
    setDiterima(0);
    setExistingDocDiajukan(null);
    setExistingDocDiterima(null);
  };

  const handleSave = async () => {
    // Validasi input sederhana
    if (!selectedPeriod) {
      Swal.fire({
        icon: "warning",
        title: "Periode Belum Dipilih",
        text: "Silakan pilih periode laporan terlebih dahulu.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("periode", selectedPeriod);
      formData.append("dana_diajukan", diajukan);
      formData.append("dana_diterima", diterima);

      if (docDiajukan) formData.append("dokumen_pengajuan", docDiajukan);
      if (docDiterima) formData.append("dokumen_penerimaan", docDiterima);

      const result = await proposalService.save(formData);

      if (result.success || result.data) {
        // --- NOTIFIKASI SUKSES (SWEETALERT) ---
        Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan!",
          text: `Data untuk ${selectedPeriod} telah diperbarui.`,
          confirmButtonText: "OK",
          confirmButtonColor: "#111827", // Warna gelap sesuai tema sidebar
          backdrop: `
            rgba(0,0,123,0.1)
          `,
        });

        loadProposalData(); // Reload data
      }
    } catch (error) {
      console.error("Error save:", error);
      // --- NOTIFIKASI ERROR ---
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menghubungi server.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (filename) => {
    if (filename) window.open(`${API_BASE_URL}${filename}`, "_blank");
  };

  const getPeriodDateRange = () => {
    const current = periodList.find((p) => p.nama_periode === selectedPeriod);
    if (current) {
      const start = new Date(current.start_date).toLocaleDateString("id-ID");
      const end = new Date(current.end_date).toLocaleDateString("id-ID");
      return `${start} - ${end}`;
    }
    return "-";
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Dana Proposal
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola pengajuan dan penerimaan dana kegiatan per periode MBG .
            </p>
          </div>

          {/* PERIODE SELECTOR (DROPDOWN) */}
          <div className="bg-white p-2 rounded-lg border shadow-sm flex items-center gap-3 min-w-[300px]">
            <div className="bg-indigo-50 p-2 rounded-md">
              <Calendar className="text-indigo-600" size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">
                Pilih Periode Aktif
              </span>

              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  disabled={periodList.length === 0}
                >
                  {periodList.length === 0 ? (
                    <option>Loading periode...</option>
                  ) : (
                    periodList.map((p) => (
                      <option key={p.id} value={p.nama_periode}>
                        {p.nama_periode}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>

              {selectedPeriod && (
                <span className="text-[10px] text-gray-400 mt-1 pl-1">
                  Tanggal: {getPeriodDateRange()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* KOLOM KIRI (INPUT) */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD: DANA DIAJUKAN */}
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-bold text-blue-900">Dana Diajukan</h3>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  Step 1
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={diajukan}
                    onChange={(e) => setDiajukan(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">
                    Dokumen Proposal
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer border border-dashed border-gray-300 rounded-lg p-2.5 flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition text-sm text-gray-600">
                      <UploadCloud size={16} />
                      <span className="truncate max-w-[100px]">
                        {docDiajukan ? docDiajukan.name : "Upload"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setDocDiajukan(e.target.files[0])}
                        accept=".pdf,.jpg,.png"
                      />
                    </label>
                    {existingDocDiajukan && (
                      <button
                        onClick={() => handlePreview(existingDocDiajukan)}
                        className="p-3 border rounded-lg hover:bg-gray-50 text-blue-600"
                        title="Lihat"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD: DANA DITERIMA */}
            <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <TrendingDown size={20} />
                  </div>
                  <h3 className="font-bold text-emerald-900">
                    Dana Diterima (Rekening Koran)
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Step 2
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={diterima}
                    onChange={(e) => setDiterima(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">
                    Bukti Transfer
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer border border-dashed border-gray-300 rounded-lg p-2.5 flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition text-sm text-gray-600">
                      <UploadCloud size={16} />
                      <span className="truncate max-w-[100px]">
                        {docDiterima ? docDiterima.name : "Upload"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setDocDiterima(e.target.files[0])}
                        accept=".pdf,.jpg,.png"
                      />
                    </label>
                    {existingDocDiterima && (
                      <button
                        onClick={() => handlePreview(existingDocDiterima)}
                        className="p-3 border rounded-lg hover:bg-gray-50 text-emerald-600"
                        title="Lihat"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (SUMMARY) */}
          <div className="lg:col-span-4 space-y-6">
            {/* SELISIH CARD */}
            <div
              className={`rounded-xl p-6 border-2 text-center flex flex-col items-center justify-center min-h-[180px] ${
                selisih > 0
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`p-3 rounded-full mb-3 ${
                  selisih > 0
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <AlertCircle size={32} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                SELISIH DANA
              </p>
              <h2
                className={`text-3xl font-black ${
                  selisih > 0 ? "text-orange-600" : "text-gray-800"
                }`}
              >
                {formatCurrency(selisih)}
              </h2>
            </div>

            {/* STATUS DOKUMEN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileCheck size={18} /> Status Dokumen
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Proposal</span>
                  {existingDocDiajukan ? (
                    <button
                      onClick={() => handlePreview(existingDocDiajukan)}
                      className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-green-200 transition-colors"
                      title="Lihat Proposal"
                    >
                      <Eye size={14} />
                      <span>Lihat</span>
                    </button>
                  ) : docDiajukan ? (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Siap Diupload
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                      KOSONG
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Bukti Terima</span>
                  {existingDocDiterima ? (
                    <button
                      onClick={() => handlePreview(existingDocDiterima)}
                      className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-green-200 transition-colors"
                      title="Lihat Bukti Terima"
                    >
                      <Eye size={14} />
                      <span>Lihat</span>
                    </button>
                  ) : docDiterima ? (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Siap Diupload
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                      KOSONG
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !selectedPeriod}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save size={18} /> Simpan Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
