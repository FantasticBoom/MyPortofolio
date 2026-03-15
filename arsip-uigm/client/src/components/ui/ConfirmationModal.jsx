import { X, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', // 'danger' | 'success' | 'info' | 'warning'
  isLoading = false 
}) {
  if (!isOpen) return null;

  // Konfigurasi warna dan ikon berdasarkan tipe
  const config = {
    danger: {
      color: 'red',
      icon: <AlertTriangle size={32} className="text-red-600" />,
      btnColor: 'bg-red-600 hover:bg-red-700'
    },
    success: {
      color: 'green',
      icon: <CheckCircle size={32} className="text-green-600" />,
      btnColor: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      color: 'blue',
      icon: <HelpCircle size={32} className="text-blue-600" />,
      btnColor: 'bg-blue-600 hover:bg-blue-700'
    },
    warning: {
      color: 'yellow',
      icon: <AlertTriangle size={32} className="text-yellow-600" />,
      btnColor: 'bg-yellow-600 hover:bg-yellow-700 text-black'
    }
  };

  const theme = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 border border-gray-100">
        
        {/* Tombol Close di Pojok Kanan Atas */}
        <div className="absolute top-4 right-4">
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* Icon Bubble */}
          <div className={`mx-auto w-16 h-16 bg-${theme.color}-50 rounded-full flex items-center justify-center mb-6`}>
            {theme.icon}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {/* Tombol Batal */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition flex-1"
            >
              Batal
            </button>
            
            {/* Tombol Konfirmasi */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg transition flex-1 flex items-center justify-center gap-2 ${theme.btnColor} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Memproses...
                </>
              ) : (
                'Ya, Lanjutkan'
              )}
            </button>
          </div>
        </div>

        {/* Loading Bar (Hiasan opsional) */}
        {isLoading && (
          <div className="h-1 w-full bg-gray-100 overflow-hidden">
             <div className={`h-full bg-${theme.color}-500 animate-progress origin-left`}></div>
          </div>
        )}
      </div>
    </div>
  );
}