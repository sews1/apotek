import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, router } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

export default function Index({ auth, products, categories, filters }) {
    const stockStatusClasses = {
        in_stock: 'bg-green-100 text-green-800',
        low_stock: 'bg-yellow-100 text-yellow-800',
        out_of_stock: 'bg-red-100 text-red-800',
        unknown: 'bg-gray-100 text-gray-600',
    };
    
    const stockStatusLabels = {
        in_stock: 'Tersedia',
        low_stock: 'Stok Rendah',
        out_of_stock: 'Habis',
        unknown: 'Tidak Diketahui',
    };    

    const handleFilter = (key, value) => {
        router.get(route('products.index'), {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <Authenticated auth={auth} header="Manajemen Produk">
            <Head title="Manajemen Produk" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Daftar Produk</h2>
                    <Link 
                        href={route('products.create')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Tambah Produk
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Produk</label>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama/kode..."
                                className="w-full px-3 py-2 border rounded-md"
                                value={filters.search || ''}
                                onChange={(e) => handleFilter('search', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={filters.category || ''}
                                onChange={(e) => handleFilter('category', e.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Stok</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={filters.stock_status || ''}
                                onChange={(e) => handleFilter('stock_status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="in_stock">Tersedia</option>
                                <option value="low_stock">Stok Rendah</option>
                                <option value="out_of_stock">Habis</option>
                            </select>
                        </div> */}
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image && (
                                                    <img 
                                                        src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`} 
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatusClasses[product.stock_status] || stockStatusClasses.unknown}`}>
                                        {stockStatusLabels[product.stock_status] || stockStatusLabels.unknown}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link 
                                            href={route('products.edit', product.id)} 
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                                                    Inertia.delete(route('products.destroy', product.id));
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    {products.links && (
                        <nav className="flex items-center justify-between">
                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan <span className="font-medium">{products.from}</span> sampai <span className="font-medium">{products.to}</span> dari <span className="font-medium">{products.total}</span> produk
                                    </p>
                                </div>
                                <div>
                                    <div className="flex space-x-2">
                                        {products.links.map((link, index) => (
                                            <Link
                                                key={`pagination-link-${index}`}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </Authenticated>
    );
}
