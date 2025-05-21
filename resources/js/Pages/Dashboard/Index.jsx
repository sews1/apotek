import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head } from '@inertiajs/react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Icons (you can use an icon library like react-icons)
import { FiPackage, FiAlertTriangle, FiClock, FiShoppingCart, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard({
    auth,
    stats,
    recentSales = [],
    lowStockItems = [],
    nearExpiredItems = [],
    chartData,
}) {
    const [period, setPeriod] = useState('harian'); // 'harian', 'mingguan', 'bulanan', 'tahunan'

    // Fungsi untuk dapatkan nilai penjualan sesuai periode
    const getSalesValue = () => {
        switch (period) {
            case 'mingguan':
                return stats.weekly_sales ?? 0;
            case 'bulanan':
                return stats.monthly_sales ?? 0;
            case 'tahunan':
                return stats.yearly_sales ?? 0;
            case 'harian':
            default:
                return stats.today_sales ?? 0;
        }
    };

    // Fungsi untuk dapatkan nilai pendapatan sesuai periode
    const getRevenueValue = () => {
        switch (period) {
            case 'mingguan':
                return stats.weekly_revenue ?? 0;
            case 'bulanan':
                return stats.monthly_revenue ?? 0;
            case 'tahunan':
                return stats.yearly_revenue ?? 0;
            case 'harian':
            default:
                return stats.today_revenue ?? 0;
        }
    };

    // Helper untuk judul kartu sesuai periode
    const periodLabel = {
        harian: 'Hari Ini',
        mingguan: 'Minggu Ini',
        bulanan: 'Bulan Ini',
        tahunan: 'Tahun Ini',
    };

    return (
        <Authenticated auth={auth} header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Apotek</h1>
                        <p className="text-gray-500">Ringkasan aktivitas dan statistik apotek Anda</p>
                    </div>
                    
                    {/* Pilihan Periode */}
                    <div className="flex space-x-2 mt-4 md:mt-0">
                        {['harian', 'mingguan', 'bulanan', 'tahunan'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all
                                    ${
                                        period === p
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard 
                        title="Total Produk" 
                        value={stats.total_products} 
                        icon={<FiPackage className="w-5 h-5" />} 
                        trend="up" 
                        trendValue="5%" 
                        color="blue"
                    />
                    <StatCard
                        title="Stok Rendah"
                        value={stats.low_stock_products}
                        icon={<FiAlertTriangle className="w-5 h-5" />}
                        trend={stats.low_stock_products > 0 ? 'up' : 'down'}
                        trendValue={stats.low_stock_products > 0 ? `${stats.low_stock_products} perlu restock` : 'Aman'}
                        color="orange"
                    />
                    <StatCard
                        title="Produk Hampir Kadaluwarsa"
                        value={stats.near_expired_products}
                        icon={<FiClock className="w-5 h-5" />}
                        trend={stats.near_expired_products > 0 ? 'up' : 'down'}
                        trendValue={stats.near_expired_products > 0 ? `${stats.near_expired_products} hampir kadaluwarsa` : 'Aman'}
                        color="red"
                    />
                    <StatCard
                        title={`Penjualan ${periodLabel[period]}`}
                        value={getSalesValue()}
                        icon={<FiShoppingCart className="w-5 h-5" />}
                        trend="up"
                        trendValue="10%"
                        color="green"
                    />
                    <StatCard
                        title={`Pendapatan ${periodLabel[period]}`}
                        value={`Rp ${getRevenueValue().toLocaleString('id-ID')}`}
                        icon={<FiDollarSign className="w-5 h-5" />}
                        trend="up"
                        trendValue="15%"
                        color="purple"
                    />
                </div>

                {/* Grafik dan Informasi */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik Penjualan */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Grafik Penjualan 30 Hari Terakhir</h2>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                                    Export
                                </button>
                            </div>
                        </div>
                        <div className="h-80">
                            <Bar
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.05)',
                                            },
                                        },
                                        x: {
                                            grid: {
                                                display: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Panel Samping: Penjualan & Produk */}
                    <div className="space-y-6">
                        {/* Penjualan Terakhir */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Penjualan Terakhir</h2>
                                <span className="text-xs text-blue-600 font-medium">Lihat Semua</span>
                            </div>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                                {recentSales.length > 0 ? (
                                    recentSales.map((sale, index) => (
                                        <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">#{sale.invoice}</span>
                                                <span className="text-blue-600 font-semibold">
                                                    Rp {sale.total.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                <span className="truncate">{sale.customer}</span>
                                                <span className="mx-1">•</span>
                                                <span>{sale.date}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-2">Belum ada penjualan</div>
                                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            Buat Penjualan Baru
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Produk Stok Rendah */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Produk Stok Rendah</h2>
                                <span className="text-xs text-orange-600 font-medium">
                                    {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {lowStockItems.length > 0 ? (
                                    lowStockItems.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-orange-100 p-2 rounded-lg">
                                                    <FiPackage className="text-orange-600 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700 text-sm line-clamp-1">{product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.category} • {product.code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-red-600 font-bold text-xs text-right">
                                                <div>{product.stock} {product.unit}</div>
                                                <div className="text-orange-500 font-normal">min: {product.min_stock}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-2">Tidak ada produk stok rendah</div>
                                        <div className="text-xs text-green-600">Stok aman</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Produk Hampir Kadaluwarsa */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Produk Hampir Kadaluwarsa</h2>
                                <span className="text-xs text-red-600 font-medium">
                                    {nearExpiredItems.length} item{nearExpiredItems.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {nearExpiredItems.length > 0 ? (
                                    nearExpiredItems.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-red-100 p-2 rounded-lg">
                                                    <FiClock className="text-red-600 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700 text-sm line-clamp-1">{product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.category} • {product.code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-red-700 text-xs font-semibold text-right">
                                                <div>Exp:</div>
                                                <div>{product.expired_date}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-2">Tidak ada produk hampir kadaluwarsa</div>
                                        <div className="text-xs text-green-600">Semua produk aman</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

function StatCard({ title, value, icon, trend, trendValue, color = 'blue' }) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            iconBg: 'bg-blue-100',
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            iconBg: 'bg-green-100',
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            iconBg: 'bg-orange-100',
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            iconBg: 'bg-red-100',
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            iconBg: 'bg-purple-100',
        },
    };

    const trendColors = {
        up: {
            text: 'text-green-600',
            bg: 'bg-green-100',
            icon: <FiTrendingUp className="w-4 h-4" />
        },
        down: {
            text: 'text-red-600',
            bg: 'bg-red-100',
            icon: <FiTrendingDown className="w-4 h-4" />
        },
    };

    return (
        <div className={`${colorClasses[color].bg} rounded-xl p-4 hover:shadow-md transition-all cursor-default`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`${colorClasses[color].iconBg} rounded-lg p-3`}>
                    {icon}
                </div>
            </div>
            <div className={`mt-3 flex items-center text-xs font-medium ${trendColors[trend].text}`}>
                <span className="mr-1">{trendColors[trend].icon}</span>
                {trendValue}
            </div>
        </div>
    );
}