import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function SupplierIndex({ auth, suppliers }) {
    return (
        <Authenticated auth={auth} header="Data Supplier">
            <Head title="Supplier" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Daftar Supplier</h2>
                    <Link
                        href={route('suppliers.create')}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        + Tambah Supplier
                    </Link>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada data supplier.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="px-6 py-4 text-sm text-gray-800">{supplier.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{supplier.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800">{supplier.address}</td>
                                        <td className="px-6 py-4 text-sm text-right space-x-2">
                                            <Link
                                                href={route('suppliers.edit', supplier.id)}
                                                className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                as="button"
                                                method="delete"
                                                href={route('suppliers.destroy', supplier.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                            >
                                                Hapus
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Authenticated>
    );
}
