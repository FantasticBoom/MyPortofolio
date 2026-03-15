import { useState, useEffect } from "react";
import { Calendar, Loader } from "lucide-react";
import biayaOperasionalService from "../../services/biayaOperasionalService";

// --- PERUBAHAN LABEL DI SINI ---
const JENIS_BIAYA_OPTIONS = [
  { value: "", label: "Semua Jenis Biaya" },
  { value: "biaya_sewa", label: "Insentif Mitra" }, // Label diubah, value tetap
  { value: "biaya_operasional", label: "Biaya Operasional" },
  { value: "biaya_bahan_baku", label: "Biaya Bahan Baku" },
];

export const FilterBiayaOperasional = ({
  periode,
  jenis_biaya,
  onPeriodeChange,
  onJenisChange,
}) => {
  const [periods, setPeriods] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoadingPeriods(true);
      const result = await biayaOperasionalService.getPeriods();
      if (result.success) {
        setPeriods(result.data);
      }
    } catch (err) {
      console.error("Error fetching periods:", err);
    } finally {
      setLoadingPeriods(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-gray-600" />
        <label className="text-sm font-semibold text-gray-700">
          Filter Periode:
        </label>
        {loadingPeriods ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <Loader size={16} className="animate-spin" />
          </div>
        ) : (
          <select
            value={periode}
            onChange={(e) => onPeriodeChange(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">Pilih Periode</option>
            {periods.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_periode}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">
          Jenis Biaya:
        </label>
        <select
          value={jenis_biaya}
          onChange={(e) => onJenisChange(e.target.value)}
          className="input-field max-w-xs"
          disabled={!periode}
        >
          {JENIS_BIAYA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
