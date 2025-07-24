import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MonthlyReport({ auth, monthlySales, month: initialMonth, year: initialYear }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(initialYear || new Date().getFullYear());
    const [filteredSales, setFilteredSales] = useState(monthlySales || []);
    const [isLoading, setIsLoading] = useState(false);

    // Month names in Indonesian
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Generate year options (current year ± 5)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: 11 }, 
        (_, i) => currentYear - 5 + i
    );

    // Filter sales data based on selected month and year
    useEffect(() => {
        if (monthlySales) {
            const filtered = monthlySales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() + 1 === parseInt(selectedMonth) && 
                       saleDate.getFullYear() === parseInt(selectedYear);
            });
            setFilteredSales(filtered);
        }
    }, [selectedMonth, selectedYear, monthlySales]);

    // Initialize daily data
    const dailySales = {};
    const dailyTransactions = {};
    
    filteredSales.forEach(sale => {
        const day = new Date(sale.date).getDate();
        dailySales[day] = (dailySales[day] || 0) + sale.total;
        dailyTransactions[day] = (dailyTransactions[day] || 0) + 1;
    });

    // Calculate main statistics
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const totalItemsSold = filteredSales.reduce((sum, sale) => sum + (sale.items?.length || 0), 0);
    const avgDailySales = Object.keys(dailySales).length > 0 ? 
        (totalSales / Object.keys(dailySales).length).toFixed(2) : 0;
    const avgDailyTransactions = Object.keys(dailySales).length > 0 ? 
        (totalTransactions / Object.keys(dailySales).length).toFixed(2) : 0;
    
    // Get unique products
    const uniqueProducts = new Set();
    filteredSales.forEach(sale => sale.items?.forEach(item => uniqueProducts.add(item.product_id)));

    // Get top selling products
    const productSales = {};
    filteredSales.forEach(sale => {
        sale.items?.forEach(item => {
            if (!productSales[item.product_name]) {
                productSales[item.product_name] = {
                    name: item.product_name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.product_name].quantity += item.quantity;
            productSales[item.product_name].revenue += item.subtotal;
        });
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    // Combine transaction data
    const combinedData = filteredSales.flatMap(sale => {
        if (sale.items?.length > 0) {
            return sale.items.map(item => ({
                date: sale.date,
                day: new Date(sale.date).getDate(),
                invoice_number: sale.invoice_number,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                sale_total: sale.total
            }));
        }
        return [{
            date: sale.date,
            day: new Date(sale.date).getDate(),
            invoice_number: sale.invoice_number,
            product_name: '-',
            quantity: 0,
            price: 0,
            subtotal: 0,
            sale_total: sale.total
        }];
    });

    // Format date for display
    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Handle month/year change
    const handlePeriodChange = async () => {
        setIsLoading(true);
        // Here you would typically make an API call to fetch data for the selected period
        // For now, we'll just simulate loading
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    // ===== EXPORT EXCEL =====
    const exportExcel = () => {
        const monthName = monthNames[selectedMonth - 1];
        
        // Main transaction data
        const wsData = combinedData.map(item => ({
            'Tanggal': formatDate(item.date),
            'Hari': item.day,
            'No. Invoice': item.invoice_number,
            'Nama Produk': item.product_name,
            'Kuantitas': item.quantity,
            'Harga Satuan': `Rp ${item.price.toLocaleString('id-ID')}`,
            'Subtotal': `Rp ${item.subtotal.toLocaleString('id-ID')}`,
            'Total Transaksi': `Rp ${item.sale_total.toLocaleString('id-ID')}`
        }));

        // Daily summary
        const dailySummary = Object.entries(dailySales)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, total]) => ({
                'Tanggal': `${day} ${monthName} ${selectedYear}`,
                'Total Penjualan': `Rp ${total.toLocaleString('id-ID')}`,
                'Jumlah Transaksi': dailyTransactions[day] || 0,
                'Persentase dari Total': `${((total / totalSales) * 100).toFixed(2)}%`
            }));

        // Top products
        const topProductsData = topProducts.map((product, index) => ({
            'Peringkat': index + 1,
            'Nama Produk': product.name,
            'Kuantitas Terjual': product.quantity,
            'Total Pendapatan': `Rp ${product.revenue.toLocaleString('id-ID')}`,
            'Persentase Pendapatan': `${((product.revenue / totalSales) * 100).toFixed(2)}%`
        }));

        // Statistics summary
        const statsData = [
            ['LAPORAN PENJUALAN BULANAN'],
            [`Periode: ${monthName} ${selectedYear}`],
            [''],
            ['RINGKASAN STATISTIK'],
            ['Total Penjualan', `Rp ${totalSales.toLocaleString('id-ID')}`],
            ['Total Transaksi', totalTransactions],
            ['Total Item Terjual', totalItemsSold],
            ['Rata-rata Penjualan Harian', `Rp ${parseFloat(avgDailySales).toLocaleString('id-ID')}`],
            ['Rata-rata Transaksi Harian', avgDailyTransactions],
            [''],
            ['ANALISIS PERFORMA'],
            ['Hari Penjualan Tertinggi', Object.keys(dailySales).length > 0 ? 
                Object.entries(dailySales).reduce((a, b) => dailySales[a[0]] > dailySales[b[0]] ? a : b)[0] : '-'],
            ['Nilai Penjualan Tertinggi', Object.keys(dailySales).length > 0 ? 
                `Rp ${Math.max(...Object.values(dailySales)).toLocaleString('id-ID')}` : 'Rp 0'],
            ['Produk Terlaris', topProducts.length > 0 ? topProducts[0].name : '-'],
            [''],
            ['Laporan dibuat pada:', new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })]
        ];

        const wb = XLSX.utils.book_new();

        // Create worksheets
        const wsStats = XLSX.utils.aoa_to_sheet(statsData);
        const wsDaily = XLSX.utils.json_to_sheet(dailySummary);
        const wsProducts = XLSX.utils.json_to_sheet(topProductsData);
        const wsMain = XLSX.utils.json_to_sheet(wsData);

        // Set column widths
        wsStats['!cols'] = [{ width: 30 }, { width: 25 }];
        wsDaily['!cols'] = [{ width: 20 }, { width: 20 }, { width: 15 }, { width: 20 }];
        wsProducts['!cols'] = [{ width: 10 }, { width: 30 }, { width: 15 }, { width: 20 }, { width: 20 }];
        wsMain['!cols'] = [
            { width: 15 }, { width: 8 }, { width: 15 }, { width: 25 }, 
            { width: 10 }, { width: 15 }, { width: 15 }, { width: 15 }
        ];

        // Append sheets in logical order
        XLSX.utils.book_append_sheet(wb, wsStats, 'Ringkasan');
        XLSX.utils.book_append_sheet(wb, wsDaily, 'Harian');
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Produk Terlaris');
        XLSX.utils.book_append_sheet(wb, wsMain, 'Detail Transaksi');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 
            `Laporan_Penjualan_${monthName}_${selectedYear}.xlsx`);
    };

    // ===== EXPORT PDF =====
    const exportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const monthName = monthNames[selectedMonth - 1];

        // Cover page
        doc.setFontSize(20);
        doc.text('LAPORAN PENJUALAN BULANAN', pageWidth / 2, 30, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text(`${monthName} ${selectedYear}`, pageWidth / 2, 45, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 60, { align: 'center' });

        // Statistics section
        doc.setFontSize(14);
        doc.text('RINGKASAN STATISTIK', 14, 85);
        
        const statsTable = [
            ['Total Penjualan', `Rp ${totalSales.toLocaleString('id-ID')}`],
            ['Total Transaksi', totalTransactions.toString()],
            ['Total Item Terjual', totalItemsSold.toString()]
            ['Rata-rata Penjualan Harian', `Rp ${parseFloat(avgDailySales).toLocaleString('id-ID')}`],
            ['Rata-rata Transaksi Harian', avgDailyTransactions]
        ];

        autoTable(doc, {
            startY: 95,
            head: [['Metrik', 'Nilai']],
            body: statsTable,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [66, 139, 202] },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 80, halign: 'right' }
            }
        });

        // Top products section
        if (topProducts.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('PRODUK TERLARIS', 14, 20);
            
            autoTable(doc, {
                startY: 30,
                head: [['Rank', 'Produk', 'Qty', 'Pendapatan', '%']],
                body: topProducts.slice(0, 10).map((product, index) => [
                    (index + 1).toString(),
                    product.name,
                    product.quantity.toString(),
                    `Rp ${product.revenue.toLocaleString('id-ID')}`,
                    `${((product.revenue / totalSales) * 100).toFixed(1)}%`
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [66, 139, 202] },
                columnStyles: {
                    0: { cellWidth: 20, halign: 'center' },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 25, halign: 'center' },
                    3: { cellWidth: 40, halign: 'right' },
                    4: { cellWidth: 25, halign: 'right' }
                }
            });
        }

        // Daily summary
        if (Object.keys(dailySales).length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('RINGKASAN HARIAN', 14, 20);
            
            autoTable(doc, {
                startY: 30,
                head: [['Tanggal', 'Penjualan', 'Transaksi', '%']],
                body: Object.entries(dailySales)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([day, total]) => [
                        `${day} ${monthName}`,
                        `Rp ${total.toLocaleString('id-ID')}`,
                        (dailyTransactions[day] || 0).toString(),
                        `${((total / totalSales) * 100).toFixed(1)}%`
                    ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [66, 139, 202] },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 50, halign: 'right' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 30, halign: 'right' }
                }
            });
        }

        // Transaction details (first 50 transactions to avoid too large PDF)
        if (combinedData.length > 0) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('DETAIL TRANSAKSI', 14, 20);
            
            if (combinedData.length > 50) {
                doc.setFontSize(10);
                doc.text(`Menampilkan 50 transaksi teratas dari ${combinedData.length} total transaksi.`, 14, 30);
            }
            
            autoTable(doc, {
                startY: combinedData.length > 50 ? 40 : 30,
                head: [['Tanggal', 'Invoice', 'Produk', 'Qty', 'Subtotal']],
                body: combinedData.slice(0, 50).map(item => [
                    formatDate(item.date),
                    item.invoice_number,
                    item.product_name.length > 25 ? 
                        item.product_name.substring(0, 25) + '...' : item.product_name,
                    item.quantity.toString(),
                    `Rp ${item.subtotal.toLocaleString('id-ID')}`
                ]),
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 139, 202] },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 60 },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 35, halign: 'right' }
                }
            });
        }

        doc.save(`Laporan_Penjualan_${monthName}_${selectedYear}.pdf`);
    };

    return (
        <Authenticated auth={auth} header={`Laporan Bulanan - ${monthNames[selectedMonth - 1]} ${selectedYear}`}>
            <Head title={`Laporan Bulanan ${monthNames[selectedMonth - 1]} ${selectedYear}`} />

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                {/* Period Selector */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Pilih Periode Laporan</h3>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {monthNames.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            onClick={handlePeriodChange}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Memuat...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Perbarui
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
                        <p className="text-gray-600">{monthNames[selectedMonth - 1]} {selectedYear}</p>
                        {filteredSales.length === 0 && (
                            <p className="text-amber-600 text-sm mt-1">⚠️ Tidak ada data penjualan untuk periode ini</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={exportExcel} 
                            disabled={filteredSales.length === 0}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                        <button 
                            onClick={exportPDF} 
                            disabled={filteredSales.length === 0}
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatBox 
                        title="Total Penjualan" 
                        value={`Rp ${totalSales.toLocaleString('id-ID')}`} 
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        trendText={`Rp ${parseFloat(avgDailySales).toLocaleString('id-ID')}/hari`}
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
                        trendText={`${avgDailyTransactions}/hari`}
                        color="green"
                    />
                    <StatBox 
                        title="Item Terjual" 
                        value={totalItemsSold} 
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        }
                        color="purple"
                    />
                </div>

                {/* Content based on data availability */}
                {filteredSales.length === 0 ? (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak Ada Data</h3>
                        <p className="mt-2 text-gray-500">
                            Tidak ada transaksi penjualan untuk periode {monthNames[selectedMonth - 1]} {selectedYear}.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Top Products */}
                        {topProducts.length > 0 && (
                            <SectionTable 
                                title="Produk Terlaris" 
                                description="10 produk dengan pendapatan tertinggi"
                            >
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {topProducts.map((product, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                                        index === 0 ? 'bg-yellow-500' : 
                                                        index === 1 ? 'bg-gray-400' : 
                                                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                {product.quantity}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                Rp {product.revenue.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                {((product.revenue / totalSales) * 100).toFixed(2)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </SectionTable>
                        )}

                        {/* Daily Summary Table */}
                        <SectionTable 
                            title="Ringkasan Harian" 
                            description="Total penjualan dan transaksi per hari"
                        >
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penjualan</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% dari Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(dailySales)
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .map(([day, total]) => {
                                        const transactionsCount = dailyTransactions[day] || 0;
                                        const percentage = ((total / totalSales) * 100).toFixed(2);
                                        
                                        return (
                                            <tr key={day} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {day} {monthNames[selectedMonth - 1]}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                                    Rp {total.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                    <div className="flex items-center justify-end">
                                                        {percentage}%
                                                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                                                            <div 
                                                                className="bg-blue-600 h-1.5 rounded-full" 
                                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                                    {transactionsCount}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </SectionTable>

                        {/* Transaction Details Table */}
                        <SectionTable 
                            title="Detail Transaksi" 
                            description={`Daftar lengkap ${combinedData.length} transaksi bulan ini`}
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
                                {combinedData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(item.date)}
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
                                ))}
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
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="ml-1 text-xs font-medium text-gray-500">{trendText}</span>
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