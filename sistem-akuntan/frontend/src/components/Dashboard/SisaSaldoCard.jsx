import { Wallet, ChevronRight } from "lucide-react";
import { SummaryCard } from "../common/SummaryCard";
import { formatCurrency } from "../../utils/formatCurrency";

export const SisaSaldoCard = ({ sisaSaldo = 0, onClick }) => {
  return (
    <SummaryCard
      title="Sisa Saldo"
      value={formatCurrency(sisaSaldo)}
      icon={Wallet}
      color="blue"
      onClick={onClick}
    />
  );
};
