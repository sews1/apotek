import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { 
    ExclamationTriangleIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldExclamationIcon,
    DocumentArrowDownIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [hasDownloadedData, setHasDownloadedData] = useState(false);
    const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation, 3: Final
    const passwordInput = useRef();
    const CONFIRMATION_TEXT = 'HAPUS AKUN SAYA';

    const { data, setData, delete: destroy, processing, reset, errors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
        setStep(1);
    };

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const downloadData = () => {
        window.open(route('profile.download'), '_blank');
        setHasDownloadedData(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setStep(1);
        setConfirmationText('');
        setHasDownloadedData(false);
        setShowPassword(false);
        reset();
    };

    const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;

    return (
        <section className={`space-y-6 ${className}`}>
            {/* Warning Section */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                    <ShieldExclamationIcon className="h-6 w-6 text-red-600 mt-1 mr-4" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                            Hapus Akun Permanen
                        </h3>
                        <div className="text-sm text-red-800 space-y-2">
                            <p>
                                Setelah akun Anda dihapus, <strong>semua data akan dihapus secara permanen</strong> dan tidak dapat dipulihkan.
                            </p>
                            <p>
                                Data yang akan dihapus meliputi:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>Informasi profil dan pengaturan akun</li>
                                <li>Riwayat aktivitas dan log keamanan</li>
                                <li>File yang diunggah termasuk foto profil</li>
                                <li>Preferensi dan kustomisasi</li>
                                <li>Semua data terkait akun lainnya</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Backup Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-blue-900 mb-2">
                            Unduh Data Anda
                        </h4>
                        <p className="text-sm text-blue-800 mb-4">
                            Sebelum menghapus akun, Anda dapat mengunduh salinan data Anda untuk arsip pribadi.
                        </p>
                        <button
                            type="button"
                            onClick={downloadData}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Unduh Data Saya
                        </button>
                        {hasDownloadedData && (
                            <div className="flex items-center mt-2 text-sm text-green-600">
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Data berhasil diunduh
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Button */}
            <div className="flex items-center justify-center pt-4">
                <DangerButton 
                    onClick={confirmUserDeletion}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-base font-semibold"
                >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Hapus Akun Saya
                </DangerButton>
            </div>

            {/* Confirmation Modal */}
            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="2xl">
                <div className="p-8">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        s < step ? 'bg-red-600 text-white' :
                                        s === step ? 'bg-red-100 text-red-600 border-2 border-red-600' :
                                        'bg-gray-200 text-gray-400'
                                    }`}>
                                        {s < step ? <CheckIcon className="h-4 w-4" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`w-16 h-1 mx-2 ${
                                            s < step ? 'bg-red-600' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Final Warning */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Apakah Anda yakin?
                            </h3>
                            
                            <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-red-900 mb-2">Peringatan Penting:</h4>
                                <ul className="text-sm text-red-800 space-y-1">
                                    <li>✗ Tindakan ini tidak dapat dibatalkan</li>
                                    <li>✗ Semua data akan hilang secara permanen</li>
                                    <li>✗ Anda tidak dapat memulihkan akun setelah dihapus</li>
                                    <li>✗ Akses ke semua layanan akan dicabut</li>
                                </ul>
                            </div>

                            <div className="flex items-center justify-between">
                                <SecondaryButton onClick={closeModal}>
                                    Batal
                                </SecondaryButton>
                                <DangerButton onClick={nextStep}>
                                    Ya, Saya Mengerti
                                </DangerButton>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Text Confirmation */}
                    {step === 2 && (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                                <ShieldExclamationIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Konfirmasi Penghapusan
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                Untuk melanjutkan, ketik <strong className="text-red-600">"{CONFIRMATION_TEXT}"</strong> pada kolom di bawah ini:
                            </p>

                            <div className="mb-6">
                                <TextInput
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    className="block w-full text-center font-mono"
                                    placeholder={CONFIRMATION_TEXT}
                                />
                                {confirmationText && !isConfirmationValid && (
                                    <p className="text-red-600 text-sm mt-2">
                                        Teks konfirmasi tidak sesuai
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <SecondaryButton onClick={prevStep}>
                                    Kembali
                                </SecondaryButton>
                                <DangerButton 
                                    onClick={nextStep}
                                    disabled={!isConfirmationValid}
                                >
                                    Lanjutkan
                                </DangerButton>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password Confirmation */}
                    {step === 3 && (
                        <form onSubmit={deleteUser} className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <TrashIcon className="h-8 w-8 text-red-600" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Konfirmasi Password
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                Masukkan password Anda untuk mengonfirmasi penghapusan akun:
                            </p>

                            <div className="mb-6">
                                <InputLabel htmlFor="password" value="Password" className="sr-only" />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="block w-full pr-10"
                                        placeholder="Masukkan password Anda"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-800">
                                    <strong>Langkah terakhir:</strong> Setelah Anda mengklik "Hapus Akun", 
                                    akun Anda akan dihapus secara permanen dan Anda akan keluar dari sistem.
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <SecondaryButton onClick={prevStep} disabled={processing}>
                                    Kembali
                                </SecondaryButton>
                                
                                <DangerButton 
                                    className="px-6 py-2"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Menghapus...
                                        </div>
                                    ) : (
                                        <>
                                            <TrashIcon className="h-4 w-4 mr-2" />
                                            Hapus Akun
                                        </>
                                    )}
                                </DangerButton>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </section>
    );
}