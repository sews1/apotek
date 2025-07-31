import React from 'react';
import { Head } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Ubah props sesuai data dari controller
export default function ProductReport({ auth, productSales = [], categories = [], summary = {}, filters = {} }) {
  if (!productSales || !categories) {
    return (
      <Authenticated auth={auth} header="Laporan Produk">
        <Head title="Laporan Produk" />
        <div className="bg-white p-6 rounded shadow border border-gray-100">
          <p className="text-center py-10">Memuat data produk...</p>
        </div>
      </Authenticated>
    );
  }

  // Data summary dari backend
  const totalProducts = summary.total_products || 0;
  const totalStockValue = summary.total_stock_value || 0;
  const totalQuantitySold = summary.total_quantity_sold || 0;
  const totalRevenue = summary.total_revenue || 0;

  // Produk stok rendah (<10)
  const lowStockProducts = productSales.filter((product) => (product.current_stock || 0) < 10);

  // 10 produk terlaris
  const bestSellingProducts = [...productSales]
    .sort((a, b) => (b.total_quantity_sold || 0) - (a.total_quantity_sold || 0))
    .slice(0, 10);

  // Ringkasan per kategori
  const productsByCategory = categories.map((category) => {
    const categoryProducts = productSales.filter((product) => product.category_id === category.id);
    return {
      category_id: category.id,
      category_name: category.name || 'Tidak Diketahui',
      product_count: categoryProducts.length,
      stock: categoryProducts.reduce((sum, p) => sum + (p.current_stock || 0), 0),
      total_value: categoryProducts.reduce((sum, p) => sum + (p.current_stock || 0) * (p.purchase_price || 0), 0),
      percentage: totalProducts > 0 ? ((categoryProducts.length / totalProducts) * 100).toFixed(2) + '%' : '0%',
    };
  });

  // Export Excel & PDF (opsional: sesuaikan field jika perlu)
  const exportExcel = () => {
    try {
      const wsData = productSales.map((product) => ({
        'Kode Produk': product.product_code || '-',
        'Nama Produk': product.product_name || '-',
        Kategori: product.category_name || '-',
        'Stok Saat Ini': product.current_stock || 0,
        'Terjual': product.total_quantity_sold || 0,
        'Pendapatan': product.total_revenue || 0,
        'Harga Beli': product.purchase_price || 0,
        'Harga Jual': product.selling_price || 0,
      }));

      const wsCategoryData = productsByCategory.map((item) => ({
        Kategori: item.category_name,
        'Jumlah Produk': item.product_count,
        Persentase: item.percentage,
        'Total Stok': item.stock,
        'Nilai Persediaan': item.total_value,
      }));

      const wsStats = XLSX.utils.aoa_to_sheet([
        ['Laporan Produk - Statistik Utama'],
        ['Tanggal Laporan', new Date().toLocaleDateString('id-ID')],
        [''],
        ['Total Produk', totalProducts],
        ['Total Stok', productSales.reduce((sum, p) => sum + (p.current_stock || 0), 0)],
        ['Total Nilai Persediaan', totalStockValue],
        ['Total Terjual', totalQuantitySold],
        ['Total Pendapatan', totalRevenue],
        ['Produk Stok Rendah', lowStockProducts.length],
        ['Produk Terlaris', bestSellingProducts[0]?.product_name || '-'],
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wsCategoryData), 'Ringkasan Kategori');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wsData), 'Data Produk');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        `Laporan_Produk_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.text('Laporan Produk', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 25);
      doc.text(`Total Produk: ${totalProducts}`, 14, 30);
      doc.text(`Total Nilai Persediaan: Rp ${totalStockValue.toLocaleString('id-ID')}`, 14, 35);
      doc.text(`Total Terjual: ${totalQuantitySold}`, 14, 40);
      doc.text(`Total Pendapatan: Rp ${totalRevenue.toLocaleString('id-ID')}`, 14, 45);
      doc.text(`Produk Stok Rendah: ${lowStockProducts.length}`, 14, 50);

      doc.addPage();
      doc.setFontSize(12);
      doc.text('Ringkasan per Kategori', 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [['Kategori', 'Jumlah Produk', 'Persentase', 'Total Stok', 'Nilai Persediaan']],
        body: productsByCategory.map((item) => [
          item.category_name,
          item.product_count,
          item.percentage,
          item.stock,
          `Rp ${item.total_value.toLocaleString('id-ID')}`,
        ]),
        styles: { fontSize: 8 },
      });

      if (lowStockProducts.length > 0) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text('Produk dengan Stok Rendah (<10)', 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [['Kode', 'Nama Produk', 'Kategori', 'Stok', 'Harga Jual']],
          body: lowStockProducts.map((product) => [
            product.product_code || '-',
            product.product_name || '-',
            product.category_name || '-',
            product.current_stock || 0,
            `Rp ${(product.selling_price || 0).toLocaleString('id-ID')}`,
          ]),
          styles: { fontSize: 8 },
        });
      }

      doc.addPage();
      doc.setFontSize(12);
      doc.text('10 Produk Terlaris', 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [['Nama Produk', 'Kategori', 'Terjual', 'Harga Jual']],
        body: bestSellingProducts.map((product) => [
          product.product_name || '-',
          product.category_name || '-',
          product.total_quantity_sold || 0,
          `Rp ${(product.selling_price || 0).toLocaleString('id-ID')}`,
        ]),
        styles: { fontSize: 8 },
      });

      doc.save(`Laporan_Produk_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  };

  return (
    <Authenticated auth={auth} header="Laporan Produk">
      <Head title="Laporan Produk" />

      <div className="bg-white p-6 rounded shadow border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Laporan Produk</h2>
          <div className="space-x-2">
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              disabled={productSales.length === 0}
            >
              Export Excel
            </button>
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              disabled={productSales.length === 0}
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatBox title="Total Produk" value={totalProducts} color="blue" />
          <StatBox title="Total Nilai Persediaan" value={`Rp ${totalStockValue.toLocaleString('id-ID')}`} color="green" />
          <StatBox title="Total Terjual" value={totalQuantitySold} color="orange" />
          <StatBox title="Total Pendapatan" value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} color="purple" />
        </div>

        <Section title={`Produk dengan Stok Rendah (${lowStockProducts.length})`}>
          {lowStockProducts.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Tidak ada produk dengan stok rendah.</p>
          ) : (
            <Table
              columns={['Kode', 'Nama Produk', 'Kategori', 'Stok', 'Harga Jual']}
              data={lowStockProducts.map((product) => [
                product.product_code || '-',
                product.product_name || '-',
                product.category_name || '-',
                product.current_stock || 0,
                `Rp ${(product.selling_price || 0).toLocaleString('id-ID')}`,
              ])}
            />
          )}
        </Section>

        <Section title="10 Produk Terlaris">
          {bestSellingProducts.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Data produk terlaris tidak tersedia.</p>
          ) : (
            <Table
              columns={['Nama Produk', 'Kategori', 'Terjual', 'Harga Jual']}
              data={bestSellingProducts.map((product) => [
                product.product_name || '-',
                product.category_name || '-',
                product.total_quantity_sold || 0,
                `Rp ${(product.selling_price || 0).toLocaleString('id-ID')}`,
              ])}
            />
          )}
        </Section>

        <Section title="Ringkasan Produk per Kategori">
          <Table
            columns={['Kategori', 'Jumlah Produk', 'Persentase', 'Total Stok', 'Nilai Persediaan']}
            data={productsByCategory.map((item) => [
              item.category_name,
              item.product_count,
              item.percentage,
              item.stock,
              `Rp ${item.total_value.toLocaleString('id-ID')}`,
            ])}
          />
        </Section>
      </div>
    </Authenticated>
  );
}

function StatBox({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <div className={`p-4 rounded shadow text-center ${colors[color] || 'bg-gray-100 text-gray-700'}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-3 border-b pb-1 border-gray-300">{title}</h3>
      {children}
    </section>
  );
}

function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto border rounded shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-4 text-center text-gray-500">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cidx) => (
                  <td key={cidx} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
