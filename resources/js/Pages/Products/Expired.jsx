import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Authenticated from '@/Layouts/Authenticated';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
};

export default function Expired() {
    const { products, auth } = usePage().props;

    return (
        <Authenticated user={auth.user}>
            <Head title="Produk Kadaluwarsa" />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Produk Kadaluwarsa</h1>
                    <Link
                        href={route('products.index')}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md shadow hover:bg-gray-700 transition"
                    >
                        &larr; Kembali ke Daftar Produk
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
                                <th className="px-6 py-3 text-left">Tanggal Expired</th>
                                <th className="px-6 py-3 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">{product.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.category?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {product.selling_price.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.stock} {product.unit || ''}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">{formatDate(product.expired_date)}</td>
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
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada produk kadaluwarsa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    {products.links && (
                        <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            {products.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        link.active ? 'z-10 bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </Authenticated>
    );
}
