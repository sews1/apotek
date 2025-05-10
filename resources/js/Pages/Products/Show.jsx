import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Show({ auth, product }) {
    const stockStatusClass = {
        in_stock: 'bg-green-100 text-green-800',
        low_stock: 'bg-yellow-100 text-yellow-800',
        out_of_stock: 'bg-red-100 text-red-800',
    };

    const stockStatusLabel = {
        in_stock: 'Tersedia',
        low_stock: 'Stok Rendah',
        out_of_stock: 'Habis',
    };

    return (
        <Authenticated auth={auth} header={`Detail Produk - ${product.name}`}>
            <Head title={`Detail Produk - ${product.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">{product.name}</h2>
                                <p className="text-gray-600 mt-1">{product.code}</p>
                            </div>
                            <div className="space-x-2">
                                <Link 
                                    href={route('products.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Kembali
                                </Link>
                                <Link 
                                    href={route('products.edit', product.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                {product.image && (
                                    <img 
                                        src={`/storage/${product.image}`} 
                                        alt={product.name}
                                        className="w-full h-64 object-contain rounded-lg border"
                                    />
                                )}
                            </div>
                            <div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Kategori</h3>
                                        <p>{product.category.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
                                        <p>{product.description || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Harga Beli</h3>
                                            <p>Rp {product.purchase_price.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Harga Jual</h3>
                                            <p>Rp {product.selling_price.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Stok</h3>
                                            <p>{product.stock} {product.unit}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Stok Minimum</h3>
                                            <p>{product.min_stock} {product.unit}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Status Stok</h3>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatusClass[product.stock_status]}`}>
                                            {stockStatusLabel[product.stock_status]}
                                        </span>
                                    </div>
                                    {product.barcode && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Barcode</h3>
                                            <p>{product.barcode}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}