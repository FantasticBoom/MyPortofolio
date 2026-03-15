export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  onClick,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div
      onClick={onClick}
      className={`${colors[color]} border rounded-lg p-6 cursor-pointer hover:shadow-lg transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="text-3xl opacity-30">
            <Icon size={32} />
          </div>
        )}
      </div>
    </div>
  );
};
