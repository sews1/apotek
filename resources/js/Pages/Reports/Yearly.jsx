import React from 'react';
import { Head } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function YearlyReport({ auth, yearlySales }) {
    // Fungsi export Excel
    const exportExcel = () => {
        const wsData = yearlySales.map(({ date, invoice, customer, total }) => ({
            Tanggal: date,
            Invoice: invoice,
            Pelanggan: customer,
            Total: total,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, 'laporan-penjualan-tahunan.xlsx');
    };

    // Fungsi export PDF
    const exportPDF = () => {
        const doc = new jsPDF();

        doc.text('Laporan Penjualan Tahunan', 14, 16);

        const tableColumn = ['Tanggal', 'Invoice', 'Pelanggan', 'Total'];
        const tableRows = yearlySales.map(sale => [
            sale.date,
            sale.invoice,
            sale.customer,
            `Rp ${sale.total.toLocaleString('id-ID')}`,
        ]);

        autoTable(doc, {
            startY: 20,
            head: [tableColumn],
            body: tableRows,
            styles: { fontSize: 8 },
        });

        doc.save('laporan-penjualan-tahunan.pdf');
    };

    return (
        <Authenticated auth={auth} header="Laporan Penjualan Tahunan">
            <Head title="Laporan Penjualan Tahunan" />

            <div className="bg-white p-6 rounded shadow border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Laporan Penjualan Tahunan</h2>

                <div className="mb-4 space-x-2">
                    <button
                        onClick={exportExcel}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Download Excel
                    </button>
                    <button
                        onClick={exportPDF}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Download PDF
                    </button>
                </div>

                <table className="w-full text-sm text-left text-gray-600 border">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 border">Tanggal</th>
                            <th className="px-4 py-2 border">Invoice</th>
                            <th className="px-4 py-2 border">Pelanggan</th>
                            <th className="px-4 py-2 border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yearlySales.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-2 border text-center text-gray-400">
                                    Tidak ada data penjualan tahun ini.
                                </td>
                            </tr>
                        ) : (
                            yearlySales.map((sale, index) => (
                                <tr key={index} className="bg-white hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{sale.date}</td>
                                    <td className="px-4 py-2 border">{sale.invoice}</td>
                                    <td className="px-4 py-2 border">{sale.customer}</td>
                                    <td className="px-4 py-2 border">Rp {sale.total.toLocaleString('id-ID')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Authenticated>
    );
}
