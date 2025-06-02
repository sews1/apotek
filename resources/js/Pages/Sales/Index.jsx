import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, router } from '@inertiajs/react';
import { FaEye, FaFileInvoice, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, sales, filters }) {
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

    return (
        <Authenticated 
            auth={auth} 
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Transactions</h2>
                </div>
            }
        >
            <Head title="Sales Transactions" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title and Create Button */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
                    <Link 
                        href={route('sales.create')} 
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out duration-150"
                    >
                        <FaPlus className="mr-2" />
                        New Transaction
                    </Link>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
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
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search transactions..."
                            />
                        </div>
                        <div className="flex space-x-3">
                            <select 
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Payment Methods</option>
                                <option value="cash">Cash</option>
                                <option value="credit">Credit Card</option>
                                <option value="transfer">Transfer</option>
                            </select>
                            <button 
                                onClick={handleFilter}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaFilter className="mr-2" />
                                Filter
                            </button>
                            {(search || paymentMethod) && (
                                <button 
                                    onClick={resetFilter}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaTimes className="mr-2" />
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-indigo-600">{sale.invoice_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(sale.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.customer_name || <span className="text-gray-400">Guest</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {sale.items?.length > 0 ? (
                                                    sale.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="text-sm text-gray-900">
                                                            {item.product?.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No products</span>
                                                )}
                                                {sale.items?.length > 2 && (
                                                    <span className="text-xs text-indigo-600">
                                                        +{sale.items.length - 2} more items
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.items?.reduce((total, item) => total + item.quantity, 0) || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Rp {sale.total?.toLocaleString('id-ID') ?? '0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                sale.payment_method === 'cash' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : sale.payment_method === 'credit' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-3">
                                                <Link 
                                                    href={route('sales.show', sale.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    title="View Details"
                                                >
                                                    <FaEye className="mr-1" />
                                                </Link>
                                                <a 
                                                    href={route('sales.invoice', sale.id)} 
                                                    target="_blank"
                                                    className="text-green-600 hover:text-green-900 flex items-center"
                                                    title="View Invoice"
                                                >
                                                    <FaFileInvoice className="mr-1" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new transaction.</p>
                            <div className="mt-6">
                                <Link
                                    href={route('sales.create')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                    New Transaction
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