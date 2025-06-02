import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import { FaPlus, FaTrashAlt, FaSearch, FaPrint, FaHistory, FaBarcode, FaExchangeAlt } from 'react-icons/fa';
import { FiUser, FiDollarSign, FiCreditCard, FiChevronDown } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

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
    const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
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
            title: 'Hapus item?',
            text: "Anda yakin ingin menghapus item ini dari keranjang?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!'
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
            });
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId
                ? { ...item, quantity: qty, subtotal: item.price * qty }
                : item
        ));
    };

    // Calculate totals with percentage discount
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

    // Quick payment amount buttons
    const quickPaymentAmounts = [50000, 100000, 150000, 200000, total];

    // Submit sale transaction
    const submitSale = () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Keranjang kosong!',
                text: 'Silakan tambahkan produk terlebih dahulu.',
            });
            return;
        }

        if (data.payment_amount < total) {
            Swal.fire({
                icon: 'error',
                title: 'Pembayaran tidak mencukupi!',
                text: `Kurang: Rp ${(total - data.payment_amount).toLocaleString('id-ID')}`,
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
                        <div class="text-left">
                            <p>Total: <b>Rp ${total.toLocaleString('id-ID')}</b></p>
                            <p>Bayar: <b>Rp ${data.payment_amount.toLocaleString('id-ID')}</b></p>
                            <p>Kembali: <b>Rp ${changeAmount.toLocaleString('id-ID')}</b></p>
                        </div>
                    `,
                    showCancelButton: true,
                    cancelButtonText: 'Tutup'
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
            // Focus search on Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            
            // Submit on Enter in payment amount field
            if (e.key === 'Enter' && document.activeElement.id === 'paymentAmount') {
                submitSale();
            }
            
            // Submit on Ctrl+Enter anywhere
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

    // Load recent transactions (mock data)
    useEffect(() => {
        const mockRecentTransactions = [
            { id: 1, customer_name: 'Pelanggan 1', total: 150000, date: '2023-05-15 10:30' },
            { id: 2, customer_name: 'Pelanggan 2', total: 225000, date: '2023-05-15 11:15' },
            { id: 3, customer_name: '', total: 75000, date: '2023-05-15 12:45' },
        ];
        setRecentTransactions(mockRecentTransactions);
    }, []);

    return (
        <Authenticated auth={auth} header="Kasir">
            <Head title="Kasir" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Product Selection */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Product Search */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        id="searchInput"
                                        type="text"
                                        placeholder="Cari produk (nama/kode) atau tekan Ctrl+F"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowCategories(!showCategories)}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                                    >
                                        <span>{selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}</span>
                                        <FiChevronDown />
                                    </button>
                                    {showCategories && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                            {categories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => {
                                                        setSelectedCategory(category);
                                                        setShowCategories(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${category === selectedCategory ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedProduct(product)}
                                        className={`cursor-pointer p-3 border rounded-lg transition ${selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:border-blue-300'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                                                <p className="text-xs text-gray-500">{product.code}</p>
                                            </div>
                                            {product.stock <= 5 && (
                                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                                    Stok: {product.stock}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex justify-between items-end">
                                            <p className="text-green-600 font-bold">Rp {product.selling_price.toLocaleString('id-ID')}</p>
                                            {product.stock > 0 ? (
                                                <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                                            ) : (
                                                <span className="text-xs text-red-500">Habis</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Selected Product */}
                        {selectedProduct && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-blue-200 p-5"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{selectedProduct.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedProduct.code}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Harga</p>
                                        <p className="text-xl font-semibold text-green-600">
                                            Rp {selectedProduct.selling_price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Stok Tersedia</p>
                                        <p className="text-xl font-semibold">
                                            {selectedProduct.stock}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-500 mb-1">Jumlah</label>
                                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                            <button 
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={selectedProduct.stock}
                                                className="w-full px-3 py-2 text-center focus:outline-none"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setQuantity(Math.min(val, selectedProduct.stock));
                                                }}
                                            />
                                            <button 
                                                onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addToCart}
                                        className="mt-6 flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <FaPlus /> Tambah
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Cart */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Keranjang</h2>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setShowRecentTransactions(!showRecentTransactions)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Riwayat Transaksi"
                                    >
                                        <FaHistory />
                                    </button>
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {cart.length} item
                                    </span>
                                </div>
                            </div>

                            {showRecentTransactions && (
                                <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                                        <h3 className="font-medium">Riwayat Transaksi Terakhir</h3>
                                        <button onClick={() => setShowRecentTransactions(false)} className="text-gray-400 hover:text-gray-600">
                                            ✕
                                        </button>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {recentTransactions.map(transaction => (
                                            <div key={transaction.id} className="px-4 py-3">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            {transaction.customer_name || 'Tanpa nama'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{transaction.date}</p>
                                                    </div>
                                                    <p className="font-semibold text-green-600">
                                                        Rp {transaction.total.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <FaBarcode className="text-gray-400 text-2xl" />
                                    </div>
                                    <p className="text-gray-500">Keranjang kosong. Pilih produk untuk memulai.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {cart.map(item => (
                                        <motion.div 
                                            key={item.product_id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                                                <p className="text-xs text-gray-500">{item.code}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                                    <button 
                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                        className="px-2 py-1 hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.stock}
                                                        className="w-12 px-2 py-1 text-center focus:outline-none"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                        className="px-2 py-1 hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="w-24 text-right font-semibold text-gray-800">
                                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Payment */}
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Pembayaran</h2>

                            <div className="space-y-5">
                                {/* Customer Info */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiUser className="text-gray-500" /> Nama Pelanggan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Nama pelanggan"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                    />
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">Diskon:</span>
                                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                                <button 
                                                    onClick={() => setDiscountType(discountType === 'amount' ? 'percentage' : 'amount')}
                                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs"
                                                >
                                                    {discountType === 'amount' ? 'Rp' : '%'}
                                                </button>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={discountType === 'percentage' ? 100 : subtotal}
                                                    className="w-20 px-2 py-1 border-l border-r border-gray-300 text-right focus:outline-none"
                                                    value={data.discount}
                                                    onChange={(e) => applyDiscount(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <span className="font-medium text-red-600">
                                            - Rp {discountAmount.toLocaleString('id-ID')}
                                            {discountType === 'percentage' && (
                                                <span className="text-xs text-gray-500 ml-1">({data.discount}%)</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                                        <span className="text-gray-800 font-semibold">Total:</span>
                                        <span className="text-green-600 font-bold text-xl">
                                            Rp {total.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiCreditCard className="text-gray-500" /> Metode Pembayaran
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                    >
                                        <option value="cash">Tunai</option>
                                        <option value="debit">Kartu Debit</option>
                                        <option value="credit">Kartu Kredit</option>
                                        <option value="qris">QRIS</option>
                                        <option value="transfer">Transfer Bank</option>
                                    </select>
                                </div>

                                {/* Payment Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiDollarSign className="text-gray-500" /> Jumlah Bayar
                                    </label>
                                    <input
                                        id="paymentAmount"
                                        type="number"
                                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={data.payment_amount || ''}
                                        onChange={(e) => setData('payment_amount', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {quickPaymentAmounts.map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => setData('payment_amount', amount === total ? total : amount)}
                                                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                                            >
                                                {amount === total ? 'Pas' : `Rp ${amount.toLocaleString('id-ID')}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Change Amount */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Kembalian</p>
                                            <p className={`text-xl font-bold ${changeAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                Rp {Math.abs(changeAmount).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        {changeAmount < 0 && (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <FaExchangeAlt />
                                                <span className="text-sm">Kurang</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    ref={submitButtonRef}
                                    onClick={submitSale}
                                    disabled={processing || cart.length === 0 || data.payment_amount < total}
                                    className={`w-full py-4 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                                        processing 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : cart.length === 0 || data.payment_amount < total
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                                    }`}
                                >
                                    {processing ? (
                                        'Menyimpan...'
                                    ) : (
                                        <>
                                            <FaPrint />
                                            {data.payment_amount < total ? 'Pembayaran Kurang' : 'Simpan & Cetak Struk (Ctrl+Enter)'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                        >
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Aksi Cepat</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => {
                                        setCart([]);
                                        setData({
                                            customer_name: '',
                                            payment_method: 'cash',
                                            payment_amount: 0,
                                            discount: 0,
                                        });
                                        setDiscountType('amount');
                                    }}
                                    className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm flex items-center justify-center gap-1"
                                >
                                    <FaTrashAlt size={12} /> Bersihkan
                                </button>
                                <button 
                                    onClick={() => setData('payment_amount', total)}
                                    className="py-2 px-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                                >
                                    Bayar Pas
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}