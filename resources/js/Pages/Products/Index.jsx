import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import Authenticated from '@/Layouts/Authenticated';
import Pagination from '@/Components/Pagination';
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

export default function Index() {
    const { products, auth, categories } = usePage().props;
    const [localProducts, setLocalProducts] = React.useState(products.data);
    const [filters, setFilters] = React.useState({
        expired: false,
        nearExpiry: false,
        lowStock: false,
        category: '',
        status: '',
        search: ''
    });

    // Cek permission berdasarkan role
    // Replace the existing hasPermission function with this updated version
const hasPermission = (requiredPermission) => {
    const userRoles = auth?.user?.roles || [];
    
    // Check if user has the required permission directly
    if (auth?.user?.permissions?.includes(requiredPermission)) {
        return true;
    }
    
    // Check if any of the user's roles has the required permission
    const hasPermissionViaRole = userRoles.some(role => 
        role.permissions?.includes(requiredPermission)
    );
    
    if (hasPermissionViaRole) {
        return true;
    }
    
    // Special case for warehouse role
    if (userRoles.some(role => role.name === 'warehouse')) {
        // Define which permissions warehouse should have
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

// Fungsi untuk mengecek role
    const hasRole = (roleName) => {
        return auth?.user?.roles?.some(role => role.name === roleName);
    };

    // Fungsi untuk mengecek permission atau role warehouse
    const canAccess = (permission) => {
        return hasPermission(permission) || hasRole('warehouse');
    };

    // const hasWarehouseRole = () => {
    //     const userRoles = auth?.user?.roles?.map(role => role.name) || [];
    //     return userRoles.includes('warehouse');
    // };
    // Tampilkan alert jika tidak memiliki permission
    const showPermissionAlert = () => {
        Swal.fire({
            title: 'Akses Ditolak',
            text: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
            icon: 'error',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: '#3085d6',
        });
    };

    // Helper function to check if product is expired
    const isProductExpired = (product) => {
        if (!product.expired_date) return false;
        
        const expiredDate = new Date(product.expired_date);
        const today = new Date();
        
        // Set waktu ke awal hari untuk perbandingan yang akurat
        expiredDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        return expiredDate < today;
    };

    // Helper function to check if product is near expiry (within 1 month)
    const isProductNearExpiry = (product) => {
        if (!product.expired_date) return false;
        
        const expiredDate = new Date(product.expired_date);
        const today = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);
        
        // Set waktu ke awal hari untuk perbandingan yang akurat
        expiredDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        oneMonthFromNow.setHours(0, 0, 0, 0);
        
        // Produk hampir kadaluwarsa jika: belum expired tapi akan expired dalam 1 bulan
        return expiredDate >= today && expiredDate <= oneMonthFromNow;
    };

    // Helper function to check if product has low stock
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
                // Update local state immediately
                setLocalProducts(prev => prev.map(p =>
                    p.id === product.id ? { ...p, is_active: 0 } : p
                ));

                // Send request to server
                Inertia.put(route('products.toggle-status', product.id), {}, {
                    preserveScroll: true,
                    onError: () => {
                        // Rollback if failed
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

    // Update local products when props change and auto-deactivate expired products
    React.useEffect(() => {
        setLocalProducts(products.data);
    }, [products.data]);

    // Check for expired products every time localProducts changes
    React.useEffect(() => {
        autoDeactivateExpiredProducts();
    }, [autoDeactivateExpiredProducts]);

    // Get unique categories from products
    const uniqueCategories = [...new Set(products.data.map(product => product.category?.name).filter(Boolean))];

const toggleStatus = async (product) => {
    // Cek permission atau role warehouse
    if (!hasPermission('toggle-product-status') && auth.user.role !== 'warehouse') {
        showPermissionAlert();
        return;
    }

    // Prevent manual activation of expired products
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

        // Optimistic update
        setLocalProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, is_active: newStatus } : p
        ));

        Inertia.put(route('products.toggle-status', product.id), {}, {
            preserveScroll: true,
            onError: () => {
                // Rollback jika gagal
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
    };

    // Fixed filtering logic
    const filteredProducts = React.useMemo(() => {
        return localProducts.filter(product => {
            // Filter by search term (product name or code)
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                const matchesCode = product.code.toLowerCase().includes(searchTerm);
                if (!matchesName && !matchesCode) return false;
            }

            // Filter by expired status - show only expired products when checked
            if (filters.expired) {
                if (!isProductExpired(product)) return false;
            }

            // Filter by near expiry status - show only products near expiry when checked
            if (filters.nearExpiry) {
                if (!isProductNearExpiry(product)) return false;
            }

            // Filter by low stock - show only products with low stock when checked
            if (filters.lowStock) {
                if (product.stock > product.min_stock) return false; // Stock is above minimum, exclude it
            }

            // Filter by category
            if (filters.category && product.category?.name !== filters.category) {
                return false;
            }

            // Filter by status
            if (filters.status === 'active' && !product.is_active) {
                return false;
            }
            if (filters.status === 'inactive' && product.is_active) {
                return false;
            }

            return true;
        });
    }, [localProducts, filters]);

    // Count statistics based on all local products
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

    // Function to get row className based on product status
    const getRowClassName = (product) => {
        let baseClasses = 'transition';
        
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
            <div className="container mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manajemen Produk</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center text-sm bg-blue-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Total: <span className="font-semibold ml-1">{stats.total}</span>
                            </div>
                            <div className="flex items-center text-sm bg-green-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Aktif: <span className="font-semibold ml-1">{stats.active}</span>
                            </div>
                            <div className="flex items-center text-sm bg-red-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                Kadaluwarsa: <span className="font-semibold ml-1">{stats.expired}</span>
                            </div>
                            <div className="flex items-center text-sm bg-yellow-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                Hampir Kadaluwarsa: <span className="font-semibold ml-1">{stats.nearExpiry}</span>
                            </div>
                            <div className="flex items-center text-sm bg-orange-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                Stok Tipis: <span className="font-semibold ml-1">{stats.lowStock}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Button Tambah Produk */}
                     <div className="flex gap-3">
                        {auth.user?.role === 'warehouse' && (
                                <Link
                                    href={route('products.create')}
                                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow hover:shadow-md transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Tambah Produk
                                </Link>
                            )}
                            </div>
                    </div>
                    {/* Filter Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Produk</label>
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
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full border border-gray-200 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Kategori</option>
                                    {uniqueCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, expired: !prev.expired }))}
                                className={`flex items-center px-3 py-1.5 rounded-full text-sm ${filters.expired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'} hover:bg-red-50 transition`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${filters.expired ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                Kadaluwarsa
                            </button>
                            
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, nearExpiry: !prev.nearExpiry }))}
                                className={`flex items-center px-3 py-1.5 rounded-full text-sm ${filters.nearExpiry ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'} hover:bg-yellow-50 transition`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${filters.nearExpiry ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                                Hampir Kadaluwarsa
                            </button>
                            
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
                                className={`flex items-center px-3 py-1.5 rounded-full text-sm ${filters.lowStock ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'} hover:bg-orange-50 transition`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${filters.lowStock ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                Stok Tipis
                            </button>
                            
                            {Object.values(filters).some(f => f) && (
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm transition ml-auto"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        {auth.user?.role === 'warehouse' && (
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr 
                                        key={product.id} 
                                        className={`${getRowClassName(product)} hover:bg-gray-50/50`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {product.image && (
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                            alt={product.name}
                                                            className={`h-10 w-10 rounded-lg object-cover ${!product.is_active ? 'opacity-50' : ''}`}
                                                        />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.category?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Rp {Number(product.selling_price).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${isLowStock(product) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                {product.stock} {product.unit || ''}
                                            </div>
                                            <div className="text-xs text-gray-500">Min: {product.min_stock}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.expired_date ? (
                                                <div className="text-sm">
                                                    {(() => {
                                                        const isExpired = isProductExpired(product);
                                                        const isNearExpiry = isProductNearExpiry(product);
                                                        
                                                        return (
                                                            <span className={isExpired ? 'text-red-600 font-medium' : isNearExpiry ? 'text-yellow-600 font-medium' : ''}>
                                                                {formatDate(product.expired_date)}
                                                                {isExpired && (
                                                                    <span className="block text-xs text-red-500">Expired</span>
                                                                )}
                                                                {isNearExpiry && !isExpired && (
                                                                    <span className="block text-xs text-yellow-500">Akan kadaluwarsa</span>
                                                                )}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(product)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        product.is_active ? 'bg-green-500' : 'bg-gray-300'
                                                    } ${isProductExpired(product) && !product.is_active ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isProductExpired(product) && !product.is_active}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                                            product.is_active ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                                <span className="ml-2 text-sm">
                                                    {product.is_active ? (
                                                        <span className="text-green-600 font-medium">Aktif</span>
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                           
                                            {auth.user?.role === 'warehouse' && (
                                            <>
                                                <Link
                                                    href={route('products.edit', product.id)}
                                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center mr-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>

                                                <button
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="text-red-600 hover:text-red-800 inline-flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Hapus
                                        </button>


                                            </>
                                        )}

                                            
                                        </td>
                                    </tr>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h3 className="text-lg font-medium text-gray-500 mb-1">
                                                    {filters.search ? (
                                                        'Produk tidak ditemukan'
                                                    ) : Object.values(filters).some(f => f) ? (
                                                        'Tidak ada produk yang sesuai dengan filter'
                                                    ) : (
                                                        'Belum ada produk'
                                                    )}
                                                </h3>
                                                <p className="text-sm max-w-md mx-auto">
                                                    {filters.search ? (
                                                        `Tidak ada hasil untuk "${filters.search}". Coba dengan kata kunci lain.`
                                                    ) : Object.values(filters).some(f => f) ? (
                                                        'Coba sesuaikan atau reset filter Anda untuk melihat semua produk.'
                                                    ) : (
                                                        'Mulai dengan menambahkan produk baru.'
                                                    )}
                                                </p>
                                                {Object.values(filters).some(f => f) && (
                                                    <button
                                                        onClick={resetFilters}
                                                        className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                                                    >
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

                {/* Pagination */}
                {products.meta && products.meta.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination meta={products.meta} />
                    </div>
                )}
            </div>
        </Authenticated>
    );
}