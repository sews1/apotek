import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register - Hero Farma" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 px-4 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-float"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl animate-float-delay"></div>
                    <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-float-delay-2"></div>
                </div>

                <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8 space-y-6 z-10">
                    {/* Logo & Title */}
                    <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM12 9v6m3-3H9" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-1">HERO FARMA</h1>
                        <p className="text-sm text-blue-200 font-light tracking-wider">BUAT AKUN BARU</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" className="text-white" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama Lengkap"
                            />
                            <InputError message={errors.name} className="mt-1 text-red-300" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-white" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} className="mt-1 text-red-300" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-white" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-1 text-red-300" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-white" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Peran" className="text-white" />
                            <select
                                id="role"
                                name="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="mt-1 block w-full bg-white/5 border border-white/10 text-black rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            >
                                <option value="admin">Admin</option>
                                <option value="warehouse">Gudang</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>

                        <PrimaryButton
                            className="w-full justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mendaftarkan...
                                </span>
                            ) : 'Daftar'}
                        </PrimaryButton>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="text-blue-400 hover:text-blue-300 transition duration-200 font-medium">
                            Masuk disini
                        </Link>
                    </div>
                </div>

                {/* Animation styles */}
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0) translateX(0); }
                        50% { transform: translateY(-20px) translateX(10px); }
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
                `}</style>
            </div>
        </>
    );
}
