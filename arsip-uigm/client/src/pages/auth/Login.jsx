import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowRight } from 'react-icons/fa';
import logoUigm from '../../assets/logo.png'; 
import bgUigm from '../../assets/uigm.jpg'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const res = await login(username, password);
        
        if (res.success) {
          navigate('/dashboard');
        } else {
            setError(res.message || 'Login gagal.');
            setIsLoading(false);
        }
      } catch (err) {
        setError('Terjadi kesalahan koneksi.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans bg-gray-900">
        
        {/* === LAYER 1: BACKGROUND CINEMATIC === */}
        <div className="absolute inset-0 z-0">
            <img 
                src={bgUigm} 
                alt="Background Campus" 
                className="w-full h-full object-cover animate-slow-zoom opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-slate-950/90 mix-blend-multiply" />
        </div>

        {/* === LAYER 2: DECORATIVE GLOW === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-overlay filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/20 rounded-full mix-blend-overlay filter blur-[100px] animate-pulse delay-700"></div>
        </div>

        {/* === LAYER 3: CONTENT CENTER === */}
        <div className="relative z-10 w-full max-w-[360px] px-3">
            
            {/* Header Logo: Ukuran diperkecil */}
            <div className="text-center mb-6 animate-fade-in-down">
                <img 
                    src={logoUigm} 
                    alt="Logo UIGM" 
                    // UPDATE: w-28 -> w-20
                    className="w-20 h-auto mx-auto mb-3 drop-shadow-xl transform hover:scale-105 transition-transform duration-300" 
                />
                {/* UPDATE: text-3xl -> text-2xl */}
                <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">
                    E-ARSIP <span className="text-yellow-400">UIGM</span>
                </h1>
                <p className="text-blue-200 text-xs mt-1 font-light tracking-wider uppercase">
                    Universitas Indo Global Mandiri
                </p>
            </div>

            {/* CARD LOGIN */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-6 relative overflow-hidden group animate-fade-in-up">
                
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-base font-semibold text-white mb-4 text-center border-b border-white/10 pb-3">
                        Silahkan Masuk E-Arsip App
                    </h2>

                    {error && (
                        <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 text-red-100 text-xs rounded-lg flex items-center gap-2 animate-shake backdrop-blur-sm">
                            <span className="text-base">⚠️</span> {error}
                        </div>
                    )}

                    {/* UPDATE: Spacing diperkecil space-y-5 -> space-y-4 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-blue-200 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within/input:text-white transition-colors">
                                    <FaUser className="text-sm" />
                                </div>
                                {/* UPDATE: py-3.5 -> py-2.5, text-sm */}
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2.5 bg-blue-950/40 border border-blue-400/30 rounded-lg text-sm text-white placeholder-blue-300/30 focus:bg-blue-900/60 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all duration-300 outline-none backdrop-blur-md"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-blue-200 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-300 group-focus-within/input:text-white transition-colors">
                                    <FaLock className="text-sm" />
                                </div>
                                {/* UPDATE: py-3.5 -> py-2.5, text-sm */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-9 pr-10 py-2.5 bg-blue-950/40 border border-blue-400/30 rounded-lg text-sm text-white placeholder-blue-300/30 focus:bg-blue-900/60 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all duration-300 outline-none backdrop-blur-md"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                // UPDATE: py-4 -> py-3, text-sm
                                className={`w-full relative overflow-hidden py-3 rounded-lg text-sm font-bold tracking-wide shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-yellow-500/20 cursor-pointer
                                ${isLoading 
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-blue-950 hover:from-yellow-400 hover:to-yellow-500'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            <span>Memverifikasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>MASUK SEKARANG</span>
                                            <FaArrowRight className="text-xs" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="text-center mt-6 text-blue-300/50 text-[10px] animate-fade-in-up delay-200">
                &copy; 2026 Biro Pelaksana Teknis. All Rights Reserved.
            </div>
        </div>
    </div>
  );
};

export default Login;