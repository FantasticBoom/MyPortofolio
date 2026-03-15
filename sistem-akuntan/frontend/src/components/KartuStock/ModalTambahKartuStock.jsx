import { useState, useEffect, useRef } from "react";
import { X, Loader, Search, ChevronDown } from "lucide-react";
import { Card } from "../common/Card";
import { useForm } from "../../hooks/useForm";
import manajemenService from "../../services/manajemenService";
import kartuStockService from "../../services/kartuStockService";

export const ModalTambahKartuStock = ({
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const [referensiBarang, setReferensiBarang] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // State Logic
  const [isFirstTransaction, setIsFirstTransaction] = useState(true);
  const [isPriceChanged, setIsPriceChanged] = useState(false);
  const [fetchingStock, setFetchingStock] = useState(false);

  // State Baru: Batch Stok (untuk pilihan saat Keluar)
  const [stockBatches, setStockBatches] = useState([]);

  const wrapperRef = useRef(null);

  const {
    formData,
    errors,
    setFormData,
    handleChange,
    handleSubmit,
    resetForm,
  } = useForm(
    initialData || {
      kode: "",
      nama_barang: "",
      satuan_barang: "",
      tanggal: new Date().toISOString().split("T")[0],
      stock_awal: "",
      masuk: "",
      keluar: "",
      harga_satuan: "",
      keterangan: "",
    },
    async (data) => {
      const payload = {
        ...data,
        stock_awal: data.stock_awal === "" ? 0 : data.stock_awal,
        masuk: data.masuk === "" ? 0 : data.masuk,
        keluar: data.keluar === "" ? 0 : data.keluar,
        harga_satuan: data.harga_satuan === "" ? 0 : data.harga_satuan,
      };
      await onSubmit(payload);
      resetForm();
    },
    (values) => {
      const newErrors = {};
      if (!values.kode || values.kode.trim() === "") {
        newErrors.kode = "Kode barang wajib diisi.";
      }
      if (!values.tanggal) {
        newErrors.tanggal = "Tanggal wajib diisi.";
      }
      return newErrors;
    }
  );

  // 1. Fetch Referensi Barang (Master)
  useEffect(() => {
    if (!initialData) {
      const fetchDataBarang = async () => {
        try {
          const result = await manajemenService.getPrices();
          if (result.success) {
            setReferensiBarang(result.data);
          }
        } catch (error) {
          console.error("Gagal memuat referensi barang:", error);
        }
      };
      fetchDataBarang();
    }
  }, [initialData]);

  // 2. LOGIKA UTAMA: Cek Saldo & Batch
  useEffect(() => {
    const checkStockLogic = async () => {
      if (!initialData && formData.kode) {
        setFetchingStock(true);
        try {
          // A. Ambil Data Batch (Sisa stok per harga)
          const batchRes = await kartuStockService.getStockBatches(
            formData.kode
          );
          if (batchRes.success) {
            setStockBatches(batchRes.data);
          }

          // B. Ambil Last Stock General (untuk logika Masuk / Reset Harga)
          if (formData.harga_satuan) {
            const res = await kartuStockService.getLastStock(formData.kode);
            if (res.success) {
              const { lastStock, lastPrice, isFirstData } = res.data;
              const currentMasterPrice = Number(formData.harga_satuan);
              const prevTransactionPrice = Number(lastPrice);

              // Jika user sedang mengisi 'Keluar', jangan timpa logika ini
              if (!formData.keluar || formData.keluar == 0) {
                if (
                  !isFirstData &&
                  currentMasterPrice !== prevTransactionPrice
                ) {
                  setIsPriceChanged(true);
                  setIsFirstTransaction(true);
                  setFormData((prev) => ({ ...prev, stock_awal: 0 }));
                } else {
                  setIsPriceChanged(false);
                  setIsFirstTransaction(isFirstData);
                  setFormData((prev) => ({ ...prev, stock_awal: lastStock }));
                }
              }
            }
          }
        } catch (error) {
          console.error("Gagal cek stok", error);
        } finally {
          setFetchingStock(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.kode) checkStockLogic();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.kode, formData.harga_satuan, formData.keluar, initialData]);

  // Handler saat memilih Batch Harga (Untuk Keluar)
  const handleSelectBatch = (batch) => {
    setFormData((prev) => ({
      ...prev,
      harga_satuan: batch.harga_satuan, // Set harga sesuai batch
      stock_awal: batch.stock_akhir, // Set stock awal sesuai sisa stok batch itu
    }));
    // Reset flag agar input stock_awal terkunci dan valid
    setIsPriceChanged(false);
    setIsFirstTransaction(false);
  };

  // Autocomplete Logic
  const handleKodeChange = (e) => {
    const value = e.target.value;
    handleChange(e);
    if (value && referensiBarang.length > 0) {
      const filtered = referensiBarang.filter(
        (item) =>
          (item.kode_barang &&
            item.kode_barang.toLowerCase().includes(value.toLowerCase())) ||
          (item.nama_barang &&
            item.nama_barang.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      kode: item.kode_barang,
      nama_barang: item.nama_barang,
      satuan_barang: item.satuan || "Pcs",
      harga_satuan: item.harga || 0,
    }));
    setShowSuggestions(false);
  };

  const stockAkhir =
    (parseInt(formData.stock_awal) || 0) +
    (parseInt(formData.masuk) || 0) -
    (parseInt(formData.keluar) || 0);
  const nilaiPersediaan = stockAkhir * (parseFloat(formData.harga_satuan) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit" : "Tambah"} Kartu Stock
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 relative" ref={wrapperRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kode *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="kode"
                  value={formData.kode}
                  onChange={handleKodeChange}
                  onFocus={() => {
                    if (formData.kode) setShowSuggestions(true);
                  }}
                  placeholder="Cari..."
                  className={`input-field pr-8 ${
                    errors.kode ? "border-red-500" : ""
                  }`}
                  autoComplete="off"
                  disabled={!!initialData}
                />
                <Search
                  size={16}
                  className="absolute right-3 top-3 text-gray-400"
                />
              </div>
              {showSuggestions &&
                filteredSuggestions.length > 0 &&
                !initialData && (
                  <div className="absolute top-full left-0 w-[200%] bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mt-1">
                    {filteredSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-bold text-gray-800 text-sm">
                          {item.kode_barang}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.nama_barang}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Barang
              </label>
              <input
                type="text"
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleChange}
                className="input-field bg-gray-50"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Satuan
              </label>
              <input
                type="text"
                name="satuan_barang"
                value={formData.satuan_barang}
                onChange={handleChange}
                className="input-field bg-gray-50"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal *
              </label>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className={`input-field ${
                  errors.tanggal ? "border-red-500" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Awal
                {fetchingStock && (
                  <span className="text-xs text-blue-500 ml-2">(Check...)</span>
                )}
              </label>
              <input
                type="number"
                name="stock_awal"
                value={formData.stock_awal}
                onChange={handleChange}
                placeholder="0"
                className={`input-field ${
                  !isFirstTransaction && !initialData && !isPriceChanged
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                min="0"
                disabled={
                  !isFirstTransaction && !initialData && !isPriceChanged
                }
              />
            </div>
          </div>

          {/* Row 3 (MASUK / KELUAR) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Masuk
              </label>
              <input
                type="number"
                name="masuk"
                value={formData.masuk}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>

            {/* KOLOM KELUAR DENGAN LOGIKA PILIH HARGA */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keluar
              </label>
              <input
                type="number"
                name="keluar"
                value={formData.keluar}
                onChange={handleChange}
                placeholder="0"
                className="input-field"
                min="0"
              />

              {/* DROPDOWN PILIH BATCH HARGA (Hanya Muncul jika Keluar diisi/fokus & ada batch) */}
              {!initialData && stockBatches.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                    <ChevronDown size={14} /> Pilih Sumber Harga:
                  </p>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {stockBatches.map((batch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBatch(batch)}
                        className={`text-left px-2 py-1.5 rounded border transition flex justify-between ${
                          Number(formData.harga_satuan) ===
                          Number(batch.harga_satuan)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span>
                          Rp{" "}
                          {Number(batch.harga_satuan).toLocaleString("id-ID")}
                        </span>
                        <span className="font-bold">
                          Sisa: {batch.stock_akhir}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Akhir
              </label>
              <input
                type="text"
                value={stockAkhir}
                className="input-field bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Row 4 */}
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
                className="input-field bg-gray-50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nilai Persediaan
              </label>
              <input
                type="text"
                value={nilaiPersediaan.toLocaleString("id-ID")}
                className="input-field bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows="3"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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
