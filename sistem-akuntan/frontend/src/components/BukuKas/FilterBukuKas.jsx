import { Calendar } from "lucide-react";

export const FilterBukuKas = ({ selectedPeriodId, onChange, periods = [] }) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar size={20} className="text-gray-600" />
      <label className="text-sm font-semibold text-gray-700">
        Filter Periode:
      </label>
      <select
        value={selectedPeriodId || ""}
        onChange={(e) => onChange(e.target.value)}
        className="input-field max-w-xs cursor-pointer bg-white"
      >
        <option value="">-- Pilih Periode --</option>
        {periods && periods.length > 0 ? (
          periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.nama_periode}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Tidak ada data periode
          </option>
        )}
      </select>
    </div>
  );
};
