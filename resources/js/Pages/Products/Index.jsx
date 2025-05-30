import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Authenticated from '@/Layouts/Authenticated';

const stockStatusLabels = {
    out_of_stock: 'Habis',
    low_stock: 'Stok Rendah',
    in_stock: 'Tersedia',
    unknown: 'Tidak Diketahui',
};

const stockStatusClasses = {
    out_of_stock: 'bg-red-100 text-red-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    in_stock: 'bg-green-100 text-green-800',
    unknown: 'bg-gray-100 text-gray-800',
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
};

export default function Index() {
    const { products, auth } = usePage().props;

    return (
        <Authenticated user={auth.user}>
            <Head title="Produk" />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Daftar Produk</h1>
                    <Link
                        href={route('products.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                    >
                        + Tambah Produk
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-600 text-sm uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 text-left">Kode</th>
                                <th className="px-6 py-3 text-left">Nama Produk</th>
                                <th className="px-6 py-3 text-left">Kategori</th>
                                <th className="px-6 py-3 text-left">Harga Jual</th>
                                <th className="px-6 py-3 text-left">Stok</th>
                                <th className="px-6 py-3 text-left">Masuk</th>
                                <th className="px-6 py-3 text-left">Expired</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">{product.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {product.image && (
                                                <img
                                                    src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-full object-cover mr-3 border"
                                                />
                                            )}
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.category?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {product.selling_price.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.stock} {product.unit || ''}
                                        <div className="text-xs text-gray-500">Min: {product.min_stock}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(product.entry_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(product.expired_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${stockStatusClasses[product.stock_status] || stockStatusClasses.unknown}`}>
                                            {stockStatusLabels[product.stock_status] || stockStatusLabels.unknown}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Link
                                            href={route('products.edit', product.id)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                                                    Inertia.delete(route('products.destroy', product.id));
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada produk tersedia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Authenticated>
    );
}
