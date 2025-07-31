import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function SupplierShow({ auth, supplier, items_array }) {
    return (
        <Authenticated auth={auth} header={`Detail Supplier: ${supplier.name}`}>
            <Head title={`Supplier ${supplier.name}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Detail Supplier</h3>
                            <Link
                                href={route('suppliers.index')}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Nama Supplier</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Nomor Telepon</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.phone || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.email || '-'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.contact_person || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-500">Alamat</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.address || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-gray-500">Catatan</h4>
                                <p className="mt-1 text-sm text-gray-900">{supplier.notes || '-'}</p>
                            </div>
                            {items_array.length > 0 && (
                                <div className="md:col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500">Items ({items_array.length})</h4>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {items_array.map((item, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex space-x-3">
                            <Link
                                href={route('suppliers.edit', supplier.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                            >
                                Edit Supplier
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}