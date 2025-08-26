import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Authenticated from '@/Layouts/Authenticated';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
};

// Enhanced Pagination Component
const Pagination = ({ meta, onPageChange, className = "" }) => {
    if (!meta || meta.last_page <= 1) return null;
    
    const { current_page, last_page, per_page, total, from, to } = meta;
    
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5; // Number of page buttons to show
        
        let start = Math.max(1, current_page - Math.floor(showPages / 2));
        let end = Math.min(last_page, start + showPages - 1);
        
        // Adjust start if we're near the end
        if (end - start < showPages - 1) {
            start = Math.max(1, end - showPages + 1);
        }
        
        // Add first page and ellipsis if needed
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
        }
        
        // Add page numbers
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        // Add last page and ellipsis if needed
        if (end < last_page) {
            if (end < last_page - 1) {
                pages.push('...');
            }
            pages.push(last_page);
        }
        
        return pages;
    };
    
    const pageNumbers = getPageNumbers();
    
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Results info */}
            <div className="text-sm text-gray-600 order-2 sm:order-1">
                Menampilkan <span className="font-medium">{from}</span> - <span className="font-medium">{to}</span> dari{' '}
                <span className="font-medium">{total}</span> hasil
            </div>
            
            {/* Pagination buttons */}
            <div className="flex items-center space-x-1 order-1 sm:order-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        current_page === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                {/* Page numbers */}
                {pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-2 text-sm text-gray-400">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    current_page === page
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                
                {/* Next button */}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        current_page === last_page
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default function Index() {
    const { products, auth, categories } = usePage().props;
    const [localProducts, setLocalProducts] = React.useState(products.data);
    const [currentPage, setCurrentPage] = React.useState(products.current_page || 1);
    const [filters, setFilters] = React.useState({
        expired: false,
        nearExpiry: false,
        lowStock: false,
        category: '',
        status: '',
        search: ''
    });

    // Items per page
    const itemsPerPage = 10;

    // Permission checking functions
    const hasPermission = (requiredPermission) => {
        const userRoles = auth?.user?.roles || [];
        
        if (auth?.user?.permissions?.includes(requiredPermission)) {
            return true;
        }
        
        const hasPermissionViaRole = userRoles.some(role => 
            role.permissions?.includes(requiredPermission)
        );
        
        if (hasPermissionViaRole) {
            return true;
        }
        
        if (userRoles.some(role => role.name === 'warehouse')) {
            const warehousePermissions = [
                'edit',
                'create-product',
                'delete',
                'toggle-status'
            ];
            
            return warehousePermissions.includes(requiredPermission);
        }
        
        return false;
    };

    const hasRole = (roleName) => {
        return auth?.user?.roles?.some(role => role.name === roleName);
    };

    const canAccess = (permission) => {
        return hasPermission(permission) || hasRole('warehouse');
    };

    const showPermissionAlert = () => {
        Swal.fire({
            title: 'Akses Ditolak',
            text: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
            icon: 'error',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: '#3085d6',
        });
    };

    // Product status helper functions
    const isProductExpired = (product) => {
        if (!product.expired_date) return false;
        
        const expiredDate = new Date(product.expired_date);
        const today = new Date();
        
        expiredDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        return expiredDate < today;
    };

    const isProductNearExpiry = (product) => {
        if (!product.expired_date) return false;
        
        const expiredDate = new Date(product.expired_date);
        const today = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);
        
        expiredDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        oneMonthFromNow.setHours(0, 0, 0, 0);
        
        return expiredDate >= today && expiredDate <= oneMonthFromNow;
    };

    const isLowStock = (product) => {
        return product.stock <= product.min_stock;
    };

    // Auto-deactivate expired products
    const autoDeactivateExpiredProducts = React.useCallback(() => {
        const expiredProducts = localProducts.filter(product => 
            isProductExpired(product) && product.is_active === 1
        );

        if (expiredProducts.length > 0) {
            expiredProducts.forEach(product => {
                setLocalProducts(prev => prev.map(p =>
                    p.id === product.id ? { ...p, is_active: 0 } : p
                ));

                Inertia.put(route('products.toggle-status', product.id), {}, {
                    preserveScroll: true,
                    onError: () => {
                        setLocalProducts(prev => prev.map(p =>
                            p.id === product.id ? { ...p, is_active: 1 } : p
                        ));
                    },
                    onSuccess: () => {
                        toast.info(`Produk "${product.name}" otomatis dinonaktifkan karena kadaluwarsa`);
                    }
                });
            });
        }
    }, [localProducts]);

    React.useEffect(() => {
        setLocalProducts(products.data);
        setCurrentPage(products.current_page || 1);
    }, [products.data, products.current_page]);

    React.useEffect(() => {
        autoDeactivateExpiredProducts();
    }, [autoDeactivateExpiredProducts]);

    const uniqueCategories = [...new Set(products.data.map(product => product.category?.name).filter(Boolean))];

    const toggleStatus = async (product) => {
        if (!hasPermission('toggle-product-status') && auth.user.role !== 'warehouse') {
            showPermissionAlert();
            return;
        }

        if (!product.is_active && isProductExpired(product)) {
            toast.error('Tidak dapat mengaktifkan produk yang sudah kadaluwarsa');
            return;
        }

        const isActive = Number(product.is_active);
        const action = isActive === 1 ? 'menonaktifkan' : 'mengaktifkan';
        const consequences = isActive === 1 
            ? '<p style="color:red;"><strong>Produk ini TIDAK AKAN MUNCUL</strong> di halaman penjualan setelah dinonaktifkan.</p>' 
            : '<p style="color:green;"><strong>Produk ini AKAN MUNCUL KEMBALI</strong> di halaman penjualan setelah diaktifkan.</p>';

        const result = await Swal.fire({
            title: isActive === 1 ? 'Nonaktifkan Produk?' : 'Aktifkan Produk?',
            html: `
                <p>Anda yakin ingin <strong>${action}</strong> produk:</p>
                <p><strong>"${product.name}"</strong></p>
                ${consequences}
            `,
            icon: isActive === 1 ? 'warning' : 'info',
            showCancelButton: true,
            confirmButtonText: `Ya, ${action}`,
            cancelButtonText: 'Batal',
            confirmButtonColor: isActive === 1 ? '#d33' : '#3085d6',
            cancelButtonColor: '#aaa',
        });

        if (result.isConfirmed) {
            const oldStatus = product.is_active;
            const newStatus = oldStatus === 1 ? 0 : 1;

            setLocalProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, is_active: newStatus } : p
            ));

            Inertia.put(route('products.toggle-status', product.id), {}, {
                preserveScroll: true,
                onError: () => {
                    setLocalProducts(prev => prev.map(p =>
                        p.id === product.id ? { ...p, is_active: oldStatus } : p
                    ));
                    toast.error('Gagal mengubah status produk');
                },
                onSuccess: () => {
                    toast.success(`Produk "${product.name}" berhasil ${oldStatus === 1 ? 'dinonaktifkan' : 'diaktifkan'}`);
                }
            });
        }
    };

    const handleDelete = async (productId, productName) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Produk "${productName}" akan dihapus secara permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Tidak',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            Inertia.delete(route('products.destroy', productId), {
                onSuccess: () => {
                    toast.success('Produk berhasil dihapus');
                    Swal.fire('Berhasil!', 'Produk telah dihapus.', 'success');
                },
                onError: () => {
                    toast.error('Gagal menghapus produk');
                    Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus produk.', 'error');
                },
            });
        } else {
            Swal.fire('Dibatalkan', 'Produk tidak jadi dihapus.', 'info');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const resetFilters = () => {
        setFilters({
            expired: false,
            nearExpiry: false,
            lowStock: false,
            category: '',
            status: '',
            search: ''
        });
        setCurrentPage(1);
    };

    // Enhanced filtering logic
    const filteredProducts = React.useMemo(() => {
        return localProducts.filter(product => {
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                const matchesCode = product.code.toLowerCase().includes(searchTerm);
                if (!matchesName && !matchesCode) return false;
            }

            if (filters.expired && !isProductExpired(product)) return false;
            if (filters.nearExpiry && !isProductNearExpiry(product)) return false;
            if (filters.lowStock && product.stock > product.min_stock) return false;
            if (filters.category && product.category?.name !== filters.category) return false;
            if (filters.status === 'active' && !product.is_active) return false;
            if (filters.status === 'inactive' && product.is_active) return false;

            return true;
        });
    }, [localProducts, filters]);

    // Pagination logic
    const paginatedProducts = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Create pagination meta
    const paginationMeta = React.useMemo(() => {
        const total = filteredProducts.length;
        const lastPage = Math.ceil(total / itemsPerPage);
        const from = total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
        const to = Math.min(currentPage * itemsPerPage, total);

        return {
            current_page: currentPage,
            last_page: lastPage,
            per_page: itemsPerPage,
            total,
            from,
            to
        };
    }, [filteredProducts.length, currentPage, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of table
        document.querySelector('.products-table')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Statistics
    const stats = React.useMemo(() => {
        const activeProducts = localProducts.filter(p => p.is_active).length;
        const expiredProducts = localProducts.filter(p => isProductExpired(p)).length;
        const nearExpiryProducts = localProducts.filter(p => isProductNearExpiry(p)).length;
        const lowStockProducts = localProducts.filter(p => isLowStock(p)).length;
        
        return {
            total: localProducts.length,
            active: activeProducts,
            expired: expiredProducts,
            nearExpiry: nearExpiryProducts,
            lowStock: lowStockProducts
        };
    }, [localProducts]);

    const getRowClassName = (product) => {
        let baseClasses = 'transition-all duration-200';
        
        if (!product.is_active) {
            return `${baseClasses} bg-gray-50 text-gray-400`;
        }
        
        if (isProductExpired(product)) {
            return `${baseClasses} bg-red-50 border-l-4 border-red-400`;
        }
        
        if (isProductNearExpiry(product)) {
            return `${baseClasses} bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100`;
        }
        
        if (isLowStock(product)) {
            return `${baseClasses} bg-orange-50 border-l-4 border-orange-400 hover:bg-orange-100`;
        }
        
        return `${baseClasses} hover:bg-gray-50`;
    };

    return (
        <Authenticated auth={auth} header="Data Produk">
            <Head title="Produk" />
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Enhanced Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manajemen Produk</h1>
                        </div>
                        
                        {/* Enhanced Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total</p>
                                        <p className="text-xl font-bold text-blue-800">{stats.total}</p>
                                    </div>
                                    <div className="p-2 bg-blue-200 rounded-full">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Aktif</p>
                                        <p className="text-xl font-bold text-green-800">{stats.active}</p>
                                    </div>
                                    <div className="p-2 bg-green-200 rounded-full">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Expired</p>
                                        <p className="text-xl font-bold text-red-800">{stats.expired}</p>
                                    </div>
                                    <div className="p-2 bg-red-200 rounded-full">
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-3 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Hampir Expired</p>
                                        <p className="text-xl font-bold text-yellow-800">{stats.nearExpiry}</p>
                                    </div>
                                    <div className="p-2 bg-yellow-200 rounded-full">
                                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Stok Tipis</p>
                                        <p className="text-xl font-bold text-orange-800">{stats.lowStock}</p>
                                    </div>
                                    <div className="p-2 bg-orange-200 rounded-full">
                                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    {auth.user?.role === 'warehouse' && (
                        <div className="flex-shrink-0">
                            <Link
                                href={route('products.create')}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Tambah Produk
                            </Link>
                        </div>
                    )}
                </div>

                {/* Enhanced Filter Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Enhanced Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Produk</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Nama produk atau kode..."
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                                {filters.search && (
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                            >
                                <option value="">Semua Kategori</option>
                                {uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Enhanced Quick Filters */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, expired: !prev.expired }))}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                filters.expired 
                                    ? 'bg-red-100 text-red-800 ring-2 ring-red-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full mr-2 ${filters.expired ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                            Kadaluwarsa
                            {stats.expired > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    filters.expired ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {stats.expired}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, nearExpiry: !prev.nearExpiry }))}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                filters.nearExpiry 
                                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full mr-2 ${filters.nearExpiry ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                            Hampir Kadaluwarsa
                            {stats.nearExpiry > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    filters.nearExpiry ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {stats.nearExpiry}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                filters.lowStock 
                                    ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-200' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full mr-2 ${filters.lowStock ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                            Stok Tipis
                            {stats.lowStock > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    filters.lowStock ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {stats.lowStock}
                                </span>
                            )}
                        </button>
                        
                        {Object.values(filters).some(f => f) && (
                            <button
                                onClick={resetFilters}
                                className="flex items-center px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-900 text-sm font-medium transition-all duration-200 ml-auto"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden products-table">
                    {/* Table Header with Results Count */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Daftar Produk
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    ({filteredProducts.length} dari {localProducts.length} produk)
                                </span>
                            </h3>
                            <div className="text-sm text-gray-600">
                                Halaman {paginationMeta.current_page} dari {paginationMeta.last_page}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Produk
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Harga
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Stok
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tanggal Expired
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    {auth.user?.role === 'warehouse' && (
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedProducts.map((product) => (
                                    <tr 
                                        key={product.id} 
                                        className={`${getRowClassName(product)} hover:bg-gray-50/50`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image && (
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                            alt={product.name}
                                                            className={`h-12 w-12 rounded-xl object-cover shadow-sm ${!product.is_active ? 'opacity-50' : ''}`}
                                                        />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">
                                                        {product.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.category?.name ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Rp {Number(product.selling_price).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`text-sm font-semibold ${isLowStock(product) ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {product.stock} {product.unit || ''}
                                                </div>
                                                {isLowStock(product) && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Stok Tipis
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Min: {product.min_stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.expired_date ? (
                                                <div className="text-sm">
                                                    {(() => {
                                                        const isExpired = isProductExpired(product);
                                                        const isNearExpiry = isProductNearExpiry(product);
                                                        
                                                        return (
                                                            <div className="flex flex-col">
                                                                <span className={`font-medium ${
                                                                    isExpired ? 'text-red-600' : 
                                                                    isNearExpiry ? 'text-yellow-600' : 'text-gray-900'
                                                                }`}>
                                                                    {formatDate(product.expired_date)}
                                                                </span>
                                                                {isExpired && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                        Expired
                                                                    </span>
                                                                )}
                                                                {isNearExpiry && !isExpired && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                                                        Akan Expired
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(product)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                        product.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                    } ${isProductExpired(product) && !product.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isProductExpired(product) && !product.is_active}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                                                            product.is_active ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                                <span className="ml-3 text-sm">
                                                    {product.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        {auth.user?.role === 'warehouse' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('products.edit', product.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}

                                {paginatedProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={auth.user?.role === 'warehouse' ? 7 : 6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                                    {filters.search ? (
                                                        'Produk tidak ditemukan'
                                                    ) : Object.values(filters).some(f => f) ? (
                                                        'Tidak ada produk yang sesuai dengan filter'
                                                    ) : (
                                                        'Belum ada produk'
                                                    )}
                                                </h3>
                                                <p className="text-sm max-w-md mx-auto text-gray-400 mb-4">
                                                    {filters.search ? (
                                                        `Tidak ada hasil untuk "${filters.search}". Coba dengan kata kunci lain.`
                                                    ) : Object.values(filters).some(f => f) ? (
                                                        'Coba sesuaikan atau reset filter Anda untuk melihat semua produk.'
                                                    ) : (
                                                        'Mulai dengan menambahkan produk baru untuk memulai manajemen inventory Anda.'
                                                    )}
                                                </p>
                                                {Object.values(filters).some(f => f) && (
                                                    <button
                                                        onClick={resetFilters}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Reset Filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enhanced Pagination */}
                {paginationMeta.last_page > 1 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <Pagination 
                            meta={paginationMeta} 
                            onPageChange={handlePageChange}
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </Authenticated>
    );
}