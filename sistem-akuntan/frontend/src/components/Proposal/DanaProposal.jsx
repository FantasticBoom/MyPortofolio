import { useState, useEffect } from "react";
import { FileText, Eye, Save, Upload } from "lucide-react";
import { Card } from "../../components/common/Card";
import { formatCurrency } from "../../utils/formatCurrency";
import proposalService from "../../services/proposalService";

// Ganti port '5000' jika backend Anda jalan di port lain
const API_BASE_URL = "http://localhost:5000/uploads/";

export const DanaProposal = ({ periodeSelected }) => {
  // State Data Angka
  const [diajukan, setDiajukan] = useState(0);
  const [diterima, setDiterima] = useState(0);

  // State File Baru (yang akan diupload)
  const [docDiajukan, setDocDiajukan] = useState(null);
  const [docDiterima, setDocDiterima] = useState(null);

  // State File Lama (nama file dari database)
  const [existingDocDiajukan, setExistingDocDiajukan] = useState(null);
  const [existingDocDiterima, setExistingDocDiterima] = useState(null);

  const [loading, setLoading] = useState(false);

  // Hitung Selisih Otomatis
  const selisih = (parseFloat(diajukan) || 0) - (parseFloat(diterima) || 0);

  // Load data setiap kali periode berubah
  useEffect(() => {
    if (periodeSelected) {
      loadData();
    }
  }, [periodeSelected]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await proposalService.getByPeriode(periodeSelected);
      if (result.success) {
        const data = result.data;
        setDiajukan(data.dana_diajukan);
        setDiterima(data.dana_diterima);
        setExistingDocDiajukan(data.dokumen_pengajuan);
        setExistingDocDiterima(data.dokumen_penerimaan);

        // Reset file input
        setDocDiajukan(null);
        setDocDiterima(null);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("periode", periodeSelected);
      formData.append("dana_diajukan", diajukan);
      formData.append("dana_diterima", diterima);

      // Hanya append jika ada file baru yang dipilih
      if (docDiajukan) formData.append("dokumen_pengajuan", docDiajukan);
      if (docDiterima) formData.append("dokumen_penerimaan", docDiterima);

      const result = await proposalService.save(formData);

      if (result.success) {
        alert("Data berhasil disimpan!");
        loadData(); // Reload data untuk update tampilan
      }
    } catch (error) {
      console.error("Error save:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (filename) => {
    if (filename) window.open(`${API_BASE_URL}${filename}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* BAGIAN 1: DANA DIAJUKAN */}
        <Card className="bg-blue-50 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-blue-800 border-b border-blue-200 pb-2">
            <FileText size={20} />
            <h3 className="font-bold">Dana Diajukan</h3>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-bold mb-1 block">
              NOMINAL (RP)
            </label>
            <input
              type="number"
              value={diajukan}
              onChange={(e) => setDiajukan(e.target.value)}
              className="w-full p-2.5 border border-blue-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold mb-1 block">
              DOKUMEN PROPOSAL
            </label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-white border border-dashed border-blue-400 rounded-lg p-2 text-sm text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-50 transition">
                <Upload size={16} />
                <span className="truncate max-w-[100px]">
                  {docDiajukan ? docDiajukan.name : "Upload File"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setDocDiajukan(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>

              {existingDocDiajukan && !docDiajukan && (
                <button
                  onClick={() => handlePreview(existingDocDiajukan)}
                  className="bg-blue-200 text-blue-800 p-2 rounded-lg hover:bg-blue-300 transition"
                  title="Lihat Dokumen Saat Ini"
                >
                  <Eye size={18} />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* BAGIAN 2: DANA DITERIMA */}
        <Card className="bg-green-50 border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-green-800 border-b border-green-200 pb-2">
            <FileText size={20} />
            <h3 className="font-bold">Dana Diterima</h3>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-bold mb-1 block">
              NOMINAL (RP)
            </label>
            <input
              type="number"
              value={diterima}
              onChange={(e) => setDiterima(e.target.value)}
              className="w-full p-2.5 border border-green-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-bold mb-1 block">
              BUKTI TRANSFER/TERIMA
            </label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-white border border-dashed border-green-400 rounded-lg p-2 text-sm text-green-600 flex items-center justify-center gap-2 hover:bg-green-50 transition">
                <Upload size={16} />
                <span className="truncate max-w-[100px]">
                  {docDiterima ? docDiterima.name : "Upload File"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setDocDiterima(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>

              {existingDocDiterima && !docDiterima && (
                <button
                  onClick={() => handlePreview(existingDocDiterima)}
                  className="bg-green-200 text-green-800 p-2 rounded-lg hover:bg-green-300 transition"
                  title="Lihat Dokumen Saat Ini"
                >
                  <Eye size={18} />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* BAGIAN 3: SELISIH (OTOMATIS) */}
        <Card
          className={`flex flex-col justify-center items-center text-center border-2 shadow-sm ${
            selisih > 0
              ? "bg-orange-50 border-orange-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">
            Selisih Dana
          </h3>
          <span
            className={`text-3xl font-extrabold ${
              selisih > 0 ? "text-orange-600" : "text-gray-700"
            }`}
          >
            {formatCurrency(selisih)}
          </span>
          <p className="text-xs text-gray-400 mt-2 font-medium bg-white px-2 py-1 rounded-full border">
            (Dana Diajukan - Diterima)
          </p>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition shadow-lg disabled:bg-gray-400 font-medium"
        >
          <Save size={18} />
          {loading ? "Menyimpan Data..." : "Simpan Data Proposal"}
        </button>
      </div>
    </div>
  );
};
