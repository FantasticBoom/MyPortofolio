// src/components/ui/LoadingOverlay.jsx
import logoBgn from "../../assets/bgn.png";

export const LoadingOverlay = ({ message = "Memuat..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-slight">
        {/* Logo Berputar atau Berdenyut */}
        <img
          src={logoBgn}
          alt="Loading"
          className="w-16 h-16 object-contain animate-pulse mb-4"
        />

        {/* Spinner */}
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>

        <p className="text-gray-700 font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};
