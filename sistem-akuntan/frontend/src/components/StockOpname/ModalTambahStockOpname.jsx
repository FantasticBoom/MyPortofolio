import { useState, useEffect, useRef } from "react";
import { X, Loader, Search } from "lucide-react";
import { Card } from "../common/Card";
import { useForm } from "../../hooks/useForm";
import stockOpnameService from "../../services/stockOpnameService";

export const ModalTambahStockOpname = ({
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const {
    formData,
    errors,
    handleChange,
    setFormData,
    handleSubmit,
    resetForm,
  } = useForm(
    initialData || {
      nama_item: "",
      satuan: "",
      stock_fisik: "",
      stock_kartu: "",
      harga_satuan: "",
      keterangan: "",
    },
    async (data) => {
      await onSubmit(data);
      resetForm();
    }
  );

  // --- Autocomplete State ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Handle Search Input
  const handleSearchItem = async (e) => {
    const value = e.target.value;
    handleChange(e); // Update text input

    if (value.length > 1) {
      try {
        const result = await stockOpnameService.searchItems(value);
        if (result.success) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Gagal mencari item", err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select Item from Dropdown
  const selectItem = (item) => {
    setFormData((prev) => ({
      ...prev,
      nama_item: item.nama_barang,
      satuan: item.satuan_barang,
      stock_kartu: item.stock_akhir || 0, // Autofill Stock Kartu
      harga_satuan: item.harga_satuan || 0, // Autofill Harga Satuan
    }));
    setShowSuggestions(false);
  };

  // Auto-calculate
  const selisih =
    parseInt(formData.stock_fisik || 0) - parseInt(formData.stock_kartu || 0);
  const total =
    parseInt(formData.stock_fisik || 0) *
    parseFloat(formData.harga_satuan || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit" : "Tambah"} Stock Opname
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Nama Item (Autocomplete) & Satuan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative" ref={wrapperRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Item *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nama_item"
                  value={formData.nama_item}
                  onChange={handleSearchItem}
                  onFocus={() => formData.nama_item && setShowSuggestions(true)}
                  placeholder="Ketik nama barang..."
                  className="input-field pr-10"
                  required
                  autoComplete="off"
                />
                <Search
                  className="absolute right-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>

              {/* Dropdown Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => selectItem(item)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                    >
                      <div className="font-semibold">{item.nama_barang}</div>
                      <div className="text-xs text-gray-500">
                        Kode: {item.kode} | Stock: {item.stock_akhir}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {errors.nama_item && (
                <p className="text-red-500 text-sm mt-1">{errors.nama_item}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Satuan
              </label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                placeholder="Auto-fill"
                className="input-field bg-gray-50"
              />
            </div>
          </div>

          {/* Row 2: Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Fisik *
              </label>
              <input
                type="number"
                name="stock_fisik"
                value={formData.stock_fisik}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
                required
              />
              {errors.stock_fisik && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock_fisik}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock di Kartu *
              </label>
              <input
                type="number"
                name="stock_kartu"
                value={formData.stock_kartu}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selisih (Otomatis)
              </label>
              <div
                className={`input-field bg-gray-100 cursor-not-allowed font-semibold ${
                  selisih === 0
                    ? "text-gray-600"
                    : selisih > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selisih > 0 ? "+" : ""}
                {selisih}
              </div>
            </div>
          </div>

          {/* Row 3: Harga & Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Satuan
              </label>
              <input
                type="number"
                name="harga_satuan"
                value={formData.harga_satuan}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total (Otomatis)
              </label>
              <input
                type="text"
                value={total.toLocaleString("id-ID")}
                className="input-field bg-gray-100 cursor-not-allowed font-semibold"
                disabled
              />
            </div>
          </div>

          {/* Row 4: Keterangan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Catatan..."
              rows="3"
              className="input-field"
            />
          </div>

          {/* Actions */}
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
                  <Loader size={18} className="animate-spin" /> Menyimpan...
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
