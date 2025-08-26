import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Show({ auth, sale }) {
    return (
        <Authenticated auth={auth} header={`Detail Transaksi #${sale.invoice_number}`}>
            <Head title={`Detail Transaksi #${sale.invoice_number}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header Section */}
                    <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">Invoice #{sale.invoice_number}</h2>
                                <p className="text-blue-100 mt-1 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {sale.created_at_formatted}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Link 
                                    href={route('sales.index')}
                                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Kembali
                                </Link>
                                <a 
                                    href={route('sales.invoice', sale.id)}
                                    target="_blank"
                                    className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak Invoice
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Pelanggan</h3>
                                <p className="text-lg font-semibold">{sale.customer_name || <span className="text-gray-400">Tidak ada</span>}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Metode Pembayaran</h3>
                                <p className="text-lg font-semibold capitalize">{sale.payment_method}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pembayaran</h3>
                                <p className="text-2xl font-bold text-indigo-600">Rp {sale.total_formatted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Daftar Produk
                        </h3>
                        
                        <div className="overflow-x-auto">
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
                                    {sale.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.product_name}</div>
                                                <div className="text-sm text-gray-500">{item.product_code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">Rp {item.price_formatted}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{item.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Rp {item.subtotal_formatted}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">Total</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-indigo-600">Rp {sale.total_formatted}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}