import { Link } from '@inertiajs/react';

export default function Welcome({ canLogin, canRegister }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden text-slate-100">
            {/* Background Ornaments */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-float"></div>
                <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl animate-float-delay"></div>
                <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-float-delay-2"></div>
            </div>

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-10">
                {/* Logo + Title */}
                <div className="text-center mb-10">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM12 9v6m3-3H9" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-1">HERO FARMA</h1>
                    <p className="text-sm text-blue-200 font-light tracking-wider">SISTEM MANAJEMEN APOTEK DIGITAL</p>
                </div>

                {/* Description */}
                <p className="text-lg text-slate-300 text-center mb-10 leading-relaxed">
                    Kelola stok obat, transaksi, dan laporan keuangan dengan mudah dan real-time melalui platform apotek modern yang efisien dan aman.
                </p>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                    {canLogin && (
                        <Link
                            href="/login"
                            className="relative px-6 py-3 rounded-lg bg-slate-800 text-white font-medium text-base shadow hover:bg-slate-700 transition-all duration-300 hover:scale-105 group border border-slate-600"
                        >
                            <span className="relative z-10">Masuk ke Sistem</span>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shine-slow pointer-events-none" />
                        </Link>
                    )}
                    {canRegister && (
                        <Link
                            href="/register"
                            className="relative px-6 py-3 rounded-lg bg-white text-slate-900 font-medium text-base shadow hover:bg-gray-100 transition-all duration-300 hover:scale-105 group border border-slate-300"
                        >
                            <span className="relative z-10">Buat Akun Baru</span>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shine-slow pointer-events-none" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} <span className="text-blue-400 font-medium">ApotekCare Pro</span>. All rights reserved.</p>
            </footer>

            {/* Animation styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-15px) translateX(10px); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delay {
                    animation: float 10s ease-in-out infinite 2s;
                }
                .animate-float-delay-2 {
                    animation: float 12s ease-in-out infinite 4s;
                }
                @keyframes shine-slow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shine-slow::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    height: 100%;
                    width: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shine-slow 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
