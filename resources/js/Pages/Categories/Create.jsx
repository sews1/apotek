import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        kode_prefix: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('categories.store'));
    };

    return (
        <Authenticated auth={auth} header="Tambah Kategori Baru">
            <Head title="Tambah Kategori Baru" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Tambah Kategori Baru</h2>
                        <p className="mt-1 text-sm text-blue-100">
                            Isi formulir berikut untuk menambahkan kategori produk baru
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        <div className="px-6 py-5 space-y-6">
                            {/* Nama Kategori */}
                            <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            id="name"
                                            className={`block w-full rounded-md ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Obat Bebas"
                                        />
                                        {errors.name && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Kode Produk */}
                                <div className="sm:col-span-6">
                                    <label htmlFor="kode_prefix" className="block text-sm font-medium text-gray-700">
                                        Kode Produk <span className="text-red-500">*</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            id="kode_prefix"
                                            className={`block w-full rounded-md uppercase ${errors.kode_prefix ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                                            value={data.kode_prefix}
                                            onChange={(e) => setData('kode_prefix', e.target.value.toUpperCase())}
                                            placeholder="Contoh: OBB"
                                        />
                                        {errors.kode_prefix && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {errors.kode_prefix && (
                                        <p className="mt-2 text-sm text-red-600">{errors.kode_prefix}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">Kode unik untuk identifikasi kategori (maksimal 10 karakter)</p>
                                </div>

                                {/* Deskripsi */}
                                <div className="sm:col-span-6">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Deskripsi
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="description"
                                            rows={3}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi kategori (opsional)"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Penjelasan singkat tentang kategori ini</p>
                                </div>

                                {/* Status Aktif */}
                                <div className="sm:col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="is_active"
                                                name="is_active"
                                                type="checkbox"
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="is_active" className="font-medium text-gray-700">
                                                Kategori Aktif
                                            </label>
                                            <p className="text-gray-500">Produk dalam kategori ini akan tampil di aplikasi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <Link
                                href={route('categories.index')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    processing ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Kategori'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}