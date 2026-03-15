import { useState, useEffect, useRef } from "react";
import { X, Loader, Search } from "lucide-react";
import bukuKasService from "../../services/bukuKasService";

export const ModalTambahBukuKas = ({
  onClose,
  onSubmit,
  isLoading = false,
  selectedPeriod = null,
}) => {
  // Fungsi set default tanggal agar masuk dalam range periode
  const getDefaultDate = () => {
    if (selectedPeriod && selectedPeriod.start_date) {
      return selectedPeriod.start_date; // Default ke tanggal mulai periode
    }
    return new Date().toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    tanggal: getDefaultDate(),
    kode_akun: "",
    no_bukti: "",
    uraian: "",
    pemasukan: "",
    pengeluaran: "",
    keterangan: "", // TAMBAH FIELD KETERANGAN
  });
  const [fileNota, setFileNota] = useState(null);
  const [errors, setErrors] = useState({});

  // STATE UNTUK AUTOCOMPLETE
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null); // Ref untuk mendeteksi klik di luar komponen

  // Reset tanggal jika periode berubah
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      tanggal: getDefaultDate(),
    }));
  }, [selectedPeriod]);

  // Effect untuk menutup suggestion jika klik di luar area search
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // HANDLER PENCARIAN AUTOCOMPLETE
  const handleSearchChange = async (e) => {
    const value = e.target.value;

    // Update state form (kolom uraian)
    setFormData((prev) => ({ ...prev, uraian: value }));

    if (errors.uraian) {
      setErrors((prev) => ({ ...prev, uraian: "" }));
    }

    // Logika pencarian ke backend
    if (value.length > 1) {
      try {
        const result = await bukuKasService.searchItems(value);
        if (result.success && result.data.length > 0) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error searching items:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // HANDLER SAAT ITEM SUGGESTION DIPILIH
  const handleSelectSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      kode_akun: item.kode, // Isi Kode Akun Otomatis
      uraian: item.nama_barang, // Isi Uraian Otomatis
    }));
    setShowSuggestions(false); // Tutup dropdown
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Ukuran file maksimal 5MB",
        }));
        return;
      }
      setFileNota(file);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tanggal) newErrors.tanggal = "Tanggal wajib diisi";
    if (!formData.uraian) newErrors.uraian = "Uraian wajib diisi";

    // Validasi tambahan: Cek apakah tanggal ada dalam range periode
    if (selectedPeriod) {
      if (
        formData.tanggal < selectedPeriod.start_date ||
        formData.tanggal > selectedPeriod.end_date
      ) {
        newErrors.tanggal = `Tanggal harus berada dalam periode (${selectedPeriod.start_date} s/d ${selectedPeriod.end_date})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData, fileNota);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Tambah Data Buku Kas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* TANGGAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className={`input-field w-full p-2 border rounded ${
                errors.tanggal ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.tanggal && (
              <p className="text-red-500 text-sm mt-1">{errors.tanggal}</p>
            )}
            {selectedPeriod && (
              <p className="text-xs text-blue-600 mt-1">
                Periode Aktif: {selectedPeriod.start_date} s/d{" "}
                {selectedPeriod.end_date}
              </p>
            )}
          </div>

          {/* URAIAN DENGAN AUTOCOMPLETE */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uraian / Nama Transaksi
            </label>
            <div className="relative">
              <textarea
                name="uraian"
                value={formData.uraian}
                onChange={handleSearchChange} // Menggunakan handler khusus pencarian
                rows="2"
                className={`input-field w-full p-2 pr-10 border rounded ${
                  errors.uraian ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ketik kode atau nama barang untuk mencari..."
                autoComplete="off"
              ></textarea>
              <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                <Search size={18} />
              </div>
            </div>

            {errors.uraian && (
              <p className="text-red-500 text-sm mt-1">{errors.uraian}</p>
            )}

            {/* DROPDOWN SUGESTI */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {item.nama_barang}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                        {item.kode}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Akun (Otomatis)
              </label>
              <input
                type="text"
                name="kode_akun"
                value={formData.kode_akun}
                onChange={handleChange}
                className="input-field w-full p-2 border border-gray-300 rounded bg-gray-50"
                placeholder="Contoh: 1.1.1"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No Bukti (Opsional)
              </label>
              <input
                type="text"
                name="no_bukti"
                value={formData.no_bukti}
                onChange={handleChange}
                className="input-field w-full p-2 border border-gray-300 rounded"
                placeholder="Contoh: BKK-001"
              />
            </div>
          </div>

          {/* INPUT KETERANGAN BARU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan (Opsional)
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows="3"
              className="input-field w-full p-2 border border-gray-300 rounded"
              placeholder="Catatan tambahan mengenai transaksi ini."
            ></textarea>
          </div>
          {/* AKHIR INPUT KETERANGAN BARU */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pemasukan (Rp)
              </label>
              <input
                type="number"
                name="pemasukan"
                value={formData.pemasukan}
                onChange={handleChange}
                className="input-field w-full p-2 border border-gray-300 rounded"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pengeluaran (Rp)
              </label>
              <input
                type="number"
                name="pengeluaran"
                value={formData.pengeluaran}
                onChange={handleChange}
                className="input-field w-full p-2 border border-gray-300 rounded"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bukti Nota (Opsional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="input-field w-full p-2 border border-gray-300 rounded"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: PDF, JPG, PNG (Max 5MB)
            </p>
            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file}</p>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Data"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
