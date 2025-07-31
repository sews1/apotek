import { useRef, useState, useEffect } from 'react';
import { CameraIcon, XMarkIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { router } from '@inertiajs/react';

export default function ProfilePhotoUpload({ user }) {
    const [photoPreview, setPhotoPreview] = useState(null);
    const [croppedPhoto, setCroppedPhoto] = useState(null);
    const [cropper, setCropper] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const cropperRef = useRef(null);

    // Set initial preview to current profile photo
    useEffect(() => {
        if (user.profile_photo_url) {
            setPhotoPreview(user.profile_photo_url);
        }
    }, [user.profile_photo_url]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.match('image.*')) {
            setUploadError('Hanya file gambar yang diperbolehkan (JPEG, PNG)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setUploadError('Ukuran file maksimal 2MB');
            return;
        }

        setUploadError(null);
        setUploadSuccess(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const getCropData = () => {
        if (typeof cropper !== 'undefined') {
            setCroppedPhoto(cropper.getCroppedCanvas().toDataURL());
        }
    };

    const handleCrop = () => {
        getCropData();
    };

    const handleSave = async () => {
        if (!croppedPhoto) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            // Convert data URL to blob
            const blob = await fetch(croppedPhoto).then(res => res.blob());
            
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('profile_photo', blob, 'profile.jpg');
            formData.append('_method', 'PUT');

            // Submit to server
            router.post(route('profile-photo.update'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setUploadSuccess(true);
                    setTimeout(() => setUploadSuccess(false), 3000);
                },
                onError: (errors) => {
                    setUploadError(errors.profile_photo || 'Gagal mengunggah foto profil');
                },
                onFinish: () => {
                    setIsUploading(false);
                }
            });
        } catch (error) {
            setUploadError('Terjadi kesalahan saat memproses gambar');
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = () => {
        router.delete(route('profile-photo.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                setCroppedPhoto(null);
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
            },
        });
    };

    const resetPhoto = () => {
        setPhotoPreview(user.profile_photo_url);
        setCroppedPhoto(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 mb-6">
            <div className="p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CameraIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">Foto Profil</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Unggah foto baru untuk memperbarui foto profil Anda.
                        </p>

                        <div className="mt-6">
                            {/* Current Profile Photo Preview */}
                            <div className="flex items-center space-x-6">
                                <div className="shrink-0">
                                    {photoPreview ? (
                                        <img 
                                            className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" 
                                            src={croppedPhoto || photoPreview} 
                                            alt="Current profile" 
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Upload Controls */}
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        <CameraIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                        {photoPreview ? 'Ganti Foto' : 'Unggah Foto'}
                                    </button>
                                    
                                    {photoPreview && (
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={resetPhoto}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                                <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                                Reset
                                            </button>
                                            {user.profile_photo_path && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Image Cropper */}
                            {photoPreview && !croppedPhoto && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Potong Foto</h4>
                                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                        <Cropper
                                            ref={cropperRef}
                                            src={photoPreview}
                                            style={{ height: 256, width: '100%' }}
                                            aspectRatio={1}
                                            guides={true}
                                            viewMode={1}
                                            minCropBoxHeight={100}
                                            minCropBoxWidth={100}
                                            background={false}
                                            responsive={true}
                                            autoCropArea={0.8}
                                            checkOrientation={false}
                                            onInitialized={(instance) => {
                                                setCropper(instance);
                                            }}
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCrop}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            Potong Gambar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Save Button for Cropped Image */}
                            {croppedPhoto && (
                                <div className="mt-6 flex items-center justify-end space-x-3">
                                    {uploadSuccess && (
                                        <div className="flex items-center text-sm text-green-600">
                                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                                            Foto profil berhasil diperbarui!
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={resetPhoto}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isUploading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengunggah...
                                            </>
                                        ) : (
                                            'Simpan Perubahan'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Error Message */}
                            {uploadError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                    {uploadError}
                                </div>
                            )}

                            {/* Help Text */}
                            <div className="mt-4 text-sm text-gray-500">
                                <p>Format yang didukung: JPEG, PNG (maksimal 2MB).</p>
                                <p>Foto akan ditampilkan sebagai lingkaran. Pastikan subjek berada di tengah.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}