import React, { useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, Link } from "@inertiajs/react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBoxes } from "react-icons/fa";
import Pagination from "@/Components/Pagination";

export default function Index({ auth, suppliers, filters }) {
    const [expandedRows, setExpandedRows] = useState({});
    const isWarehouse = auth.user.role === 'warehouse'; // Cek apakah user memiliki role warehouse

    const toggleReadMore = (id, field) => {
        setExpandedRows((prev) => ({
            ...prev,
            [`${id}_${field}`]: !prev[`${id}_${field}`],
        }));
    };

    const truncateText = (text, length, isExpanded) => {
        if (!text) return "-";
        if (text.length <= length || isExpanded) return text;
        return text.slice(0, length) + "...";
    };

    return (
        <Authenticated
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Supplier Management
                    </h2>
                </div>
            }
        >
            <Head title="Suppliers" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Supplier List
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage all your suppliers in one place
                        </p>
                    </div>
                    {isWarehouse && (
                        <Link
                            href={route("suppliers.create")}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-wider shadow-md transition duration-200 ease-in-out"
                        >
                            <FaPlus className="mr-2" />
                            Add New Supplier
                        </Link>
                    )}
                </div>

                {/* Search */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-100">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search suppliers..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaBoxes className="mr-1" /> Supplied Items
                                        </div>
                                    </th>
                                    {isWarehouse && (
                                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {suppliers.data && suppliers.data.length > 0 ? (
                                    suppliers.data.map((supplier) => {
                                        const isAddressExpanded = expandedRows[`${supplier.id}_address`];
                                        const isItemExpanded = expandedRows[`${supplier.id}_item`];

                                        return (
                                            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                                                            {supplier.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-semibold text-gray-900">{supplier.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900">{supplier.phone || "-"}</div>
                                                    {supplier.email && <div className="text-gray-500 text-xs">{supplier.email}</div>}
                                                </td>
                                                <td className="px-6 py-4" title={supplier.address || "-"}>
                                                    <span>{truncateText(supplier.address, 40, isAddressExpanded)}</span>
                                                    {supplier.address && supplier.address.length > 40 && (
                                                        <button
                                                            onClick={() => toggleReadMore(supplier.id, "address")}
                                                            className="text-blue-500 hover:underline ml-2 text-xs"
                                                        >
                                                            {isAddressExpanded ? "Read Less" : "Read More"}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4" title={supplier.item || "Not specified"}>
                                                    <span>{truncateText(supplier.item, 30, isItemExpanded)}</span>
                                                    {supplier.item && supplier.item.length > 30 && (
                                                        <button
                                                            onClick={() => toggleReadMore(supplier.id, "item")}
                                                            className="text-blue-500 hover:underline ml-2 text-xs"
                                                        >
                                                            {isItemExpanded ? "Read Less" : "Read More"}
                                                        </button>
                                                    )}
                                                </td>
                                                {isWarehouse && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={route("suppliers.edit", supplier.id)}
                                                                className="px-3 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center text-xs"
                                                            >
                                                                <FaEdit className="mr-1" /> Edit
                                                            </Link>
                                                            <Link
                                                                href={route("suppliers.destroy", supplier.id)}
                                                                method="delete"
                                                                as="button"
                                                                className="px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 flex items-center text-xs"
                                                            >
                                                                <FaTrash className="mr-1" /> Delete
                                                            </Link>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={isWarehouse ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                                            No suppliers found.{" "}
                                            {isWarehouse && (
                                                <Link href={route("suppliers.create")} className="text-blue-600 hover:underline">
                                                    Create one now.
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {suppliers.data && suppliers.data.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                            <Pagination links={suppliers.links} />
                        </div>
                    )}
                </div>
            </div>
        </Authenticated>
    );
}