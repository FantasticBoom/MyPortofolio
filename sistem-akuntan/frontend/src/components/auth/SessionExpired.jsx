import { useAuth } from "../../context/authContext";

export const SessionExpired = () => {
  const { dismissSessionExpired } = useAuth();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-center mb-2">
          Session Berakhir
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.
          Silakan login kembali.
        </p>

        <button
          onClick={() => {
            dismissSessionExpired();
            window.location.href = "/login";
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Login Kembali
        </button>
      </div>
    </div>
  );
};
