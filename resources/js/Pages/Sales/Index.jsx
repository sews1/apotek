import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import { FaEye, FaFileInvoice } from 'react-icons/fa';

export default function Index({ auth, sales, filters }) {
    return (
        <Authenticated auth={auth} header="Daftar Penjualan">
            <Head title="Daftar Penjualan" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Riwayat Transaksi</h2>
                    <Link 
                        href={route('sales.create')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
                    >
                        Transaksi Baru
                    </Link>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Invoice</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Pembayaran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sales.data.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">{sale.invoice_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(sale.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{sale.customer_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        Rp {sale.total.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{sale.payment_method}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                        <Link 
                                            href={route('sales.show', sale.id)} 
                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                        >
                                            <FaEye className="mr-1" /> Detail
                                        </Link>
                                        <a 
                                            href={route('sales.invoice', sale.id)} 
                                            target="_blank"
                                            className="text-green-600 hover:text-green-900 flex items-center"
                                        >
                                            <FaFileInvoice className="mr-1" /> Invoice
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Authenticated>
    );
}
