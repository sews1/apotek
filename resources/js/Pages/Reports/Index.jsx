import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function ReportIndex({ auth, weeklySales, monthlySales, yearlySales, productReports }) {
    const [activeTab, setActiveTab] = useState('weekly');

    const renderSales = (salesData) => (
        <table className="w-full text-sm text-left text-gray-600 border mt-4">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                    <th className="px-4 py-2 border">Tanggal</th>
                    <th className="px-4 py-2 border">Invoice</th>
                    <th className="px-4 py-2 border">Pelanggan</th>
                    <th className="px-4 py-2 border">Total</th>
                </tr>
            </thead>
            <tbody>
                {salesData.map((sale, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-2 border">{sale.date}</td>
                        <td className="px-4 py-2 border">{sale.invoice}</td>
                        <td className="px-4 py-2 border">{sale.customer}</td>
                        <td className="px-4 py-2 border">Rp {sale.total.toLocaleString('id-ID')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderProducts = () => (
        <table className="w-full text-sm text-left text-gray-600 border mt-4">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                    <th className="px-4 py-2 border">Kode</th>
                    <th className="px-4 py-2 border">Nama Produk</th>
                    <th className="px-4 py-2 border">Kategori</th>
                    <th className="px-4 py-2 border">Stok</th>
                    <th className="px-4 py-2 border">Terjual</th>
                </tr>
            </thead>
            <tbody>
                {productReports.map((product, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-2 border">{product.code}</td>
                        <td className="px-4 py-2 border">{product.name}</td>
                        <td className="px-4 py-2 border">{product.category}</td>
                        <td className="px-4 py-2 border">{product.stock}</td>
                        <td className="px-4 py-2 border">{product.sold}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <Authenticated auth={auth} header="Laporan">
            <Head title="Laporan Penjualan" />

            <div className="space-x-3 mb-4">
                <button onClick={() => setActiveTab('weekly')} className={tabClass(activeTab === 'weekly')}>Mingguan</button>
                <button onClick={() => setActiveTab('monthly')} className={tabClass(activeTab === 'monthly')}>Bulanan</button>
                <button onClick={() => setActiveTab('yearly')} className={tabClass(activeTab === 'yearly')}>Tahunan</button>
                <button onClick={() => setActiveTab('products')} className={tabClass(activeTab === 'products')}>Produk Obat</button>
            </div>

            <div className="bg-white p-6 rounded shadow border border-gray-100">
                {activeTab === 'weekly' && (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Laporan Penjualan Mingguan</h2>
                        {renderSales(weeklySales)}
                    </>
                )}
                {activeTab === 'monthly' && (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Laporan Penjualan Bulanan</h2>
                        {renderSales(monthlySales)}
                    </>
                )}
                {activeTab === 'yearly' && (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Laporan Penjualan Tahunan</h2>
                        {renderSales(yearlySales)}
                    </>
                )}
                {activeTab === 'products' && (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Laporan Produk Obat</h2>
                        {renderProducts()}
                    </>
                )}
            </div>
        </Authenticated>
    );
}

function tabClass(active) {
    return `px-4 py-2 rounded-md text-sm font-medium transition ${
        active
            ? 'bg-blue-600 text-white shadow'
            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
    }`;
}
