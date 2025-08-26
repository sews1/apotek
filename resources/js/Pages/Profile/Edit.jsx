import Authenticated from '@/Layouts/Authenticated';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    UserIcon
} from '@heroicons/react/24/outline';

export default function Edit({ auth, status, flash, users = [] }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (status || flash?.success || flash?.error) {
            setShowAlert(true);
            if (status === 'profile-updated' || flash?.success) {
                setAlertType('success');
                setAlertMessage(flash?.success || 'Profile berhasil diperbarui!');
            } else if (flash?.error) {
                setAlertType('error');
                setAlertMessage(flash.error);
            }

            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [status, flash]);

    const dismissAlert = () => setShowAlert(false);

    return (
        <Authenticated
            auth={auth}
            header={
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-3xl text-gray-900 leading-tight">
                                Pengaturan Akun
                            </h2>
                            <p className="text-base text-gray-600 mt-1">
                                Informasi profil Anda (Read Only)
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Pengaturan Akun" />

            <div className="py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Alert Notification */}
                    {showAlert && (
                        <div className={`mb-6 rounded-xl shadow-lg border-l-4 ${
                            alertType === 'success' 
                                ? 'bg-green-100 border-green-400' 
                                : 'bg-red-100 border-red-400'
                        }`}>
                            <div className="flex items-center p-4">
                                <div className="flex-shrink-0">
                                    {alertType === 'success' ? (
                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-semibold ${
                                        alertType === 'success' ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                        {alertMessage}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={dismissAlert}
                                    className="ml-auto p-1.5 rounded-lg hover:bg-gray-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl mb-8 overflow-hidden">
                        <div className="px-8 py-8 text-white relative">
                            <div className="relative flex items-center space-x-6">
                                <div className="relative">
                                    <div className="h-20 w-20 rounded-full bg-white p-1 shadow-lg">
                                        {auth.user.avatar ? (
                                            <img 
                                                src={`/storage/${auth.user.avatar}`} 
                                                alt="Avatar" 
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="h-10 w-10 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold">{auth.user.name}</h1>
                                    <p className="text-sm opacity-90 mt-1">
                                        {auth.user.email}
                                        <span className="ml-3 px-2 py-0.5 rounded-full text-xs bg-green-500 text-white">
                                            {auth.user.role}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Informasi Profil - Read Only */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Profil</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama
                                    </label>
                                    <input
                                        type="text"
                                        value={auth.user.name}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={auth.user.email}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Daftar Pengguna (Owner Only) */}
                        {auth.user.role === 'owner' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
                                    <h3 className="text-lg font-semibold text-gray-900">Daftar Pengguna</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                                                        {user.role}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center">Belum ada pengguna terdaftar</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
