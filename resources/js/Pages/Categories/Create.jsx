import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
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

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori*</label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Obat Bebas"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows="3"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi kategori (opsional)"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Kategori Aktif
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <Link
                                href={route('categories.index')}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                                    processing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}