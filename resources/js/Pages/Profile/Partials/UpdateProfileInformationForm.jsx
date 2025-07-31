import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState } from 'react';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    EyeIcon,
    EyeSlashIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        birth_date: user.birth_date || '',
        company: user.company || '',
        job_title: user.job_title || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="name"
                                    className="block w-full pl-10"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    isFocused
                                    autoComplete="name"
                                />
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Alamat Email" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="block w-full pl-10"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <InputError className="mt-2" message={errors.email} />
                            
                            {mustVerifyEmail && user.email_verified_at === null && (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        Alamat email Anda belum diverifikasi.
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="ml-2 underline text-yellow-700 hover:text-yellow-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                        >
                                            Klik di sini untuk mengirim ulang email verifikasi.
                                        </Link>
                                    </p>
                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Link verifikasi baru telah dikirim ke alamat email Anda.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="Nomor Telepon" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    className="block w-full pl-10"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    autoComplete="tel"
                                    placeholder="+62 812 3456 7890"
                                />
                                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        <div>
                            <InputLabel htmlFor="location" value="Lokasi" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="location"
                                    className="block w-full pl-10"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Jakarta, Indonesia"
                                />
                                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <InputError className="mt-2" message={errors.location} />
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Informasi Profesional</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="company" value="Perusahaan" />
                            <TextInput
                                id="company"
                                className="mt-1 block w-full"
                                value={data.company}
                                onChange={(e) => setData('company', e.target.value)}
                                placeholder="PT. Teknologi Indonesia"
                            />
                            <InputError className="mt-2" message={errors.company} />
                        </div>

                        <div>
                            <InputLabel htmlFor="job_title" value="Jabatan" />
                            <TextInput
                                id="job_title"
                                className="mt-1 block w-full"
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                placeholder="Software Developer"
                            />
                            <InputError className="mt-2" message={errors.job_title} />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="website" value="Website" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="website"
                                    type="url"
                                    className="block w-full pl-10"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="https://www.example.com"
                                />
                                <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <InputError className="mt-2" message={errors.website} />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-green-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                            className="flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                            {showPersonalInfo ? (
                                <>
                                    <EyeSlashIcon className="h-4 w-4 mr-1" />
                                    Sembunyikan
                                </>
                            ) : (
                                <>
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    Tampilkan
                                </>
                            )}
                        </button>
                    </div>
                    
                    <Transition
                        show={showPersonalInfo}
                        enter="transition-opacity duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="birth_date" value="Tanggal Lahir" />
                                <div className="relative mt-1">
                                    <TextInput
                                        id="birth_date"
                                        type="date"
                                        className="block w-full pl-10"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                    />
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <InputError className="mt-2" message={errors.birth_date} />
                            </div>

                            <div>
                                <InputLabel htmlFor="bio" value="Bio" />
                                <textarea
                                    id="bio"
                                    rows={4}
                                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Ceritakan sedikit tentang diri Anda..."
                                />
                                <InputError className="mt-2" message={errors.bio} />
                                <p className="mt-1 text-xs text-gray-500">
                                    {data.bio.length}/500 karakter
                                </p>
                            </div>
                        </div>
                    </Transition>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Tersimpan.
                        </div>
                    </Transition>

                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                setData({
                                    name: user.name,
                                    email: user.email,
                                    phone: user.phone || '',
                                    bio: user.bio || '',
                                    location: user.location || '',
                                    website: user.website || '',
                                    birth_date: user.birth_date || '',
                                    company: user.company || '',
                                    job_title: user.job_title || '',
                                });
                            }}
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Reset
                        </button>

                        <PrimaryButton 
                            disabled={processing}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </div>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}