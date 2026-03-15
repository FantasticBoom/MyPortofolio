export const Badge = ({ children, variant = "gray", className = "" }) => {
  const variants = {
    gray: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
