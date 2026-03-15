import { Package } from "lucide-react";
import { SummaryCard } from "../common/SummaryCard";

export const StockKeluarCard = ({ stockKeluar = 0, onClick }) => {
  return (
    <SummaryCard
      title="Stock Keluar Kemarin"
      value={`${stockKeluar} Unit`}
      icon={Package}
      color="orange"
      onClick={onClick}
    />
  );
};
