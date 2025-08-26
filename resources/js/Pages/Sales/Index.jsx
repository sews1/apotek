import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, router } from '@inertiajs/react';
import { 
  FaEye, 
  FaFileInvoice, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaCalendarDay,
  FaMoneyBillWave,
  FaChartLine,
  FaShoppingCart
} from 'react-icons/fa';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, sales, stats, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');

    const handleFilter = () => {
        router.get(route('sales.index'), {
            search,
            payment_method: paymentMethod,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setPaymentMethod('');
        router.get(route('sales.index'));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('id-ID').format(value || 0);
    };

    return (
        <Authenticated 
            auth={auth} 
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Transaksi Penjualan</h2>
                </div>
            }
        >
            <Head title="Transaksi Penjualan" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Judul dan Tombol Tambah */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transaksi Penjualan</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola dan pantau semua transaksi penjualan
                        </p>
                    </div>
                    <Link 
                        href={route('sales.create')} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out duration-150 shadow-sm"
                    >
                        <FaPlus className="mr-2" />
                        Transaksi Baru
                    </Link>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats?.total_transactions?.toLocaleString('id-ID') ?? 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                <FaShoppingCart className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.total_revenue)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <FaMoneyBillWave className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Transaksi Hari Ini</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.today_transactions}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatCurrency(stats.today_revenue)}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <FaCalendarDay className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Hari Ini</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.today_revenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.today_transactions} transaksi
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <FaChartLine className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pencarian dan Filter */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                                placeholder="Cari berdasarkan invoice, pelanggan..."
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative">
                                <select 
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm appearance-none bg-white"
                                >
                                    <option value="">Semua Metode Pembayaran</option>
                                    <option value="cash">Tunai</option>
                                    <option value="credit">Kartu Kredit</option>
                                    <option value="transfer">Transfer Bank</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleFilter}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <FaFilter className="mr-2" />
                                    Terapkan
                                </button>
                                {(search || paymentMethod) && (
                                    <button 
                                        onClick={resetFilter}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        <FaTimes className="mr-2" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel Transaksi */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal & Waktu
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pelanggan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pembayaran
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                                                    <FaFileInvoice className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-indigo-600">{sale.invoice_number}</div>
                                                    <div className="text-xs text-gray-500">#{sale.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(sale.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                                <div className="text-xs text-gray-500">
                                                    {new Date(sale.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.customer_name || <span className="text-gray-400">Tamu</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {sale.items?.length > 0 ? (
                                                    <>
                                                        {sale.items.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="text-sm text-gray-900">
                                                                {item.product_name || item.product?.name}
                                                                <span className="text-xs text-gray-500 ml-1">({item.quantity}x)</span>
                                                            </div>
                                                        ))}
                                                        {sale.items.length > 2 && (
                                                            <span className="text-xs text-indigo-600 font-medium">
                                                                +{sale.items.length - 2} item lainnya
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Tidak ada item</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatCurrency(sale.total)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize mb-1 ${
                                                    sale.payment_method === 'cash' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : sale.payment_method === 'credit' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {sale.payment_method === 'cash' ? 'Tunai' : 
                                                     sale.payment_method === 'credit' ? 'Kartu Kredit' : 
                                                     'Transfer Bank'}
                                                </span>
                                                {sale.payment_amount && (
                                                    <span className="text-xs text-gray-500">
                                                        Dibayar: {formatCurrency(sale.payment_amount)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link 
                                                    href={route('sales.show', sale.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center transition-colors p-2 rounded-md hover:bg-indigo-50"
                                                    title="Lihat Detail"
                                                >
                                                    <FaEye className="h-4 w-4" />
                                                </Link>
                                                <Link 
                                                    href={route('sales.invoice', sale.id)} 
                                                    target="_blank"
                                                    className="text-green-600 hover:text-green-900 flex items-center transition-colors p-2 rounded-md hover:bg-green-50"
                                                    title="Lihat Invoice"
                                                >
                                                    <FaFileInvoice className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Kosong */}
                    {sales.data.length === 0 && (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi ditemukan</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {search || paymentMethod 
                                    ? "Coba sesuaikan pencarian atau filter Anda"
                                    : "Mulai dengan membuat transaksi baru"}
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('sales.create')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                    Transaksi Baru
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {sales.data.length > 0 && (
                    <div className="mt-4">
                        <Pagination links={sales.links} />
                    </div>
                )}
            </div>
        </Authenticated>
    );
}