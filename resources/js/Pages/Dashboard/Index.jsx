import React, { useState, useEffect, useMemo } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
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
    FiCalendar, FiUser, FiPieChart, FiBarChart2, FiPlus,
    FiAlertCircle, FiCheckCircle
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
        current_week: { sales: 0, revenue: 0 },
        previous_week: { sales: 0, revenue: 0 },
        comparison: { sales: 0, revenue: 0 }
    });

    // Fetch weekly stats from backend
    useEffect(() => {
        fetchWeeklyStats();
    }, []);

    const fetchWeeklyStats = async () => {
        try {
            const response = await axios.get('/dashboard/weekly-stats');
            setWeeklyStats(response.data);
        } catch (error) {
            console.error('Error fetching weekly stats:', error);
            // Fallback calculation if API fails
            calculateWeeklyStatsFromRecentSales();
        }
    };

    // Fallback calculation if API is not available
    const calculateWeeklyStatsFromRecentSales = () => {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const currentWeekSales = recentSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= oneWeekAgo && saleDate <= now;
        });

        const currentWeekRevenue = currentWeekSales.reduce((sum, sale) => sum + sale.total, 0);

        setWeeklyStats({
            current_week: {
                sales: currentWeekSales.length,
                revenue: currentWeekRevenue
            },
            previous_week: { sales: 0, revenue: 0 },
            comparison: { sales: 0, revenue: 0 }
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format number
    const formatNumber = (number) => {
        return new Intl.NumberFormat('id-ID').format(number);
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
            item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [lowStockItems, searchQuery]);

    // Filter near expired items by search query
    const filteredNearExpiredItems = useMemo(() => {
        if (!searchQuery) return nearExpiredItems;
        
        return nearExpiredItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [nearExpiredItems, searchQuery]);

    // Get sales value based on period
    const getSalesValue = () => {
        switch (period) {
            case 'mingguan':
                return weeklyStats.current_week.sales;
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
                return weeklyStats.current_week.revenue;
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
    const getComparisonTrend = () => {
        if (period === 'mingguan') {
            const revenueComparison = weeklyStats.comparison.revenue;
            const salesComparison = weeklyStats.comparison.sales;
            
            return {
                trend: revenueComparison >= 0 ? 'up' : 'down',
                value: `${revenueComparison >= 0 ? '+' : ''}${revenueComparison.toFixed(1)}% dari minggu lalu`,
                salesTrend: salesComparison >= 0 ? 'up' : 'down',
                salesValue: `${salesComparison >= 0 ? '+' : ''}${salesComparison.toFixed(1)}% penjualan`
            };
        }
        
        // Default trend untuk periode lain (bisa dikembangkan)
        return {
            trend: 'up',
            value: 'Data perbandingan tidak tersedia',
            salesTrend: 'up',
            salesValue: ''
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
        fetchWeeklyStats();
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    // Prepare data for yearly summary chart
    const yearlyChartData = {
        labels: yearlySummary.map(item => item.month),
        datasets: [
            {
                label: 'Jumlah Penjualan',
                data: yearlySummary.map(item => item.sales),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y'
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

    // Get urgency color for near expired items
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'warning':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'caution':
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <Authenticated auth={auth} header="Dashboard">
            <Head title="Dashboard">
                <meta name="description" content="Dashboard manajemen apotek" />
            </Head>

            <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8">
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
                                dateFormat="dd/MM/yyyy"
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
                        value={formatNumber(stats.total_products)} 
                        icon={<FiPackage className="w-5 h-5" />} 
                        trend="neutral" 
                        trendValue="Total produk terdaftar" 
                        color="indigo"
                    />
                    <StatCard
                        title="Stok Rendah"
                        value={formatNumber(stats.low_stock_products)}
                        icon={<FiAlertTriangle className="w-5 h-5" />}
                        trend={stats.low_stock_products > 0 ? 'down' : 'up'}
                        trendValue={stats.low_stock_products > 0 ? `${stats.low_stock_products} perlu restock` : 'Stok aman'}
                        color="amber"
                    />
                    <StatCard
                        title={`Penjualan ${periodLabel[period]}`}
                        value={formatNumber(getSalesValue())}
                        icon={<FiShoppingCart className="w-5 h-5" />}
                        trend={getComparisonTrend().salesTrend}
                        trendValue={getComparisonTrend().salesValue || getComparisonTrend().value}
                        color="emerald"
                    />
                    <StatCard
                        title={`Pendapatan ${periodLabel[period]}`}
                        value={formatCurrency(getRevenueValue())}
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
                                    {activeChart === 'bar' ? 'Total pendapatan harian' : 'Perbandingan penjualan dan pendapatan bulanan'}
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
                                    <span>Harian</span>
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
                                    <span>Tahunan</span>
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
                                                        return `Pendapatan: ${formatCurrency(context.raw)}`;
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
                                                        return formatCurrency(value);
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
                                                            return `Penjualan: ${formatNumber(context.raw)} transaksi`;
                                                        } else {
                                                            return `Pendapatan: ${formatCurrency(context.raw * 1000000)}`;
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
                            
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {filteredRecentSales.length > 0 ? (
                                    filteredRecentSales.slice(0, 5).map((sale, index) => (
                                        <div key={sale.id || index} className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">#{sale.invoice}</span>
                                                <span className="text-indigo-600 font-semibold">
                                                    {formatCurrency(sale.total)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-x-2">
                                                <span className="flex items-center">
                                                    <FiUser className="mr-1" />
                                                    {sale.customer || 'Pelanggan Umum'}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(sale.date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                                <span>•</span>
                                                <span>{sale.items_count} item</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Kasir: {sale.cashier}
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
                                    30 hari terakhir
                                </span>
                            </div>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {topProducts.length > 0 ? (
                                    topProducts.slice(0, 5).map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                                                    <span className="text-emerald-600 font-bold text-sm">#{index + 1}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-gray-700 text-sm truncate">{product.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {product.category} • {product.code}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-semibold text-emerald-600 text-sm">
                                                    {formatNumber(product.total_sold)} terjual
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(product.total_revenue)}
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
                                    {stats.low_stock_products} dari {stats.total_products} produk
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
                                        key={product.id} 
                                        href={route('products.edit', product.id)}
                                        className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                                                <FiAlertTriangle className="text-amber-600 w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-gray-700 text-sm truncate">{product.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {product.category} • {product.code}
                                                </div>
                                                <div className="text-xs text-amber-600 mt-1">
                                                    {formatCurrency(product.price)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-amber-800 font-bold text-sm">
                                                {formatNumber(product.stock)} {product.unit}
                                            </div>
                                            <div className="text-xs text-amber-600">
                                                min: {formatNumber(product.min_stock)} {product.unit}
                                            </div>
                                            <div className="text-xs text-red-600 font-medium mt-1">
                                                Kurang {formatNumber(product.min_stock - product.stock)} {product.unit}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center mb-3">
                                        <FiCheckCircle className="text-emerald-500 w-8 h-8" />
                                    </div>
                                    <div className="text-gray-400 mb-2">
                                        {lowStockItems.length === 0 ? 'Tidak ada produk stok rendah' : 'Tidak ditemukan produk'}
                                    </div>
                                    <div className="text-sm text-emerald-600 font-medium">Semua stok aman!</div>
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
                                    {stats.near_expired_products} dalam 30 hari
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
                                        key={product.id}
                                        href={route('products.edit', product.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg hover:opacity-90 transition-all border ${getUrgencyColor(product.urgency)}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                product.urgency === 'critical' ? 'bg-red-200' :
                                                product.urgency === 'warning' ? 'bg-orange-200' : 'bg-yellow-200'
                                            }`}>
                                                {product.urgency === 'critical' ? (
                                                    <FiAlertCircle className="text-red-700 w-4 h-4" />
                                                ) : (
                                                    <FiClock className="text-orange-700 w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-gray-700 text-sm truncate">{product.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {product.category} • {product.code}
                                                </div>
                                                <div className={`text-xs font-medium mt-1 ${
                                                    product.urgency === 'critical' ? 'text-red-700' :
                                                    product.urgency === 'warning' ? 'text-orange-700' : 'text-yellow-700'
                                                }`}>
                                                    {product.days_until_expiry} hari lagi
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-gray-700 text-sm font-semibold">
                                                Exp: {product.expired_date}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatNumber(product.stock)} {product.unit} tersisa
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="flex items-center justify-center mb-3">
                                        <FiCheckCircle className="text-emerald-500 w-8 h-8" />
                                    </div>
                                    <div className="text-gray-400 mb-2">
                                        {nearExpiredItems.length === 0 ? 'Tidak ada produk hampir kadaluwarsa' : 'Tidak ditemukan produk'}
                                    </div>
                                    <div className="text-sm text-emerald-600 font-medium">Semua produk masih aman!</div>
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
            border: 'border-indigo-100 hover:border-indigo-200',
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
            border: 'border-emerald-100 hover:border-emerald-200',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            iconBg: 'bg-amber-100',
            border: 'border-amber-100 hover:border-amber-200',
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            iconBg: 'bg-red-100',
            border: 'border-red-100 hover:border-red-200',
        },
        violet: {
            bg: 'bg-violet-50',
            text: 'text-violet-600',
            iconBg: 'bg-violet-100',
            border: 'border-violet-100 hover:border-violet-200',
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
        neutral: {
            text: 'text-gray-600',
            bg: 'bg-gray-100',
            icon: <FiPackage className="w-4 h-4" />
        },
    };

    const currentTrend = trendColors[trend] || trendColors.neutral;

    return (
        <div className={`${colorClasses[color].bg} rounded-xl p-5 hover:shadow-md transition-all cursor-default border ${colorClasses[color].border}`}>
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1 truncate" title={value}>{value}</p>
                </div>
                <div className={`${colorClasses[color].iconBg} rounded-lg p-3 flex-shrink-0`}>
                    <div className={colorClasses[color].text}>
                        {icon}
                    </div>
                </div>
            </div>
            <div className={`mt-3 flex items-center text-sm ${currentTrend.text}`}>
                <span className="mr-1 flex-shrink-0">{currentTrend.icon}</span>
                <span className="truncate" title={trendValue}>{trendValue}</span>
            </div>
        </div>
    );
}