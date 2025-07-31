import React, { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Edit({ auth, product, categories }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        code: product.code,
        name: product.name,
        category_id: product.category_id,
        description: product.description,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        stock: product.stock,
        min_stock: product.min_stock,
        unit: product.unit,
        entry_date: product.entry_date,
        expired_date: product.expired_date,
        image: null,
        is_active: product.is_active,
    });

    useEffect(() => {
        if (data.category_id) {
            fetch(`/api/products/last-code?category_id=${data.category_id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch code');
                    return res.json();
                })
                .then(result => {
                    if (result.code) {
                        setData('code', result.code);
                    }
                })
                .catch(() => {
                    setData('code', '');
                });
        }
    }, [data.category_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Authenticated auth={auth}>
            <Head title="Edit Produk" />
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Perbarui informasi produk di bawah ini
                        </p>
                    </div>
                    <Link
                        href={route('products.index')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Kembali ke Daftar Produk
                    </Link>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Category and Product Code */}
                        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                                    Kategori Produk <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-2 text-sm text-red-600">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                    Kode Produk <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code}</p>}
                            </div>
                        </div>

                        {/* Product Name and Description */}
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nama Produk <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Deskripsi Produk
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        {/* Pricing and Stock */}
                        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                                    Harga Beli <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="purchase_price"
                                        value={data.purchase_price}
                                        onChange={e => setData('purchase_price', e.target.value)}
                                        className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                {errors.purchase_price && <p className="mt-2 text-sm text-red-600">{errors.purchase_price}</p>}
                            </div>

                            <div>
                                <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                                    Harga Jual <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="selling_price"
                                        value={data.selling_price}
                                        onChange={e => setData('selling_price', e.target.value)}
                                        className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                {errors.selling_price && <p className="mt-2 text-sm text-red-600">{errors.selling_price}</p>}
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                    Stok Saat Ini <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.stock && <p className="mt-2 text-sm text-red-600">{errors.stock}</p>}
                            </div>

                            <div>
                                <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700">
                                    Stok Minimum <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="min_stock"
                                    value={data.min_stock}
                                    onChange={e => setData('min_stock', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.min_stock && <p className="mt-2 text-sm text-red-600">{errors.min_stock}</p>}
                            </div>
                        </div>

                        {/* Dates and Unit */}
                        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">
                                    Tanggal Masuk <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="entry_date"
                                    value={data.entry_date}
                                    onChange={e => setData('entry_date', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.entry_date && <p className="mt-2 text-sm text-red-600">{errors.entry_date}</p>}
                            </div>

                            <div>
                                <label htmlFor="expired_date" className="block text-sm font-medium text-gray-700">
                                    Tanggal Kadaluwarsa
                                </label>
                                <input
                                    type="date"
                                    id="expired_date"
                                    value={data.expired_date}
                                    onChange={e => setData('expired_date', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {errors.expired_date && <p className="mt-2 text-sm text-red-600">{errors.expired_date}</p>}
                            </div>

                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                                    Satuan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="unit"
                                    value={data.unit}
                                    onChange={e => setData('unit', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                                {errors.unit && <p className="mt-2 text-sm text-red-600">{errors.unit}</p>}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                    Produk Aktif/Tersedia
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}