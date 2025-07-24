import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { router } from '@inertiajs/react';

export default function EmployeeActivityReport({ 
    activityReports, 
    employees, 
    activityTypes, 
    filters, 
    error 
}) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [employeeId, setEmployeeId] = useState(filters.employee_id || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);

    // Filter data based on search
    const filteredActivities = activityReports.filter(activity =>
        activity.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentActivities = filteredActivities.slice(startIndex, endIndex);

    // Handle filter changes
    const handleFilter = () => {
        router.get(route('reports.staff'), {
            start_date: startDate,
            end_date: endDate,
            employee_id: employeeId,
            activity_type: activityType,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset filters
    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setEmployeeId('');
        setActivityType('');
        setSearchTerm('');
        setCurrentPage(1);
        router.get(route('reports.employee.activities'));
    };

    // Export to Excel
    const exportToExcel = () => {
        const data = filteredActivities.map(activity => ({
            'Waktu': activity.created_at,
            'Karyawan': activity.employee_name,
            'Role': activity.role_name,
            'Jenis Aktivitas': activity.activity_type,
            'Deskripsi': activity.description,
            'IP Address': activity.ip_address,
            'User Agent': activity.user_agent,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Aktivitas Karyawan');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(dataBlob, `aktivitas-karyawan-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(16);
        doc.text('Laporan Aktivitas Karyawan', 14, 20);
        
        // Date range
        if (startDate && endDate) {
            doc.setFontSize(10);
            doc.text(`Periode: ${startDate} - ${endDate}`, 14, 30);
        }
        
        // Summary
        doc.setFontSize(12);
        doc.text(`Total Aktivitas: ${filteredActivities.length}`, 14, 40);
        
        // Table
        const tableData = filteredActivities.slice(0, 100).map(activity => [
            activity.created_at,
            activity.employee_name,
            activity.role_name,
            activity.activity_type,
            activity.description.substring(0, 50) + (activity.description.length > 50 ? '...' : ''),
            activity.ip_address
        ]);
        
        autoTable(doc, {
            head: [['Waktu', 'Karyawan', 'Role', 'Aktivitas', 'Deskripsi', 'IP Address']],
            body: tableData,
            startY: 50,
            styles: { fontSize: 7 },
            headStyles: { fillColor: [41, 128, 185] },
        });
        
        if (filteredActivities.length > 100) {
            doc.setFontSize(10);
            doc.text('*Menampilkan 100 data teratas', 14, doc.lastAutoTable.finalY + 10);
        }
        
        doc.save(`aktivitas-karyawan-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID');
    };

    const getActivityTypeColor = (type) => {
        const colors = {
            'login': 'bg-green-100 text-green-800',
            'logout': 'bg-red-100 text-red-800',
            'create': 'bg-blue-100 text-blue-800',
            'update': 'bg-yellow-100 text-yellow-800',
            'delete': 'bg-red-100 text-red-800',
            'view': 'bg-gray-100 text-gray-800',
            'export': 'bg-purple-100 text-purple-800',
            'default': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.default;
    };

    return (
        <Authenticated>
            <Head title="Laporan Aktivitas Karyawan" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Laporan Aktivitas Karyawan
                                </h1>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={exportToExcel}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Export Excel
                                    </button>
                                    <button
                                        onClick={exportToPDF}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Export PDF
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
            )}

                            {/* Filters */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Karyawan
                                        </label>
                                        <select
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Semua Karyawan</option>
                                            {employees.map(employee => (
                                                <option key={employee.id} value={employee.id}>
                                                    {employee.name} ({employee.role?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jenis Aktivitas
                                        </label>
                                        <select
                                            value={activityType}
                                            onChange={(e) => setActivityType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Semua Aktivitas</option>
                                            {activityTypes.map(type => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={handleFilter}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Filter
                                        </button>
                                        <button
                                            onClick={resetFilters}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari aktivitas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Summary */}
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Menampilkan {currentActivities.length} dari {filteredActivities.length} total aktivitas
                                </p>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Waktu
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Karyawan
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aktivitas
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Deskripsi
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                IP Address
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentActivities.map((activity, index) => (
                                            <tr key={activity.activity_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(activity.created_at)}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {activity.employee_name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {activity.role_name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityTypeColor(activity.activity_type)}`}>
                                                        {activity.activity_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                                                    <div title={activity.description}>
                                                        {activity.description}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {activity.ip_address}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {currentActivities.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    Tidak ada aktivitas yang ditemukan.
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-sm text-gray-700">
                                        Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredActivities.length)} dari {filteredActivities.length} aktivitas
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 rounded ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        <button
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}