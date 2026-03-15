import { useState, useEffect } from "react";
import { Search, Loader } from "lucide-react";
import kartuStockService from "../../services/kartuStockService";

export const FilterKartuStock = ({
  selectedKode,
  onChange,
  loading: parentLoading,
}) => {
  const [kodeOptions, setKodeOptions] = useState([]);
  const [loadingKode, setLoadingKode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchKodeList();
  }, []);

  const fetchKodeList = async () => {
    try {
      setLoadingKode(true);
      const result = await kartuStockService.getKodeList();
      if (result.success) {
        setKodeOptions(result.data);
      }
    } catch (err) {
      console.error("Error fetching kode list:", err);
    } finally {
      setLoadingKode(false);
    }
  };

  const filteredOptions = kodeOptions.filter(
    (item) =>
      item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_barang &&
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex items-center gap-2">
      <Search size={20} className="text-gray-600" />
      <label className="text-sm font-semibold text-gray-700">
        Filter Kode Barang:
      </label>
      <div className="relative flex-1 max-w-xs">
        {loadingKode ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Cari kode atau nama barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
            {searchTerm && filteredOptions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredOptions.map((item) => (
                  <button
                    key={item.kode}
                    type="button"
                    onClick={() => {
                      onChange(item.kode);
                      setSearchTerm("");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition border-b last:border-b-0"
                  >
                    <div className="font-semibold">{item.kode}</div>
                    <div className="text-sm text-gray-600">
                      {item.nama_barang}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {selectedKode && (
        <button
          onClick={() => {
            onChange("");
            setSearchTerm("");
          }}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
        >
          Clear
        </button>
      )}
    </div>
  );
};
