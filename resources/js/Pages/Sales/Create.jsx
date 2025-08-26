import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import { FaPlus, FaTrashAlt, FaSearch, FaPrint, FaHistory, FaBarcode, FaExchangeAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiUser, FiDollarSign, FiCreditCard, FiChevronDown, FiPackage, FiShoppingCart, FiGrid, FiList } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function Create({ auth, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        payment_method: 'cash',
        payment_amount: 0,
        total_amount: 0,
        total: 0,
        change_amount: 0,
        discount: 0,
        items: [],
    });

    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showCategories, setShowCategories] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [showRecentTransactions, setShowRecentTransactions] = useState(false);
    const [discountType, setDiscountType] = useState('amount');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);
    
    const submitButtonRef = useRef(null);

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(product => product.category))];

    // Filter products based on search term and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset pagination when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    // Pagination component
    const Pagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} dari {filteredProducts.length} produk
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaChevronLeft />
                    </button>
                    
                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="text-gray-400">...</span>}
                        </>
                    )}
                    
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                                currentPage === number
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            {number}
                        </button>
                    ))}
                    
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    // Add selected product to cart
    const addToCart = () => {
        if (!selectedProduct || quantity < 1 || quantity > selectedProduct.stock) return;

        const existingItem = cart.find(item => item.product_id === selectedProduct.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > selectedProduct.stock) {
                Swal.fire({
                    icon: 'error',
                    title: 'Stok tidak mencukupi!',
                    text: `Stok tersedia: ${selectedProduct.stock}`,
                    confirmButtonColor: '#3B82F6',
                });
                return;
            }
            setCart(cart.map(item =>
                item.product_id === selectedProduct.id
                    ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
                    : item
            ));
        } else {
            setCart([
                ...cart,
                {
                    product_id: selectedProduct.id,
                    name: selectedProduct.name,
                    code: selectedProduct.code,
                    price: selectedProduct.selling_price,
                    quantity,
                    subtotal: selectedProduct.selling_price * quantity,
                    stock: selectedProduct.stock,
                }
            ]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        Swal.fire({
            title: 'Hapus item dari keranjang?',
            text: "Item akan dihapus dari keranjang belanja",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                setCart(cart.filter(item => item.product_id !== productId));
            }
        });
    };

    // Update item quantity in cart
    const updateQuantity = (productId, newQuantity) => {
        const qty = parseInt(newQuantity) || 1;
        if (qty < 1) return;

        const item = cart.find(item => item.product_id === productId);
        if (qty > item.stock) {
            Swal.fire({
                icon: 'error',
                title: 'Stok tidak mencukupi!',
                text: `Stok tersedia: ${item.stock}`,
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId
                ? { ...item, quantity: qty, subtotal: item.price * qty }
                : item
        ));
    };

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = discountType === 'percentage' 
        ? subtotal * (data.discount / 100)
        : data.discount;
    const total = subtotal - discountAmount;
    const changeAmount = data.payment_amount - total;

    // Apply discount based on type
    const applyDiscount = (discountValue) => {
        const discount = parseFloat(discountValue) || 0;
        const maxDiscount = discountType === 'percentage' ? 100 : subtotal;
        setData('discount', Math.min(discount, maxDiscount));
    };

    // Quick payment amounts
    const quickPaymentAmounts = [50000, 100000, 200000, 500000, total];

    // Submit sale transaction
    const submitSale = () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Keranjang masih kosong!',
                text: 'Silakan tambahkan produk terlebih dahulu.',
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        if (data.payment_amount < total) {
            Swal.fire({
                icon: 'error',
                title: 'Pembayaran tidak mencukupi!',
                text: `Kurang: Rp ${(total - data.payment_amount).toLocaleString('id-ID')}`,
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        setData({
            ...data,
            items: cart.map(item => ({
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
            })),
            total_amount: total,
            total: total,
            change_amount: changeAmount,
        });

        post(route('sales.store'), {
            onSuccess: () => {
                reset();
                setCart([]);
                setData('payment_amount', 0);
                setData('discount', 0);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Transaksi Berhasil!',
                    html: `
                        <div class="text-left space-y-2 mt-4">
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Total:</span>
                                <span class="font-bold text-green-600">Rp ${total.toLocaleString('id-ID')}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span>Bayar:</span>
                                <span class="font-bold">Rp ${data.payment_amount.toLocaleString('id-ID')}</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span>Kembalian:</span>
                                <span class="font-bold text-orange-600">Rp ${changeAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    `,
                    showCancelButton: false,
                    cancelButtonText: 'Tutup',
                    cancelButtonColor: '#6B7280',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.print();
                    }
                });
            }
        });
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            
            if (e.key === 'Enter' && document.activeElement.id === 'paymentAmount') {
                submitSale();
            }
            
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (submitButtonRef.current) {
                    submitButtonRef.current.click();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Authenticated auth={auth} header="Point of Sale">
            <Head title="Point of Sale - Kasir" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* Header Stats */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                    >
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Produk</p>
                                    <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FiPackage className="text-blue-600 text-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Item di Keranjang</p>
                                    <p className="text-2xl font-bold text-green-600">{cart.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FiShoppingCart className="text-green-600 text-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Keranjang</p>
                                    <p className="text-2xl font-bold text-purple-600">Rp {subtotal.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <FiDollarSign className="text-purple-600 text-xl" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Kembalian</p>
                                    <p className={`text-2xl font-bold ${changeAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        Rp {Math.abs(changeAmount).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <FaExchangeAlt className="text-orange-600 text-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Product Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Search & Filter */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Daftar Produk</h2>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={`Tampilan ${viewMode === 'grid' ? 'List' : 'Grid'}`}
                                            >
                                                {viewMode === 'grid' ? <FiList /> : <FiGrid />}
                                            </button>
                                            <select
                                                value={productsPerPage}
                                                onChange={(e) => {
                                                    setProductsPerPage(parseInt(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={8}>8 per halaman</option>
                                                <option value={12}>12 per halaman</option>
                                                <option value={16}>16 per halaman</option>
                                                <option value={24}>24 per halaman</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaSearch className="text-gray-400" />
                                            </div>
                                            <input
                                                id="searchInput"
                                                type="text"
                                                placeholder="Cari produk berdasarkan nama atau kode..."
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowCategories(!showCategories)}
                                                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors min-w-[200px] justify-between"
                                            >
                                                <span className="capitalize">
                                                    {selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}
                                                </span>
                                                <FiChevronDown className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {showCategories && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-20 border border-gray-200 py-2"
                                                    >
                                                        {categories.map(category => (
                                                            <button
                                                                key={category}
                                                                onClick={() => {
                                                                    setSelectedCategory(category);
                                                                    setShowCategories(false);
                                                                }}
                                                                className={`block w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors capitalize ${
                                                                    category === selectedCategory ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {category === 'all' ? 'Semua Kategori' : category}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Product Grid/List */}
                                    <AnimatePresence mode="wait">
                                        {paginatedProducts.length === 0 ? (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-12"
                                            >
                                                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <FaSearch className="text-gray-400 text-2xl" />
                                                </div>
                                                <p className="text-gray-500 text-lg">Produk tidak ditemukan</p>
                                                <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci pencarian atau kategori</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={viewMode === 'grid' 
                                                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" 
                                                    : "space-y-3"
                                                }
                                            >
                                                {paginatedProducts.map((product, index) => (
                                                    <motion.div
                                                        key={product.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedProduct(product)}
                                                        className={`cursor-pointer border rounded-xl transition-all duration-200 ${
                                                            selectedProduct?.id === product.id 
                                                                ? 'bg-blue-50 border-blue-300 shadow-md' 
                                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                        } ${viewMode === 'grid' ? 'p-4' : 'p-3'}`}
                                                    >
                                                        {viewMode === 'grid' ? (
                                                            <>
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
                                                                            {product.name}
                                                                        </h3>
                                                                        <p className="text-xs text-gray-500 mt-1">{product.code}</p>
                                                                    </div>
                                                                    {product.stock <= 5 && product.stock > 0 && (
                                                                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full ml-2 whitespace-nowrap">
                                                                            Stok: {product.stock}
                                                                        </span>
                                                                    )}
                                                                    {product.stock === 0 && (
                                                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full ml-2">
                                                                            Habis
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex justify-between items-end">
                                                                    <div>
                                                                        <p className="text-green-600 font-bold text-sm">
                                                                            Rp {product.selling_price.toLocaleString('id-ID')}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Stok: {product.stock}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                                                        {product.category}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                                                            <p className="text-sm text-gray-500">{product.code}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-green-600 font-bold">
                                                                                Rp {product.selling_price.toLocaleString('id-ID')}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                                                                {product.category}
                                                                            </span>
                                                                            {product.stock <= 5 && product.stock > 0 && (
                                                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                                                    Terbatas
                                                                                </span>
                                                                            )}
                                                                            {product.stock === 0 && (
                                                                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                                                                    Habis
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Pagination */}
                                    <Pagination />
                                </div>
                            </motion.div>

                            {/* Selected Product Details */}
                            <AnimatePresence>
                                {selectedProduct && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        className="bg-white rounded-xl shadow-sm border border-blue-200"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{selectedProduct.code}</p>
                                                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                                                        {selectedProduct.category}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedProduct(null)}
                                                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 mb-6">
                                                <div className="bg-green-50 p-4 rounded-xl">
                                                    <p className="text-sm text-green-700 mb-1">Harga Jual</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        Rp {selectedProduct.selling_price.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-xl">
                                                    <p className="text-sm text-blue-700 mb-1">Stok Tersedia</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {selectedProduct.stock} unit
                                                    </p>
                                                    {selectedProduct.stock <= 5 && selectedProduct.stock > 0 && (
                                                        <p className="text-xs text-yellow-600 mt-1">⚠️ Stok terbatas!</p>
                                                    )}
                                                    {selectedProduct.stock === 0 && (
                                                        <p className="text-xs text-red-600 mt-1">❌ Stok habis!</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Jumlah yang akan dibeli
                                                    </label>
                                                    <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                                                        <button 
                                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={selectedProduct.stock}
                                                            className="flex-1 px-4 py-3 text-center text-lg font-semibold focus:outline-none focus:bg-blue-50"
                                                            value={quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 1;
                                                                setQuantity(Math.min(val, selectedProduct.stock));
                                                            }}
                                                        />
                                                        <button 
                                                            onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                                                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                                                    <p className="text-xl font-bold text-gray-800 mb-2">
                                                        Rp {(selectedProduct.selling_price * quantity).toLocaleString('id-ID')}
                                                    </p>
                                                    <button
                                                        onClick={addToCart}
                                                        disabled={selectedProduct.stock === 0}
                                                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                                            selectedProduct.stock === 0
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                                        }`}
                                                    >
                                                        <FaPlus /> {selectedProduct.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Shopping Cart */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                            <FiShoppingCart />
                                            Keranjang Belanja
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setShowRecentTransactions(!showRecentTransactions)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Riwayat Transaksi"
                                            >
                                                <FaHistory />
                                            </button>
                                            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                                {cart.length} item
                                            </span>
                                        </div>
                                    </div>

                                    {/* Recent Transactions */}
                                    <AnimatePresence>
                                        {showRecentTransactions && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-6 border border-gray-200 rounded-xl overflow-hidden"
                                            >
                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex justify-between items-center">
                                                    <h3 className="font-medium text-gray-800">Riwayat Transaksi Terakhir</h3>
                                                    <button 
                                                        onClick={() => setShowRecentTransactions(false)} 
                                                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="divide-y divide-gray-200">
                                                    {recentTransactions.map(transaction => (
                                                        <div key={transaction.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-800">
                                                                        {transaction.customer_name || 'Pelanggan Umum'}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <p className="text-xs text-gray-500">{transaction.date}</p>
                                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                                            {transaction.items} items
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <p className="font-bold text-green-600">
                                                                    Rp {transaction.total.toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {cart.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <FiShoppingCart className="text-gray-400 text-3xl" />
                                            </div>
                                            <p className="text-gray-500 text-lg mb-2">Keranjang masih kosong</p>
                                            <p className="text-gray-400 text-sm">Pilih produk untuk memulai transaksi</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                            <AnimatePresence>
                                                {cart.map(item => (
                                                    <motion.div 
                                                        key={item.product_id}
                                                        layout
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                                                            <p className="text-sm text-gray-500">{item.code}</p>
                                                            <p className="text-sm text-green-600 font-medium mt-1">
                                                                Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                                <button 
                                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.stock}
                                                                    className="w-14 px-2 py-2 text-center font-semibold focus:outline-none focus:bg-blue-50"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                                                />
                                                                <button 
                                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <div className="w-28 text-right">
                                                                <p className="font-bold text-gray-800">
                                                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item.product_id)}
                                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus dari keranjang"
                                                            >
                                                                <FaTrashAlt />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Payment Section */}
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6"
                            >
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                        <FiCreditCard />
                                        Pembayaran
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Customer Information */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <FiUser className="text-gray-500" /> 
                                                Nama Pelanggan <span className="text-gray-400">(Opsional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Masukkan nama pelanggan..."
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                            />
                                        </div>

                                        {/* Order Summary */}
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <h3 className="font-medium text-gray-800 mb-3">Ringkasan Pesanan</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal ({cart.length} items):</span>
                                                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">Diskon:</span>
                                                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                                            <button 
                                                                onClick={() => setDiscountType(discountType === 'amount' ? 'percentage' : 'amount')}
                                                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-medium transition-colors"
                                                            >
                                                                {discountType === 'amount' ? 'Rp' : '%'}
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={discountType === 'percentage' ? 100 : subtotal}
                                                                className="w-20 px-2 py-1 text-right text-xs focus:outline-none border-l border-r border-gray-300"
                                                                value={data.discount}
                                                                onChange={(e) => applyDiscount(e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-red-600">
                                                        - Rp {discountAmount.toLocaleString('id-ID')}
                                                        {discountType === 'percentage' && data.discount > 0 && (
                                                            <span className="text-xs text-gray-500 ml-1">({data.discount}%)</span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-300 pt-2 flex justify-between">
                                                    <span className="text-gray-800 font-semibold">Total Pembayaran:</span>
                                                    <span className="text-green-600 font-bold text-lg">
                                                        Rp {total.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Metode Pembayaran
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={data.payment_method}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                            >
                                                <option value="cash">💵 Tunai</option>
                                                <option value="debit">💳 Kartu Debit</option>
                                                <option value="credit">💳 Kartu Kredit</option>
                                                <option value="qris">📱 QRIS</option>
                                                <option value="transfer">🏦 Transfer Bank</option>
                                            </select>
                                        </div>

                                        {/* Payment Amount */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <FiDollarSign className="text-gray-500" /> 
                                                Jumlah yang Dibayar
                                            </label>
                                            <input
                                                id="paymentAmount"
                                                type="number"
                                                className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={data.payment_amount || ''}
                                                onChange={(e) => setData('payment_amount', parseInt(e.target.value) || 0)}
                                                placeholder="Masukkan jumlah pembayaran..."
                                            />
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                {quickPaymentAmounts.map((amount, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setData('payment_amount', amount === total ? total : amount)}
                                                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                                    >
                                                        {amount === total ? '💯 Pas' : `Rp ${amount.toLocaleString('id-ID')}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Change Amount */}
                                        <div className={`p-4 rounded-xl ${changeAmount >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`text-sm ${changeAmount >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                                        {changeAmount >= 0 ? 'Kembalian' : 'Kekurangan'}
                                                    </p>
                                                    <p className={`text-2xl font-bold ${changeAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        Rp {Math.abs(changeAmount).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className={`p-3 rounded-full ${changeAmount >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                                                    <FaExchangeAlt className={`text-xl ${changeAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            ref={submitButtonRef}
                                            onClick={submitSale}
                                            disabled={processing || cart.length === 0 || data.payment_amount < total}
                                            className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                                                processing 
                                                    ? 'bg-blue-400 cursor-not-allowed' 
                                                    : cart.length === 0 || data.payment_amount < total
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPrint />
                                                    {data.payment_amount < total 
                                                        ? `Kurang Rp ${(total - data.payment_amount).toLocaleString('id-ID')}` 
                                                        : 'Proses & Cetak Struk'
                                                    }
                                                </>
                                            )}
                                        </button>
                                        
                                        {!processing && cart.length > 0 && data.payment_amount >= total && (
                                            <p className="text-xs text-gray-500 text-center">
                                                💡 Tekan Ctrl+Enter untuk proses cepat
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                            >
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => {
                                            Swal.fire({
                                                title: 'Bersihkan semua?',
                                                text: "Ini akan menghapus semua item dan reset form",
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#EF4444',
                                                cancelButtonColor: '#6B7280',
                                                confirmButtonText: 'Ya, bersihkan!',
                                                cancelButtonText: 'Batal'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    setCart([]);
                                                    setData({
                                                        customer_name: '',
                                                        payment_method: 'cash',
                                                        payment_amount: 0,
                                                        discount: 0,
                                                    });
                                                    setDiscountType('amount');
                                                    setSelectedProduct(null);
                                                }
                                            });
                                        }}
                                        className="py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <FaTrashAlt /> Bersihkan Semua
                                    </button>
                                    <button 
                                        onClick={() => setData('payment_amount', total)}
                                        disabled={total === 0}
                                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                                            total === 0 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                    >
                                        💯 Bayar Pas
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}