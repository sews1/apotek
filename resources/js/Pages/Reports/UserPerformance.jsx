import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function UserPerformance({
    userPerformanceData = [],
    userActivitySummary = [],
    activityTimeline = [],
    userSessions = [],
    users = [],
    filters = {},
    summary = {},
    error
}) {
    
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [reportType, setReportType] = useState(filters.report_type || 'summary');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('total_revenue');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chartData, setChartData] = useState(null);
    const itemsPerPage = 20;

    // Filter and sort data
    const filteredData = userPerformanceData
        .filter(user =>
            user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortBy] || 0;
            const bVal = b[sortBy] || 0;
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Handle filter
    const handleFilter = () => {
        setCurrentPage(1);
        router.get(route('reports.user-performance'), {
            start_date: startDate,
            end_date: endDate,
            user_id: userId,
            report_type: reportType,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset filters
    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setUserId('');
        setReportType('summary');
        setSearchTerm('');
        setCurrentPage(1);
        router.get(route('reports.user-performance'));
    };

    // Export functions
    const exportToExcel = () => {
        const data = filteredData.map(user => ({
            'Nama': user.user_name,
            'Email': user.user_email,
            'Role': user.role_name,
            'Total Penjualan': user.total_sales,
            'Total Pendapatan': user.total_revenue,
            'Rata-rata Nilai Penjualan': user.avg_sale_value,
            'Total Aktivitas': user.total_activities,
            'Total Sesi': user.total_sessions,
            'Waktu Aktif (menit)': user.total_active_time,
            'Rata-rata Durasi Sesi (menit)': user.avg_session_duration,
            'Skor Produktivitas': user.productivity_score,
            'Aktivitas Pertama': user.first_activity,
            'Aktivitas Terakhir': user.last_activity,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Performa User');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(dataBlob, `performa-user-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Laporan Performa User', 14, 20);

        if (startDate && endDate) {
            doc.setFontSize(10);
            doc.text(`Periode: ${startDate} - ${endDate}`, 14, 30);
        }

        const tableData = filteredData.slice(0, 50).map(user => [
            user.user_name,
            user.role_name,
            user.total_sales,
            `Rp ${user.total_revenue.toLocaleString('id-ID')}`,
            user.total_activities,
            `${user.total_active_time} min`,
            user.productivity_score
        ]);

        autoTable(doc, {
            head: [['Nama', 'Role', 'Penjualan', 'Pendapatan', 'Aktivitas', 'Waktu Aktif', 'Produktivitas']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`performa-user-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const getProductivityColor = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        if (score >= 40) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getProductivityLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        return 'Below Average';
    };

    // Handle user detail modal
    const showUserDetail = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    return (
        <Authenticated>
            <Head title="Laporan Performa User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Laporan Performa User
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

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
                                    <p className="text-2xl font-bold text-blue-600">{summary.total_users}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-800">Total Sales</h3>
                                    <p className="text-2xl font-bold text-green-600">{summary.total_sales}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-800">Total Revenue</h3>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.total_revenue)}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-orange-800">Avg Session</h3>
                                    <p className="text-2xl font-bold text-orange-600">{formatDuration(summary.average_session_duration)}</p>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                                            User
                                        </label>
                                        <select
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Semua User</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipe Laporan
                                        </label>
                                        <select
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="summary">Summary</option>
                                            <option value="detailed">Detailed</option>
                                            <option value="activity">Activity Focus</option>
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
                                    placeholder="Cari user atau role..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Main Content based on Report Type */}
                            {reportType === 'summary' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('user_name')}
                                                >
                                                    User {sortBy === 'user_name' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('total_sales')}
                                                >
                                                    Sales {sortBy === 'total_sales' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('total_revenue')}
                                                >
                                                    Revenue {sortBy === 'total_revenue' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('total_activities')}
                                                >
                                                    Activities {sortBy === 'total_activities' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('total_active_time')}
                                                >
                                                    Active Time {sortBy === 'total_active_time' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th 
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleSort('productivity_score')}
                                                >
                                                    Productivity {sortBy === 'productivity_score' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentData.map((user, index) => (
                                                <tr key={user.user_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                                                            <div className="text-sm text-gray-500">{user.user_email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {user.role_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        <div>{user.total_sales}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Avg: {formatCurrency(user.avg_sale_value)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(user.total_revenue)}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        <div>{user.total_activities}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {user.total_sessions} sessions
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        <div>{formatDuration(user.total_active_time)}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Avg: {formatDuration(user.avg_session_duration)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProductivityColor(user.productivity_score)}`}>
                                                            {user.productivity_score}% {getProductivityLabel(user.productivity_score)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => showUserDetail(user)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {reportType === 'detailed' && (
                                <div className="space-y-6">
                                    {/* Activity Timeline */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">Timeline Aktivitas</h3>
                                        <div className="max-h-96 overflow-y-auto">
                                            {activityTimeline.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">Tidak ada data aktivitas</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {activityTimeline.slice(0, 100).map((activity, index) => (
                                                        <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="font-medium text-sm">{activity.user_name}</span>
                                                                    <span className="text-xs text-gray-500">{activity.time}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    <span className="font-medium">{activity.activity_type}</span>
                                                                    {activity.description && (
                                                                        <span> - {activity.description}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {activity.ip_address}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reportType === 'activity' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Activity Summary by User */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">Ringkasan Aktivitas per User</h3>
                                        <div className="space-y-3">
                                            {Object.entries(userActivitySummary).map(([userId, summary]) => (
                                                <div key={userId} className="border-b pb-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium">{summary.user_name}</span>
                                                        <span className="text-sm text-gray-500">{summary.total_activities} activities</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>Most Active: {summary.most_active_hour}:00</div>
                                                        <div>Peak Day: {summary.peak_activity_day}</div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(summary.activities_by_type).map(([type, count]) => (
                                                                <span key={type} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                                                    {type}: {count}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Session Details */}
                                    <div className="bg-white border rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-4">Detail Sesi User</h3>
                                        <div className="space-y-3">
                                            {userSessions.map((session, index) => (
                                                <div key={session.user_id} className="border-b pb-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium">{session.user_name}</span>
                                                        <span className="text-sm text-gray-500">{session.total_sessions} sessions</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>Total: {formatDuration(session.total_active_time)}</div>
                                                        <div>Average: {formatDuration(session.avg_session_duration)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {reportType === 'summary' && totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-sm text-gray-700">
                                        Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} users
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
                                            if (pageNum > totalPages) return null;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 rounded ${currentPage === pageNum
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

                            {/* User Detail Modal */}
                            {showModal && selectedUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-2xl font-bold">
                                                    Detail Performa: {selectedUser.user_name}
                                                </h2>
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold text-blue-800">Sales Performance</h3>
                                                    <p className="text-2xl font-bold text-blue-600">{selectedUser.total_sales}</p>
                                                    <p className="text-sm text-blue-600">{formatCurrency(selectedUser.total_revenue)}</p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold text-green-800">Activity Level</h3>
                                                    <p className="text-2xl font-bold text-green-600">{selectedUser.total_activities}</p>
                                                    <p className="text-sm text-green-600">{selectedUser.total_sessions} sessions</p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <h3 className="font-semibold text-purple-800">Time Management</h3>
                                                    <p className="text-2xl font-bold text-purple-600">{formatDuration(selectedUser.total_active_time)}</p>
                                                    <p className="text-sm text-purple-600">Avg: {formatDuration(selectedUser.avg_session_duration)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="font-semibold mb-3">Activity Breakdown</h3>
                                                    <div className="space-y-2">
                                                        {Object.entries(selectedUser.activity_breakdown || {}).map(([type, count]) => (
                                                            <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                                <span className="capitalize">{type}</span>
                                                                <span className="font-medium">{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-3">Performance Metrics</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span>Productivity Score</span>
                                                            <span className={`px-2 py-1 rounded text-sm font-medium ${getProductivityColor(selectedUser.productivity_score)}`}>
                                                                {selectedUser.productivity_score}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>Average Sale Value</span>
                                                            <span className="font-medium">{formatCurrency(selectedUser.avg_sale_value)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>First Activity</span>
                                                            <span className="text-sm text-gray-600">
                                                                {selectedUser.first_activity ? new Date(selectedUser.first_activity).toLocaleDateString('id-ID') : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span>Last Activity</span>
                                                            <span className="text-sm text-gray-600">
                                                                {selectedUser.last_activity ? new Date(selectedUser.last_activity).toLocaleDateString('id-ID') : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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