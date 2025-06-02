import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Login - Hero Farma" />

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
                        <p className="text-sm text-blue-200 font-light tracking-wider">SISTEM MANAJEMEN APOTEK DIGITAL</p>
                    </div>

                    {status && (
                        <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center text-green-300 text-sm font-medium">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-white-300 font-medium text-sm mb-1" />
                            <div className="relative">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pl-10"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <InputError message={errors.email} className="mt-1 text-red-300" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-white-300 font-medium text-sm mb-1" />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 pl-10"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <InputError message={errors.password} className="mt-1 text-red-300" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-300">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-2">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition duration-200"
                                >
                                    Lupa password?
                                </Link>
                            )}
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
                                    Memproses...
                                </span>
                            ) : 'Masuk'}
                        </PrimaryButton>
                    </form>

                    <div className="text-center text-sm text-gray-400">
                        Belum punya akun?{' '}
                        <Link href={route('register')} className="text-blue-400 hover:text-blue-300 transition duration-200 font-medium">
                            Daftar sekarang
                        </Link>
                    </div>
                </div>

                {/* Animation styles */}
                <style jsx>{`
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