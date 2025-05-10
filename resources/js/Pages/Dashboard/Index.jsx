import React from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({ auth, stats, recentSales, lowStockItems, chartData }) {
    return (
        <Authenticated auth={auth} header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Statistik Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Produk" 
                        value={stats.total_products} 
                        icon="💊"
                        trend="up"
                        trendValue="5%"
                    />
                    <StatCard 
                        title="Stok Rendah" 
                        value={stats.low_stock_products} 
                        icon="⚠️"
                        trend={stats.low_stock_products > 0 ? 'up' : 'down'}
                        trendValue={stats.low_stock_products > 0 ? `${stats.low_stock_products} perlu restock` : 'Aman'}
                    />
                    <StatCard 
                        title="Penjualan Hari Ini" 
                        value={stats.today_sales} 
                        icon="🛒"
                        trend="up"
                        trendValue="10%"
                    />
                    <StatCard 
                        title="Pendapatan Hari Ini" 
                        value={`Rp ${stats.today_revenue.toLocaleString('id-ID')}`} 
                        icon="💰"
                        trend="up"
                        trendValue="15%"
                    />
                </div>

                {/* Grafik dan Data */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Grafik Penjualan 30 Hari Terakhir</h2>
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
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Penjualan Terakhir</h2>
                            <div className="space-y-4">
                                {recentSales.map((sale, index) => (
                                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between">
                                            <span className="font-medium">#{sale.invoice}</span>
                                            <span className="text-blue-600">Rp {sale.total}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {sale.customer} • {sale.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Produk Stok Rendah</h2>
                            <div className="space-y-3">
                                {lowStockItems.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {product.category} • {product.code}
                                            </div>
                                        </div>
                                        <div className="text-red-600 font-bold">
                                            {product.stock} {product.unit} (min: {product.min_stock})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

function StatCard({ title, value, icon, trend, trendValue }) {
    const trendColors = {
        up: 'text-green-600 bg-green-100',
        down: 'text-red-600 bg-red-100'
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`${trendColors[trend]} rounded-full p-3`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
            <div className={`mt-2 text-sm ${trendColors[trend]} px-2 py-1 rounded-full inline-block`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
        </div>
    );
}