import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    UserIcon, 
    LockClosedIcon, 
    ExclamationCircleIcon,
    CameraIcon,
    ShieldCheckIcon,
    CalendarIcon,
    EnvelopeIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    Cog6ToothIcon,
    BellIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';

export default function Edit({ auth, mustVerifyEmail, status, flash }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [isUploading, setIsUploading] = useState(false);

    const tabs = [
        { id: 'profile', name: 'Profil', icon: UserIcon },
        { id: 'security', name: 'Keamanan', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifikasi', icon: BellIcon },
        { id: 'privacy', name: 'Privasi', icon: EyeIcon },
        { id: 'danger', name: 'Zona Bahaya', icon: ExclamationCircleIcon },
    ];

    useEffect(() => {
        if (status || flash?.success || flash?.error) {
            setShowAlert(true);
            if (status === 'profile-updated' || flash?.success) {
                setAlertType('success');
                setAlertMessage(flash?.success || 'Profile berhasil diperbarui!');
            } else if (status === 'password-updated') {
                setAlertType('success');
                setAlertMessage('Password berhasil diperbarui!');
            } else if (flash?.error) {
                setAlertType('error');
                setAlertMessage(flash.error);
            }

            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [status, flash]);

    const dismissAlert = () => {
        setShowAlert(false);
    };

    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            
            router.post(route('profile.update'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsUploading(false);
                },
                onError: () => {
                    setIsUploading(false);
                }
            });
        }
    };

    const handleRemoveAvatar = () => {
        router.delete(route('profile.avatar.remove'));
    };

    const handleDownloadData = () => {
        window.open(route('profile.download'), '_blank');
    };

    const handleResendVerification = () => {
        router.post(route('verification.send'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-3xl text-gray-900 leading-tight">
                                Pengaturan Akun
                            </h2>
                            <p className="text-base text-gray-600 mt-1">
                                Kelola informasi profil dan keamanan akun Anda
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleDownloadData}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Unduh Data
                            </button>
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
                                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400' 
                                : 'bg-gradient-to-r from-red-50 to-red-100 border-red-400'
                        } transform transition-all duration-300 ease-in-out`}>
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
                                    className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:scale-110 transition-transform ${
                                        alertType === 'success'
                                            ? 'text-green-600 hover:bg-green-200'
                                            : 'text-red-600 hover:bg-red-200'
                                    }`}
                                >
                                    <span className="sr-only">Tutup</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile Header Card */}
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl mb-8 overflow-hidden">
                        <div className="px-8 py-12 text-white relative">
                            <div className="absolute inset-0 bg-black opacity-20"></div>
                            <div className="relative flex items-center space-x-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                                        {auth.user.avatar ? (
                                            <img 
                                                src={`/storage/${auth.user.avatar}`} 
                                                alt="Avatar" 
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                                                <UserIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                                        <CameraIcon className="h-4 w-4 text-white" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold">{auth.user.name}</h1>
                                    <p className="text-lg opacity-90 flex items-center mt-2">
                                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                                        {auth.user.email}
                                        {auth.user.email_verified_at ? (
                                            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                Terverifikasi
                                            </span>
                                        ) : (
                                            <div className="ml-3 flex items-center space-x-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                                                    Belum Terverifikasi
                                                </span>
                                                <button
                                                    onClick={handleResendVerification}
                                                    className="text-xs underline hover:no-underline"
                                                >
                                                    Kirim Ulang
                                                </button>
                                            </div>
                                        )}
                                    </p>
                                    <p className="text-sm opacity-75 flex items-center mt-2">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        Bergabung sejak {new Date(auth.user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <nav className="space-y-1 p-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                activeTab === tab.id
                                                    ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <tab.icon className={`mr-3 h-5 w-5 ${
                                                activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'
                                            }`} />
                                            {tab.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Statistik Akun</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status Keamanan</span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            Aman
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Sesi Aktif</span>
                                        <span className="text-sm font-semibold text-gray-900">1</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Terakhir Login</span>
                                        <span className="text-sm font-semibold text-gray-900">Hari ini</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center">
                                                <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900">Informasi Profil</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Perbarui informasi profil dan alamat email akun Anda.
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <UpdateProfileInformationForm
                                                mustVerifyEmail={mustVerifyEmail}
                                                status={status}
                                            />
                                        </div>
                                    </div>

                                    {/* Avatar Management */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center">
                                                <CameraIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900">Foto Profil</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Kelola foto profil Anda. Format yang didukung: JPG, PNG, GIF (Max: 2MB)
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center space-x-6">
                                                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {auth.user.avatar ? (
                                                        <img 
                                                            src={`/storage/${auth.user.avatar}`} 
                                                            alt="Avatar" 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserIcon className="h-10 w-10 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                                            <CameraIcon className="h-4 w-4 mr-2" />
                                                            Ubah Foto
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={handleAvatarUpload}
                                                                disabled={isUploading}
                                                            />
                                                        </label>
                                                        {auth.user.avatar && (
                                                            <button
                                                                onClick={handleRemoveAvatar}
                                                                className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                            >
                                                                Hapus Foto
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        JPG, PNG atau GIF. Maksimal 2MB.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center">
                                                <LockClosedIcon className="h-5 w-5 text-green-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900">Keamanan Password</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Pastikan akun Anda menggunakan password yang kuat dan unik.
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <UpdatePasswordForm />
                                        </div>
                                    </div>

                                    {/* Two Factor Authentication */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center">
                                                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                <h3 className="text-lg font-semibold text-gray-900">Autentikasi Dua Faktor</h3>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Tambahkan lapisan keamanan ekstra untuk akun Anda.
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">Status 2FA</h4>
                                                    <p className="text-sm text-gray-600">Belum diaktifkan</p>
                                                </div>
                                                <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                                    Aktifkan 2FA
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Sessions */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <ComputerDesktopIcon className="h-5 w-5 text-purple-600 mr-2" />
                                                    <h3 className="text-lg font-semibold text-gray-900">Sesi Aktif</h3>
                                                </div>
                                                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                                                    Logout Semua Sesi
                                                </button>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Kelola perangkat yang masuk ke akun Anda.
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <ComputerDesktopIcon className="h-8 w-8 text-green-600" />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900">Sesi Saat Ini</h4>
                                                        <p className="text-sm text-gray-600">Chrome on Windows • Indonesia</p>
                                                        <p className="text-xs text-gray-500">Aktif sekarang</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex items-center">
                                            <BellIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-900">Preferensi Notifikasi</h3>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Kelola bagaimana Anda ingin menerima notifikasi.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {[
                                            { id: 'email_notifications', title: 'Notifikasi Email', desc: 'Terima notifikasi melalui email' },
                                            { id: 'security_alerts', title: 'Peringatan Keamanan', desc: 'Notifikasi aktivitas keamanan penting' },
                                            { id: 'marketing', title: 'Email Marketing', desc: 'Terima penawaran dan update produk' },
                                            { id: 'newsletter', title: 'Newsletter', desc: 'Terima newsletter berkala' },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked={item.id !== 'marketing'} />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <div className="flex items-center">
                                            <EyeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-gray-900">Pengaturan Privasi</h3>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Kontrol siapa yang dapat melihat informasi Anda.
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {[
                                            { id: 'profile_visibility', title: 'Visibilitas Profil', desc: 'Siapa yang dapat melihat profil Anda', options: ['Publik', 'Teman', 'Privat'] },
                                            { id: 'email_visibility', title: 'Visibilitas Email', desc: 'Siapa yang dapat melihat email Anda', options: ['Publik', 'Teman', 'Privat'] },
                                            { id: 'activity_status', title: 'Status Aktivitas', desc: 'Tampilkan status online Anda', options: ['Aktif', 'Nonaktif'] },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                                </div>
                                                <select className="mt-1 block w-32 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg">
                                                    {item.options.map((option) => (
                                                        <option key={option} value={option.toLowerCase()}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Danger Zone Tab */}
                            {activeTab === 'danger' && (
                                <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                                        <div className="flex items-center">
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                                            <h3 className="text-lg font-semibold text-red-900">Zona Bahaya</h3>
                                        </div>
                                        <p className="mt-1 text-sm text-red-600">
                                            Tindakan di bawah ini tidak dapat dibatalkan. Harap berhati-hati.
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <DeleteUserForm />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}