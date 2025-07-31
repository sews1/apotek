import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function YearlyReport({ auth, yearlySales = [], year, availableYears = [] }) {
    const safeYearlySales = Array.isArray(yearlySales) ? yearlySales : [];
    const safeAvailableYears = Array.isArray(availableYears) ? availableYears : [];

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const combinedData = safeYearlySales.map(sale => {
        const saleDate = new Date(sale.date);
        const month = saleDate.getMonth() + 1;
        const formattedDate = saleDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });

        if (Array.isArray(sale.items) && sale.items.length > 0) {
            return sale.items.map(item => ({
                month: monthNames[month - 1] || `Bulan ${month}`,
                date: formattedDate,
                invoice_number: sale.invoice,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                sale_total: sale.total
            }));
        }
        return [{
            month: monthNames[month - 1] || `Bulan ${month}`,
            date: formattedDate,
            invoice_number: sale.invoice,
            product_name: '-',
            quantity: 0,
            price: 0,
            subtotal: 0,
            sale_total: sale.total
        }];
    }).flat();

    const totalSales = safeYearlySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = safeYearlySales.length;
    const totalItemsSold = safeYearlySales.reduce(
        (sum, sale) => sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
        0
    );

    const monthlySummary = safeYearlySales.reduce((acc, sale) => {
        const saleDate = new Date(sale.date);
        const month = saleDate.getMonth();
        const monthName = monthNames[month] || `Bulan ${month + 1}`;
        
        if (!acc[month]) {
            acc[month] = {
                month: monthName,
                total: 0,
                transactions: 0,
                items: 0
            };
        }
        
        acc[month].total += sale.total;
        acc[month].transactions += 1;
        acc[month].items += sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        return acc;
    }, {});

    const monthlySummaryArray = Object.values(monthlySummary);
    const avgMonthlySales = (totalSales / (monthlySummaryArray.length || 1)).toFixed(2);
    const avgMonthlyTransactions = (totalTransactions / (monthlySummaryArray.length || 1)).toFixed(2);

    const uniqueProducts = new Set(
        safeYearlySales.flatMap(sale => 
            sale.items?.map(item => item.product_id) || []
        )
    );

    const exportExcel = () => {
        const wsData = combinedData.map(item => ({
            Bulan: item.month,
            Tanggal: item.date,
            'No. Invoice': item.invoice_number,
            Produk: item.product_name,
            Kuantitas: item.quantity,
            Harga: item.price,
            Subtotal: item.subtotal,
            'Total Transaksi': item.sale_total
        }));

        const monthlyData = monthlySummaryArray.map(month => ({
            Bulan: month.month,
            'Total Penjualan': month.total,
            'Jumlah Transaksi': month.transactions,
            'Item Terjual': month.items,
            'Persentase': totalSales > 0 ? `${((month.total / totalSales) * 100).toFixed(2)}%` : '0.00%'
        }));

        const wb = XLSX.utils.book_new();
        const wsMain = XLSX.utils.json_to_sheet(wsData);
        const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
        const wsStats = XLSX.utils.aoa_to_sheet([
            ['Laporan Tahunan - Statistik Utama'],
            ['Tahun', year],
            [''],
            ['Total Penjualan', totalSales],
            ['Total Transaksi', totalTransactions],
            ['Total Item Terjual', totalItemsSold],
            ['Produk Berbeda', uniqueProducts.size],
            ['Rata-rata Penjualan Bulanan', avgMonthlySales],
            ['Transaksi per Bulan', avgMonthlyTransactions],
        ]);

        XLSX.utils.book_append_sheet(wb, wsMain, 'Data Penjualan');
        XLSX.utils.book_append_sheet(wb, wsMonthly, 'Ringkasan Bulanan');
        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Laporan_Tahunan_${year}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.text(`Laporan Penjualan Tahun ${year}`, pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 14, 25);
        doc.text(`Total Transaksi: ${totalTransactions}`, 14, 30);
        doc.text(`Rata-rata per Bulan: Rp ${avgMonthlySales.toLocaleString('id-ID')}`, 14, 35);
        doc.text(`Item Terjual: ${totalItemsSold} (${uniqueProducts.size} produk berbeda)`, 14, 40);

        doc.addPage();
        doc.setFontSize(12);
        doc.text('Ringkasan Bulanan', 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Bulan', 'Total Penjualan', 'Transaksi', 'Item Terjual', 'Persentase']],
            body: monthlySummaryArray.map(month => [
                month.month,
                `Rp ${month.total.toLocaleString('id-ID')}`,
                month.transactions,
                month.items,
                totalSales > 0 ? `${((month.total / totalSales) * 100).toFixed(2)}%` : '0.00%'
            ]),
            styles: { fontSize: 8 }
        });

        const limitedData = combinedData.slice(0, 1000);
        if (limitedData.length > 0) {
            doc.addPage();
            doc.setFontSize(12);
            doc.text('Detail Transaksi (1000 teratas)', 14, 15);
            autoTable(doc, {
                startY: 20,
                head: [['Bulan', 'Tanggal', 'Invoice', 'Produk', 'Qty', 'Harga', 'Subtotal']],
                body: limitedData.map(item => [
                    item.month,
                    item.date,
                    item.invoice_number,
                    item.product_name,
                    item.quantity,
                    `Rp ${item.price.toLocaleString('id-ID')}`,
                    `Rp ${item.subtotal.toLocaleString('id-ID')}`
                ]),
                styles: { fontSize: 6 }
            });
        }

        doc.save(`Laporan_Tahunan_${year}.pdf`);
    };

    return (
        <Authenticated auth={auth} header={`Laporan Tahunan - ${year}`}>
            <Head title={`Laporan Tahunan ${year}`} />

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                {/* Header with Dropdown */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Laporan Tahunan</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <label htmlFor="year" className="text-sm text-gray-700">Pilih Tahun:</label>
                            <select
                                id="year"
                                value={year}
                                onChange={(e) => {
                                    const selectedYear = e.target.value;
                                    window.location.href = route('reports.yearly', { year: selectedYear });
                                }}
                                className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="" disabled>
                                    {year ? `Tahun: ${year}` : 'Pilih Tahun'}
                                </option>
                                {/* Tampilkan tahun-tahun dari availableYears, dan juga tahun-tahun sebelumnya hingga 10 tahun ke belakang */}
                                {(() => {
                                    // Gabungkan availableYears dan 10 tahun ke belakang dari tahun sekarang
                                    const now = new Date().getFullYear();
                                    const yearsSet = new Set([
                                        ...safeAvailableYears,
                                        ...Array.from({ length: 10 }, (_, i) => (now - i).toString())
                                    ]);
                                    // Urutkan menurun
                                    const years = Array.from(yearsSet).sort((a, b) => b - a);
                                    return years.map((availableYear) => (
                                        <option key={availableYear} value={availableYear}>
                                            {availableYear}
                                        </option>
                                    ));
                                })()}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={exportExcel} 
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                        <button 
                            onClick={exportPDF} 
                            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm flex items-center gap-2 transition-colors"
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
                        trendText={`Rp ${avgMonthlySales.toLocaleString('id-ID')}/bulan`}
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
                        trendText={`${avgMonthlyTransactions}/bulan`}
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
                    <StatBox 
                        title="Produk Berbeda" 
                        value={uniqueProducts.size} 
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        }
                        color="amber"
                    />
                </div>

                {/* Monthly Summary Table */}
                <SectionTable 
                    title="Ringkasan Bulanan" 
                    description="Performa penjualan per bulan"
                >
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penjualan</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Persentase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {monthlySummaryArray.map((month, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                    Rp {month.total.toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                    {month.transactions}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                    {month.items}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                                    <div className="flex items-center justify-end">
                                        {totalSales > 0 ? `${((month.total / totalSales) * 100).toFixed(2)}%` : '0.00%'}
                                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-blue-600 h-1.5 rounded-full" 
                                                style={{ width: `${totalSales > 0 ? ((month.total / totalSales) * 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </SectionTable>

                {/* Transaction Details Table */}
                <SectionTable 
                    title="Detail Transaksi" 
                    description="100 transaksi terbaru"
                >
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
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
                                <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                                    Tidak ada data penjualan tahun ini.
                                </td>
                            </tr>
                        ) : (
                            combinedData.slice(0, 100).map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {item.month}
                                    </td>
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
            </div>
        </Authenticated>
    );
}

// StatBox and SectionTable components remain the same...
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
                    ) : null}
                    {trendText && <span className="ml-1 text-xs font-medium text-gray-500">{trendText}</span>}
                </div>
            )}
        </div>
    );
}

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