import { Link } from '@inertiajs/react';

export default function Welcome({ canLogin, canRegister }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center items-center px-6 py-12">
            {/* Logo */}
            <img
                src="/images/apotek.jpg"
                alt="Logo Apotek"
                className="w-32 h-32 rounded-full shadow-lg mb-6 transition-transform transform hover:scale-105"
            />

            {/* Title */}
            <h1 className="text-5xl font-extrabold text-blue-800 text-center mb-4">
                Sistem Penjualan Apotek
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg text-center max-w-md mb-8">
                Selamat datang! Akses sistem untuk kelola produk, transaksi, dan laporan penjualan secara cepat dan efisien.
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                {canLogin && (
                    <Link
                        href="/login"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-105"
                    >
                        Login
                    </Link>
                )}
                {canRegister && (
                    <Link
                        href="/register"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
                    >
                        Daftar
                    </Link>
                )}
            </div>

            {/* Footer */}
            <footer className="mt-16 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Sistem Penjualan Apotek. All rights reserved.
            </footer>
        </div>
    );
}
