import { useState, useEffect, useRef } from "react";
import { X, Loader } from "lucide-react";
import { Card } from "../common/Card";
import { useForm } from "../../hooks/useForm";
import biayaOperasionalService from "../../services/biayaOperasionalService";

// --- PERUBAHAN LABEL DI SINI ---
const JENIS_BIAYA_OPTIONS = [
  { value: "biaya_sewa", label: "Insentif Mitra" }, // Label diubah, value tetap
  { value: "biaya_operasional", label: "Biaya Operasional" },
  { value: "biaya_bahan_baku", label: "Biaya Bahan Baku" },
];

const formatTanggalInput = (isoString) => {
  if (!isoString) return new Date().toISOString().split("T")[0];
  return isoString.split("T")[0];
};

export const ModalTambahBiayaOperasional = ({
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  periodeId = null,
}) => {
  const defaultValues = {
    periode_id: initialData?.periode_id || periodeId || "",
    tanggal: formatTanggalInput(initialData?.tanggal),
    kode: initialData?.kode || "",
    uraian: initialData?.uraian || "",
    jenis_biaya: initialData?.jenis_biaya || "",
    qty: initialData?.qty || "",
    satuan: initialData?.satuan || "",
    harga_satuan: initialData?.harga_satuan || "",
    nominal: initialData?.nominal || "",
  };

  const { formData, setFormData, errors, handleChange, handleSubmit } = useForm(
    defaultValues,
    async (data) => {
      await onSubmit(data);
    }
  );

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Logic: Autocomplete aktif untuk Operasional DAN Bahan Baku
  const isAutocompleteEnabled =
    formData.jenis_biaya === "biaya_operasional" ||
    formData.jenis_biaya === "biaya_bahan_baku";

  const handleKodeChange = async (e) => {
    const value = e.target.value;
    handleChange(e);

    if (isAutocompleteEnabled && value.length > 1) {
      setIsSearching(true);
      try {
        const result = await biayaOperasionalService.searchBarang(
          value,
          formData.jenis_biaya
        );
        if (result.success) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Error searching barang:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const newData = {
      ...formData,
      kode: item.kode,
      uraian: item.nama_barang,
    };

    if (item.harga && parseFloat(item.harga) > 0) {
      newData.harga_satuan = item.harga;
    }

    if (item.satuan && item.satuan !== "") {
      newData.satuan = item.satuan;
    }

    setFormData(newData);
    setShowSuggestions(false);
  };

  const calculatedNominal =
    (parseFloat(formData.qty) || 0) * (parseFloat(formData.harga_satuan) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit" : "Tambah"} Biaya Operasional
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="periode_id" value={formData.periode_id} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal *
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal || ""}
                onChange={handleChange}
                className="input-field"
                required
              />
              {errors.tanggal && (
                <p className="text-red-500 text-xs">{errors.tanggal}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Biaya *
              </label>
              <select
                name="jenis_biaya"
                value={formData.jenis_biaya || ""}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    kode: "",
                    uraian: "",
                    harga_satuan: "",
                    satuan: "",
                  }));
                }}
                className="input-field"
                required
              >
                <option value="">Pilih Jenis Biaya</option>
                {JENIS_BIAYA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="relative" ref={wrapperRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kode{" "}
                {isAutocompleteEnabled && (
                  <span className="text-blue-600 text-xs">
                    (Auto Search Active)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="kode"
                  value={formData.kode || ""}
                  onChange={handleKodeChange}
                  placeholder={
                    isAutocompleteEnabled
                      ? "Ketik Kode atau Nama Barang..."
                      : "Misal: OP001"
                  }
                  autoComplete="off"
                  className="input-field pr-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <Loader size={18} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {showSuggestions &&
                suggestions.length > 0 &&
                isAutocompleteEnabled && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition flex justify-between items-center group"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">
                            {item.kode}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.nama_barang}
                          </span>
                        </div>
                        <div className="text-right">
                          {item.harga > 0 && (
                            <span className="block text-xs font-semibold text-green-600">
                              Rp {item.harga.toLocaleString()}{" "}
                              {item.satuan ? `/ ${item.satuan}` : ""}
                            </span>
                          )}
                          <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 font-semibold">
                            Pilih
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

              {showSuggestions &&
                suggestions.length === 0 &&
                !isSearching &&
                isAutocompleteEnabled &&
                formData.kode.length > 1 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-sm text-gray-500 text-center">
                    Data tidak ditemukan di database
                  </div>
                )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Uraian *
              </label>
              <input
                type="text"
                name="uraian"
                value={formData.uraian || ""}
                onChange={handleChange}
                placeholder="Deskripsi biaya (Otomatis terisi jika pilih Kode)"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qty
              </label>
              <input
                type="number"
                name="qty"
                value={formData.qty || ""}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Satuan
              </label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan || ""}
                onChange={handleChange}
                placeholder="Pcs, Kg"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Satuan
              </label>
              <input
                type="number"
                name="harga_satuan"
                value={formData.harga_satuan || ""}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nominal (Otomatis / Manual)
            </label>
            <input
              type="number"
              name="nominal"
              value={
                formData.nominal !== ""
                  ? formData.nominal
                  : calculatedNominal || ""
              }
              onChange={handleChange}
              placeholder="0"
              className="input-field"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Otomatis: {formData.qty || 0} × {formData.harga_satuan || 0} = Rp{" "}
              {calculatedNominal.toLocaleString("id-ID")}
            </p>
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
                  <Loader size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : initialData ? (
                "Update"
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
