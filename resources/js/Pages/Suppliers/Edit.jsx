import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Edit({ auth, supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        items: supplier.items ? supplier.items.map(item => item.name).join(', ') : '', // ✅ prefill items jadi string
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    return (
        <Authenticated auth={auth} header="Edit Supplier">
            <Head title="Edit Supplier" />

            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Supplier</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat</label>
                        <textarea
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Items</label>
                        <textarea
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            placeholder="Pisahkan item dengan koma, misal: Paracetamol, Vitamin C"
                            value={data.item}
                            onChange={(e) => setData('item', e.target.value)}
                        />
                        {errors.item && <p className="text-red-600 text-sm mt-1">{errors.item}</p>}
                    </div>

                    <div className="flex justify-between">
                        <Link href={route('suppliers.index')} className="text-blue-600 hover:underline">
                            ← Kembali
                        </Link>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            disabled={processing}
                        >
                            Perbarui
                        </button>
                    </div>
                </form>
            </div>
        </Authenticated>
    );
}
