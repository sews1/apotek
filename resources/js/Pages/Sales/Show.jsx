import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Show({ auth, sale }) {
    return (
        <Authenticated auth={auth} header={`Detail Transaksi #${sale.invoice_number}`}>
            <Head title={`Detail Transaksi #${sale.invoice_number}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">Invoice #{sale.invoice_number}</h2>
                                <p className="text-gray-600 mt-1">
                                    {sale.created_at_formatted} • {sale.user.name}
                                </p>
                            </div>
                            <div className="space-x-2">
                                <Link 
                                    href={route('sales.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Kembali
                                </Link>
                                <a 
                                    href={route('sales.invoice', sale.id)}
                                    target="_blank"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Cetak Invoice
                                </a>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Pelanggan</h3>
                                <p>{sale.customer_name || '-'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Metode Pembayaran</h3>
                                <p className="capitalize">{sale.payment_method}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                                <p className="text-xl font-bold">Rp {sale.total_formatted}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">Daftar Produk</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sale.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium">{item.product_name}</div>
                                            <div className="text-sm text-gray-500">{item.product_code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">Rp {item.price_formatted}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">Rp {item.subtotal_formatted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}