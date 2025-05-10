import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Form({ auth, product = null, categories }) {
    const { data, setData, post, put, processing, errors } = useForm({
        code: product?.code || '',
        name: product?.name || '',
        category_id: product?.category_id || '',
        description: product?.description || '',
        purchase_price: product?.purchase_price || 0,
        selling_price: product?.selling_price || 0,
        stock: product?.stock || 0,
        min_stock: product?.min_stock || 5,
        unit: product?.unit || '',
        barcode: product?.barcode || '',
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (product) {
            put(route('products.update', product.id));
        } else {
            post(route('products.store'));
        }
    };

    const handleImageChange = (e) => {
        setData('image', e.target.files[0]);
    };

    return (
        <Authenticated auth={auth} header={product ? 'Edit Produk' : 'Tambah Produk'}>
            <Head title={product ? 'Edit Produk' : 'Tambah Produk'} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Produk*</label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md ${errors.code ? 'border-red-500' : ''}`}
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                    />
                                    {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk*</label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori*</label>
                                    <select
                                        className={`w-full px-3 py-2 border rounded-md ${errors.category_id ? 'border-red-500' : ''}`}
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows="3"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli*</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-md ${errors.purchase_price ? 'border-red-500' : ''}`}
                                            value={data.purchase_price}
                                            onChange={(e) => setData('purchase_price', parseFloat(e.target.value) || 0)}
                                        />
                                        {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual*</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-md ${errors.selling_price ? 'border-red-500' : ''}`}
                                            value={data.selling_price}
                                            onChange={(e) => setData('selling_price', parseFloat(e.target.value) || 0)}
                                        />
                                        {errors.selling_price && <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok*</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-md ${errors.stock ? 'border-red-500' : ''}`}
                                            value={data.stock}
                                            onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum*</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={`w-full px-3 py-2 border rounded-md ${errors.min_stock ? 'border-red-500' : ''}`}
                                            value={data.min_stock}
                                            onChange={(e) => setData('min_stock', parseInt(e.target.value) || 5)}
                                        />
                                        {errors.min_stock && <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Satuan*</label>
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md ${errors.unit ? 'border-red-500' : ''}`}
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                    />
                                    {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                                    <input
                                        type="file"
                                        className="w-full px-3 py-2 border rounded-md"
                                        onChange={handleImageChange}
                                    />
                                    {product?.image && (
                                        <div className="mt-2">
                                            <img 
                                                src={`/storage/${product.image}`} 
                                                alt="Current product" 
                                                className="h-20 object-contain"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Gambar saat ini</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <Link
                                href={route('products.index')}
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
                                {processing ? 'Menyimpan...' : 'Simpan Produk'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}