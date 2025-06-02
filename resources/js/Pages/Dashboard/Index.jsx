import React, { useState, useEffect, useMemo } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    FiPackage, FiAlertTriangle, FiClock, FiShoppingCart, 
    FiDollarSign, FiTrendingUp, FiTrendingDown, 
    FiRefreshCw, FiDownload, FiPrinter, FiSearch,
    FiCalendar, FiUser, FiPieChart, FiBarChart2, FiPlus
} from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard({
    auth,
    stats,
    recentSales = [],
    lowStockItems = [],
    nearExpiredItems = [],
    chartData,
    topProducts = [],
    yearlySummary = [],
}) {
    const [period, setPeriod] = useState('harian');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChart, setActiveChart] = useState('bar');
    const [weeklyStats, setWeeklyStats] = useState({
        sales: 0,
        revenue: 0,
        comparison: 0
    });

    // Calculate weekly stats
    useEffect(() => {
        if (recentSales.length > 0) {
            calculateWeeklyStats();
        }
    }, [recentSales]);

    const calculateWeeklyStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Format tanggal untuk konsistensi
    const formatDate = (date) => {
        return new Date(date).toISOString().split('T')[0];
    };

    // Filter penjualan minggu ini (7 hari terakhir)
    const currentWeekSales = recentSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= oneWeekAgo && saleDate <= now;
    });

    // Filter penjualan minggu sebelumnya (7 hari sebelum minggu ini)
    const previousWeekSales = recentSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
    });

    // Hitung total pendapatan
    const currentWeekRevenue = currentWeekSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const previousWeekRevenue = previousWeekSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    // Hitung perbandingan dengan minggu lalu
    let comparison;
    if (previousWeekRevenue === 0) {
        comparison = currentWeekRevenue > 0 ? 100 : 0; // Jika minggu lalu 0 dan minggu ini ada penjualan = +100%
    } else {
        comparison = ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;
    }

    // Format nilai perbandingan
    const formattedComparison = Math.round(comparison * 10) / 10; // Pembulatan 1 angka di belakang koma

    setWeeklyStats({
        sales: currentWeekSales.length,
        revenue: currentWeekRevenue,
        comparison: formattedComparison,
        previousWeekRevenue: previousWeekRevenue // Menyimpan data minggu lalu untuk referensi
    });
};

    // Filter recent sales by date range
    const filteredRecentSales = useMemo(() => {
        if (!startDate || !endDate) return recentSales;
        
        return recentSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
    }, [recentSales, startDate, endDate]);

    // Filter low stock items by search query
    const filteredLowStockItems = useMemo(() => {
        if (!searchQuery) return lowStockItems;
        
        return lowStockItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [lowStockItems, searchQuery]);

    // Filter near expired items by search query
    const filteredNearExpiredItems = useMemo(() => {
        if (!searchQuery) return nearExpiredItems;
        
        return nearExpiredItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [nearExpiredItems, searchQuery]);

    // Get sales value based on period
    const getSalesValue = () => {
        switch (period) {
            case 'mingguan':
                return weeklyStats.sales;
            case 'bulanan':
                return stats.monthly_sales ?? 0;
            case 'tahunan':
                return stats.yearly_sales ?? 0;
            case 'harian':
            default:
                return stats.today_sales ?? 0;
        }
    };

    // Get revenue value based on period
    const getRevenueValue = () => {
        switch (period) {
            case 'mingguan':
                return weeklyStats.revenue;
            case 'bulanan':
                return stats.monthly_revenue ?? 0;
            case 'tahunan':
                return stats.yearly_revenue ?? 0;
            case 'harian':
            default:
                return stats.today_revenue ?? 0;
        }
    };

    // Get comparison trend
    // Get comparison trend
const getComparisonTrend = () => {
    if (period === 'mingguan') {
        const comparison = weeklyStats.comparison;
        const absoluteValue = Math.abs(comparison);
        
        if (weeklyStats.previousWeekRevenue === 0) {
            return {
                trend: comparison > 0 ? 'up' : 'neutral',
                value: comparison > 0 ? `+${absoluteValue}% (tidak ada data minggu lalu)` : '0% (tidak ada perubahan)'
            };
        }
        
        return {
            trend: comparison >= 0 ? 'up' : 'down',
            value: `${comparison >= 0 ? '+' : ''}${absoluteValue}% dari minggu lalu`
        };
    }
    
    // Default trend untuk periode lain
    return {
        trend: 'up',
        value: '10% dari periode lalu'
    };
};

    const periodLabel = {
        harian: 'Hari Ini',
        mingguan: 'Minggu Ini',
        bulanan: 'Bulan Ini',
        tahunan: 'Tahun Ini',
    };

    // Handle refresh data
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    // Prepare data for yearly summary chart
    const yearlyChartData = {
        labels: yearlySummary.map(item => item.month),
        datasets: [
            {
                label: 'Penjualan',
                data: yearlySummary.map(item => item.sales),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Pendapatan (juta)',
                data: yearlySummary.map(item => item.revenue / 1000000),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };

    return (
        <Authenticated auth={auth} header="Dashboard">
            <Head title="Dashboard">
                <meta name="description" content="Dashboard manajemen apotek" />
            </Head>

            <div className="py-8 px-8 sm:px-8 lg:px-8 space-y-8">
                {/* Header with actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Dashboard Apotek</h1>
                        <p className="text-gray-500 mt-1">Ringkasan aktivitas dan statistik apotek Anda</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => setDateRange(update)}
                                isClearable={true}
                                placeholderText="Filter tanggal"
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 w-full"
                            />
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            aria-label="Refresh data"
                        >
                            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Period selector */}
                <div className="flex flex-wrap gap-2">
                    {['harian', 'mingguan', 'bulanan', 'tahunan'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all
                                ${
                                    period === p
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Statistik Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard 
                        title="Total Produk" 
                        value={stats.total_products} 
                        icon={<FiPackage className="w-5 h-5" />} 
                        trend="up" 
                        trendValue="5% dari bulan lalu" 
                        color="indigo"
                    />
                    <StatCard
                        title="Stok Rendah"
                        value={stats.low_stock_products}
                        icon={<FiAlertTriangle className="w-5 h-5" />}
                        trend={stats.low_stock_products > 0 ? 'up' : 'down'}
                        trendValue={stats.low_stock_products > 0 ? `${stats.low_stock_products} perlu restock` : 'Aman'}
                        color="amber"
                    />
                    <StatCard
                        title={`Penjualan ${periodLabel[period]}`}
                        value={getSalesValue()}
                        icon={<FiShoppingCart className="w-5 h-5" />}
                        trend={getComparisonTrend().trend}
                        trendValue={getComparisonTrend().value}
                        color="emerald"
                    />
                    <StatCard
                        title={`Pendapatan ${periodLabel[period]}`}
                        value={`Rp ${getRevenueValue().toLocaleString('id-ID')}`}
                        icon={<FiDollarSign className="w-5 h-5" />}
                        trend={getComparisonTrend().trend}
                        trendValue={getComparisonTrend().value}
                        color="violet"
                    />
                </div>

                {/* Grafik dan Informasi */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik Utama */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {activeChart === 'bar' ? 'Grafik Penjualan 30 Hari Terakhir' : 'Trend Pendapatan Tahunan'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeChart === 'bar' ? 'Total penjualan harian' : 'Perbandingan penjualan dan pendapatan'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setActiveChart('bar')}
                                    className={`p-2 rounded-lg flex items-center gap-1 text-sm ${
                                        activeChart === 'bar' 
                                            ? 'bg-indigo-100 text-indigo-600' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <FiBarChart2 className="w-4 h-4" />
                                    <span>Batang</span>
                                </button>
                                <button 
                                    onClick={() => setActiveChart('line')}
                                    className={`p-2 rounded-lg flex items-center gap-1 text-sm ${
                                        activeChart === 'line' 
                                            ? 'bg-indigo-100 text-indigo-600' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <FiTrendingUp className="w-4 h-4" />
                                    <span>Garis</span>
                                </button>
                            </div>
                        </div>
                        <div className="h-80">
                            {activeChart === 'bar' ? (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return `Rp ${context.raw.toLocaleString('id-ID')}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)',
                                                },
                                                ticks: {
                                                    callback: function(value) {
                                                        return `Rp ${value.toLocaleString('id-ID')}`;
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false,
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Line
                                    data={yearlyChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        if (context.datasetIndex === 0) {
                                                            return `Penjualan: ${context.raw}`;
                                                        } else {
                                                            return `Pendapatan: Rp ${(context.raw * 1000000).toLocaleString('id-ID')}`;
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Jumlah Penjualan'
                                                }
                                            },
                                            y1: {
                                                beginAtZero: true,
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                                position: 'right',
                                                title: {
                                                    display: true,
                                                    text: 'Pendapatan (juta Rp)'
                                                },
                                                ticks: {
                                                    callback: function(value) {
                                                        return `${value}M`;
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false,
                                                },
                                            },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Panel Samping */}
                    <div className="space-y-6">
                        {/* Penjualan Terakhir */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Penjualan Terakhir</h2>
                                <Link 
                                    href={route('sales.index')} 
                                    className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                            
                            {/* Search */}
                            <div className="mb-4 relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari penjualan..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {filteredRecentSales.length > 0 ? (
                                    filteredRecentSales.map((sale, index) => (
                                        <div key={index} className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">#{sale.invoice}</span>
                                                <span className="text-indigo-600 font-semibold">
                                                    Rp {sale.total.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-x-2">
                                                <span className="flex items-center">
                                                    <FiUser className="mr-1" />
                                                    {sale.customer || 'Tanpa nama'}
                                                </span>
                                                <span>{sale.date}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-3">
                                            {recentSales.length === 0 ? 'Belum ada penjualan' : 'Tidak ditemukan penjualan'}
                                        </div>
                                        <Link 
                                            href={route('sales.create')}
                                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <FiPlus className="mr-1" />
                                            Buat Penjualan Baru
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Produk Terlaris */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Produk Terlaris</h2>
                                <span className="text-sm text-emerald-600 font-medium">
                                    {topProducts.length} produk
                                </span>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {topProducts.length > 0 ? (
                                    topProducts.map((product, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-lg">
                                                    <FiTrendingUp className="text-emerald-600 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700 text-sm line-clamp-1">{product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.category} • {product.code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-emerald-600 text-sm">
                                                    {product.total_sold} terjual
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Rp {product.total_revenue.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400">Tidak ada data produk terlaris</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2 - Additional Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Produk Stok Rendah */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Produk Stok Rendah</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-amber-600 font-medium">
                                    {filteredLowStockItems.length} item
                                </span>
                                <Link 
                                    href={route('products.index', {filter: 'low_stock'})}
                                    className="text-sm text-amber-600 font-medium hover:underline"
                                >
                                    Kelola
                                </Link>
                            </div>
                        </div>
                        
                        {/* Search for low stock items */}
                        <div className="mb-4 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                            <input
                                type="text"
                                placeholder="Cari produk stok rendah..."
                                className="w-full pl-10 pr-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                            {filteredLowStockItems.length > 0 ? (
                                filteredLowStockItems.map((product, index) => (
                                    <Link 
                                        key={index} 
                                        href={route('products.edit', product.id)}
                                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2 rounded-lg">
                                                <FiPackage className="text-amber-600 w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-700 text-sm line-clamp-1">{product.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {product.category} • {product.code}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-amber-800 font-bold text-sm">
                                                {product.stock} {product.unit}
                                            </div>
                                            <div className="text-xs text-amber-600">min: {product.min_stock}</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        {lowStockItems.length === 0 ? 'Tidak ada produk stok rendah' : 'Tidak ditemukan produk'}
                                    </div>
                                    <div className="text-sm text-emerald-600">Stok aman</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Produk Hampir Kadaluwarsa */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Produk Hampir Kadaluwarsa</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-red-600 font-medium">
                                    {filteredNearExpiredItems.length} item
                                </span>
                                <Link 
                                    href={route('products.index', {filter: 'near_expired'})}
                                    className="text-sm text-red-600 font-medium hover:underline"
                                >
                                    Kelola
                                </Link>
                            </div>
                        </div>
                        
                        {/* Search for near expired items */}
                        <div className="mb-4 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
                            <input
                                type="text"
                                placeholder="Cari produk hampir kadaluwarsa..."
                                className="w-full pl-10 pr-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                            {filteredNearExpiredItems.length > 0 ? (
                                filteredNearExpiredItems.map((product, index) => (
                                    <Link
                                        key={index}
                                        href={route('products.edit', product.id)}
                                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
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
                                        <div className="text-right">
                                            <div className="text-red-700 text-sm font-semibold">
                                                Exp: {product.expired_date}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {product.stock} {product.unit} tersisa
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        {nearExpiredItems.length === 0 ? 'Tidak ada produk hampir kadaluwarsa' : 'Tidak ditemukan produk'}
                                    </div>
                                    <div className="text-sm text-emerald-600">Semua produk aman</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

function StatCard({ title, value, icon, trend, trendValue, color = 'indigo' }) {
    const colorClasses = {
        indigo: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            iconBg: 'bg-indigo-100',
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            iconBg: 'bg-amber-100',
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            iconBg: 'bg-red-100',
        },
        violet: {
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            iconBg: 'bg-violet-100',
        },
    };

    const trendColors = {
        up: {
            text: 'text-emerald-600',
            bg: 'bg-emerald-100',
            icon: <FiTrendingUp className="w-4 h-4" />
        },
        down: {
            text: 'text-red-600',
            bg: 'bg-red-100',
            icon: <FiTrendingDown className="w-4 h-4" />
        },
    };

    return (
        <div className={`${colorClasses[color].bg} rounded-xl p-5 hover:shadow-md transition-all cursor-default border border-transparent hover:border-${color}-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`${colorClasses[color].iconBg} rounded-lg p-3`}>
                    {icon}
                </div>
            </div>
            <div className={`mt-3 flex items-center text-sm ${trendColors[trend].text}`}>
                <span className="mr-1">{trendColors[trend].icon}</span>
                {trendValue}
            </div>
        </div>
    );
}