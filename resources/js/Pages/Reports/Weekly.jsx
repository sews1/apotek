import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';

export default function WeeklyReport({ 
    auth, 
    weeklySales: initialWeeklySales, 
    filters 
}) {
    // State for filters
    const [dateRange, setDateRange] = useState({
        start: filters?.start_date ? new Date(filters.start_date) : startOfWeek(new Date()),
        end: filters?.end_date ? new Date(filters.end_date) : endOfWeek(new Date())
    });
    const [filterType, setFilterType] = useState('week'); // 'week', 'month', 'year'
    const [isLoading, setIsLoading] = useState(false);
    
    // Use sales data from props
    const filteredSales = initialWeeklySales || [];

    // Combine sales and items data into a single array
    const combinedData = filteredSales.flatMap(sale => {
        if (sale.items && sale.items.length > 0) {
            return sale.items.map(item => ({
                date: new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                invoice_number: sale.invoice_number,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                sale_total: sale.total
            }));
        }
        return [{
            date: new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            invoice_number: sale.invoice_number,
            product_name: '-',
            quantity: 0,
            price: 0,
            subtotal: 0,
            sale_total: sale.total
        }];
    });

    // Calculate summary statistics
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const totalItems = filteredSales.reduce((sum, sale) => sum + (sale.items?.length || 0), 0);
    const avgTransactionValue = totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : 0;
    
    const uniqueProducts = new Set();
    filteredSales.forEach(sale => {
        sale.items?.forEach(item => uniqueProducts.add(item.product_id));
    });

    // Group sales by day for daily summary
    const dailySales = {};
    filteredSales.forEach(sale => {
        const day = new Date(sale.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        dailySales[day] = (dailySales[day] || 0) + sale.total;
    });

    // PERBAIKAN: Function untuk fetch data dengan parameter yang benar
    const fetchWeeklyData = async (startDate, endDate) => {
        setIsLoading(true);
        try {
            router.get(route('reports.weekly'), {
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd')
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: (error) => {
                    console.error('Error fetching weekly data:', error);
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    // Date navigation functions
    const navigateWeek = (direction) => {
        let newStart, newEnd;
        
        if (filterType === 'week') {
            newStart = direction === 'prev' ? subWeeks(dateRange.start, 1) : addWeeks(dateRange.start, 1);
            newEnd = direction === 'prev' ? subWeeks(dateRange.end, 1) : addWeeks(dateRange.end, 1);
        } else if (filterType === 'month') {
            const currentDate = direction === 'prev' ? 
                new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() - 1, 1) :
                new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() + 1, 1);
            newStart = startOfMonth(currentDate);
            newEnd = endOfMonth(currentDate);
        } else if (filterType === 'year') {
            const currentDate = direction === 'prev' ?
                new Date(dateRange.start.getFullYear() - 1, 0, 1) :
                new Date(dateRange.start.getFullYear() + 1, 0, 1);
            newStart = startOfYear(currentDate);
            newEnd = endOfYear(currentDate);
        }

        setDateRange({ start: newStart, end: newEnd });
        fetchWeeklyData(newStart, newEnd);
    };

    const setCurrentPeriod = () => {
        let newStart, newEnd;
        
        if (filterType === 'week') {
            newStart = startOfWeek(new Date());
            newEnd = endOfWeek(new Date());
        } else if (filterType === 'month') {
            newStart = startOfMonth(new Date());
            newEnd = endOfMonth(new Date());
        } else if (filterType === 'year') {
            newStart = startOfYear(new Date());
            newEnd = endOfYear(new Date());
        }

        setDateRange({ start: newStart, end: newEnd });
        fetchWeeklyData(newStart, newEnd);
    };

    // Handle filter type change
    const handleFilterTypeChange = (newType) => {
        setFilterType(newType);
        let newStart, newEnd;
        
        if (newType === 'week') {
            newStart = startOfWeek(new Date());
            newEnd = endOfWeek(new Date());
        } else if (newType === 'month') {
            newStart = startOfMonth(new Date());
            newEnd = endOfMonth(new Date());
        } else if (newType === 'year') {
            newStart = startOfYear(new Date());
            newEnd = endOfYear(new Date());
        }

        setDateRange({ start: newStart, end: newEnd });
        fetchWeeklyData(newStart, newEnd);
    };

    // Handle manual date change
    const handleDateChange = (field, value) => {
        const newDate = new Date(value);
        const newRange = { ...dateRange };
        
        if (field === 'start') {
            newRange.start = newDate;
            
            // Auto-adjust end date based on filter type
            if (filterType === 'week') {
                newRange.end = endOfWeek(newDate);
            } else if (filterType === 'month') {
                newRange.end = endOfMonth(newDate);
            } else if (filterType === 'year') {
                newRange.end = endOfYear(newDate);
            }
        } else {
            newRange.end = newDate;
        }
        
        setDateRange(newRange);
    };

    // Apply date filter
    const applyDateFilter = () => {
        fetchWeeklyData(dateRange.start, dateRange.end);
    };

    // Export functions
    const exportExcel = () => {
        // Prepare data for Excel export
        const wsData = combinedData.map(item => ({
            Tanggal: item.date,
            'No. Invoice': item.invoice_number,
            Produk: item.product_name,
            Kuantitas: item.quantity,
            Harga: item.price,
            Subtotal: item.subtotal,
            'Total Transaksi': item.sale_total
        }));

        const dailySummary = Object.entries(dailySales).map(([day, total]) => ({
            Hari: day,
            'Total Penjualan': total,
            'Persentase': `${((total / totalSales) * 100).toFixed(2)}%`
        }));

        const wb = XLSX.utils.book_new();
        
        // Add sheets
        const wsMain = XLSX.utils.json_to_sheet(wsData);
        const wsDaily = XLSX.utils.json_to_sheet(dailySummary);
        const wsStats = XLSX.utils.aoa_to_sheet([
            ['Laporan Penjualan - Ringkasan'],
            ['Periode', `${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`],
            [''],
            ['Total Penjualan', totalSales],
            ['Total Transaksi', totalTransactions],
            ['Rata-rata Transaksi', avgTransactionValue],
            ['Total Item Terjual', totalItems],
        ]);

        XLSX.utils.book_append_sheet(wb, wsMain, 'Data Penjualan');
        XLSX.utils.book_append_sheet(wb, wsDaily, 'Ringkasan Harian');
        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 
            `laporan-penjualan-${format(dateRange.start, 'yyyy-MM-dd')}-${format(dateRange.end, 'yyyy-MM-dd')}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Title and period
        doc.setFontSize(16);
        doc.text('Laporan Penjualan', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Periode: ${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`, 
                pageWidth / 2, 22, { align: 'center' });
        
        // Summary statistics
        doc.setFontSize(10);
        doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 14, 35);
        doc.text(`Total Transaksi: ${totalTransactions}`, 14, 40);
        doc.text(`Rata-rata Transaksi: Rp ${parseFloat(avgTransactionValue).toLocaleString('id-ID')}`, 14, 45);
        doc.text(`Total Item Terjual: ${totalItems}`, 14, 50);

        // Daily summary
        if (Object.keys(dailySales).length > 0) {
            doc.addPage();
            doc.setFontSize(12);
            doc.text('Ringkasan Harian', 14, 15);
            autoTable(doc, {
                startY: 20,
                head: [['Hari', 'Total Penjualan', 'Persentase']],
                body: Object.entries(dailySales).map(([day, total]) => [
                    day,
                    `Rp ${total.toLocaleString('id-ID')}`,
                    `${((total / totalSales) * 100).toFixed(2)}%`
                ]),
                styles: { fontSize: 8 },
            });
        }

        // Combined data table
        if (combinedData.length > 0) {
            doc.addPage();
            doc.setFontSize(12);
            doc.text('Detail Penjualan', 14, 15);
            
            autoTable(doc, {
                startY: 20,
                head: [['Tanggal', 'Invoice', 'Produk', 'Qty', 'Harga', 'Subtotal']],
                body: combinedData.slice(0, 100).map(item => [
                    item.date,
                    item.invoice_number,
                    item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
                    item.quantity,
                    `Rp ${item.price.toLocaleString('id-ID')}`,
                    `Rp ${item.subtotal.toLocaleString('id-ID')}`
                ]),
                styles: { fontSize: 7 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 10 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 20 }
                }
            });
        }

        doc.save(`laporan-penjualan-${format(dateRange.start, 'yyyy-MM-dd')}-${format(dateRange.end, 'yyyy-MM-dd')}.pdf`);
    };

    const getPeriodLabel = () => {
        if (filterType === 'week') {
            return 'Mingguan';
        }
        return 'Periode';
    };

    return (
        <Authenticated auth={auth} header={`Laporan ${getPeriodLabel()}`}>
            <Head title={`Laporan ${getPeriodLabel()}`} />

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan {getPeriodLabel()}</h2>
                        <p className="text-gray-600">
                            Periode: {format(dateRange.start, 'dd MMM yyyy')} - {format(dateRange.end, 'dd MMM yyyy')}
                        </p>
                        {filteredSales.length === 0 && !isLoading && (
                            <p className="text-amber-600 text-sm mt-1">⚠️ Tidak ada data penjualan untuk periode ini</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportExcel}
                            disabled={filteredSales.length === 0 || isLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                        <button
                            onClick={exportPDF}
                            disabled={filteredSales.length === 0 || isLoading}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Filter Periode</h3>
 

                    {/* Navigation Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => navigateWeek('prev')}
                                disabled={isLoading}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={setCurrentPeriod}
                                disabled={isLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Periode Saat Ini
                            </button>
                            
                            <button 
                                onClick={() => navigateWeek('next')}
                                disabled={isLoading}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Manual Date Selection */}
                        <div className="flex items-center gap-2">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={format(dateRange.start, 'yyyy-MM-dd')}
                                    onChange={(e) => handleDateChange('start', e.target.value)}
                                    disabled={isLoading}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Tanggal Akhir</label>
                                <input
                                    type="date"
                                    value={format(dateRange.end, 'yyyy-MM-dd')}
                                    onChange={(e) => handleDateChange('end', e.target.value)}
                                    disabled={isLoading}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50"
                                />
                            </div>
                            
                            <button
                                onClick={applyDateFilter}
                                disabled={isLoading}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Terapkan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data laporan...</p>
                    </div>
                )}

                {/* Summary Cards */}
                {!isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatBox 
                            title="Total Penjualan" 
                            value={`Rp ${totalSales.toLocaleString('id-ID')}`} 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            trendText={`Rp ${parseFloat(avgTransactionValue).toLocaleString('id-ID')}/transaksi`}
                            color="blue"
                        />
                        <StatBox 
                            title="Total Transaksi" 
                            value={totalTransactions} 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                            color="green"
                        />
                        <StatBox 
                            title="Item Terjual" 
                            value={totalItems} 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            }
                            color="purple"
                        />
                        <StatBox 
                            title="Produk Unik" 
                            value={uniqueProducts.size} 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            }
                            color="amber"
                        />
                    </div>
                )}

                {/* Content based on data availability */}
                {!isLoading && filteredSales.length === 0 ? (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak Ada Data</h3>
                        <p className="mt-2 text-gray-500">
                            Tidak ada transaksi penjualan untuk periode {format(dateRange.start, 'dd MMM yyyy')} - {format(dateRange.end, 'dd MMM yyyy')}.
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            Coba pilih periode lain atau periksa kembali data penjualan Anda.
                        </p>
                    </div>
                ) : !isLoading && (
                    <>
                        {/* Daily Summary */}
                        {Object.keys(dailySales).length > 0 && (
                            <SectionTable 
                                title="Ringkasan Harian" 
                                description="Total penjualan per hari dalam periode ini"
                            >
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penjualan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% dari Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Object.entries(dailySales).map(([day, total]) => (
                                        <tr key={day} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{day}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                                Rp {total.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                <div className="flex items-center justify-end">
                                                    {((total / totalSales) * 100).toFixed(2)}%
                                                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-blue-600 h-1.5 rounded-full" 
                                                            style={{ width: `${((total / totalSales) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </SectionTable>
                        )}

                        {/* Transaction Details */}
                        <SectionTable 
                            title="Detail Transaksi" 
                            description="Daftar lengkap semua transaksi dalam periode ini"
                        >
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {combinedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data penjualan untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    combinedData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {item.date}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                {item.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                Rp {item.price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                Rp {item.subtotal.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </SectionTable>
                    </>
                )}
            </div>
        </Authenticated>
    );
}

// StatBox Component
function StatBox({ title, value, icon, trend, trendText, color }) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            icon: 'text-blue-600',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600'
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            icon: 'text-green-600',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            icon: 'text-purple-600',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600'
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            icon: 'text-amber-600',
            trendUp: 'text-green-600',
            trendDown: 'text-red-600'
        }
    };

    return (
        <div className={`${colorClasses[color].bg} p-4 rounded-lg border border-gray-200 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${colorClasses[color].text}`}>{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color].icon} bg-white bg-opacity-50`}>
                    {icon}
                </div>
            </div>
            {trendText && (
                <div className="mt-2 flex items-center">
                    {trend === 'up' ? (
                        <svg className={`w-4 h-4 ${colorClasses[color].trendUp}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    ) : trend === 'down' ? (
                        <svg className={`w-4 h-4 ${colorClasses[color].trendDown}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    )}
                    {trendText && <span className="ml-1 text-xs font-medium text-gray-500">{trendText}</span>}
                </div>
            )}
        </div>
    );
}

// SectionTable Component
function SectionTable({ title, description, children }) {
    return (
        <div className="mb-8">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    {children}
                </table>
            </div>
        </div>
    );
}