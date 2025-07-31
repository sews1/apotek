import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { 
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const checkPasswordStrength = (password) => {
        const criteria = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        setPasswordCriteria(criteria);
        
        const strength = Object.values(criteria).reduce((acc, met) => acc + (met ? 1 : 0), 0);
        setPasswordStrength(strength);
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        if (passwordStrength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 2) return 'Lemah';
        if (passwordStrength <= 3) return 'Sedang';
        if (passwordStrength <= 4) return 'Kuat';
        return 'Sangat Kuat';
    };

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPasswordStrength(0);
                setPasswordCriteria({
                    minLength: false,
                    hasUppercase: false,
                    hasLowercase: false,
                    hasNumber: false,
                    hasSpecialChar: false
                });
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                {/* Current Password */}
                <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <LockClosedIcon className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Password Saat Ini</h3>
                    </div>

                    <div>
                        <InputLabel htmlFor="current_password" value="Password Saat Ini" />
                        <div className="relative mt-1">
                            <TextInput
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type={showCurrentPassword ? 'text' : 'password'}
                                className="block w-full pr-10"
                                autoComplete="current-password"
                                placeholder="Masukkan password saat ini"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>
                </div>

                {/* New Password */}
                <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Password Baru</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="password" value="Password Baru" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        checkPasswordStrength(e.target.value);
                                    }}
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="block w-full pr-10"
                                    autoComplete="new-password"
                                    placeholder="Masukkan password baru"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />

                            {/* Password Strength Indicator */}
                            {data.password && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Kekuatan Password:
                                        </span>
                                        <span className={`text-sm font-semibold ${
                                            passwordStrength <= 2 ? 'text-red-600' :
                                            passwordStrength <= 3 ? 'text-yellow-600' :
                                            passwordStrength <= 4 ? 'text-blue-600' :
                                            'text-green-600'
                                        }`}>
                                            {getStrengthText()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Password Criteria */}
                            {data.password && (
                                <div className="mt-4 p-4 bg-white rounded-lg border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Kriteria Password:</h4>
                                    <div className="space-y-2">
                                        {[
                                            { key: 'minLength', text: 'Minimal 8 karakter' },
                                            { key: 'hasUppercase', text: 'Huruf kapital (A-Z)' },
                                            { key: 'hasLowercase', text: 'Huruf kecil (a-z)' },
                                            { key: 'hasNumber', text: 'Angka (0-9)' },
                                            { key: 'hasSpecialChar', text: 'Karakter khusus (!@#$%^&*)' }
                                        ].map((criterion) => (
                                            <div key={criterion.key} className="flex items-center">
                                                {passwordCriteria[criterion.key] ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                                                ) : (
                                                    <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
                                                )}
                                                <span className={`text-sm ${
                                                    passwordCriteria[criterion.key] ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    {criterion.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="block w-full pr-10"
                                    autoComplete="new-password"
                                    placeholder="Konfirmasi password baru"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />

                            {/* Password Match Indicator */}
                            {data.password_confirmation && data.password && (
                                <div className="mt-2">
                                    {data.password === data.password_confirmation ? (
                                        <div className="flex items-center text-sm text-green-600">
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                            Password cocok
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-sm text-red-600">
                                            <XMarkIcon className="h-4 w-4 mr-1" />
                                            Password tidak cocok
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Tips */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Tips Keamanan:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                                <li>• Hindari informasi personal seperti nama atau tanggal lahir</li>
                                <li>• Jangan gunakan password yang sama di platform lain</li>
                                <li>• Ganti password secara berkala setiap 3-6 bulan</li>
                            </ul>
                        </div>
                    </div>
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
                            Password berhasil diperbarui.
                        </div>
                    </Transition>

                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setPasswordStrength(0);
                                setPasswordCriteria({
                                    minLength: false,
                                    hasUppercase: false,
                                    hasLowercase: false,
                                    hasNumber: false,
                                    hasSpecialChar: false
                                });
                            }}
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Reset
                        </button>

                        <PrimaryButton 
                            disabled={processing || passwordStrength < 3}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Memperbarui...
                                </div>
                            ) : (
                                'Perbarui Password'
                            )}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}