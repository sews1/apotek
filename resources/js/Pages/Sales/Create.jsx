import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

export default function Create({ auth, products }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        payment_method: 'cash',
        payment_amount: 0,
        total_amount: 0,
        total: 0,
        change_amount: 0,
        items: [],
    });

    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addToCart = () => {
        if (!selectedProduct || quantity < 1 || quantity > selectedProduct.stock) return;

        const existingItem = cart.find(item => item.product_id === selectedProduct.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > selectedProduct.stock) {
                alert('Stok tidak mencukupi!');
                return;
            }

            setCart(cart.map(item =>
                item.product_id === selectedProduct.id
                    ? {
                        ...item,
                        quantity: newQuantity,
                        subtotal: selectedProduct.selling_price * newQuantity
                    }
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
                    quantity: quantity,
                    subtotal: selectedProduct.selling_price * quantity,
                    stock: selectedProduct.stock,
                }
            ]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (qty < 1) return;

        const item = cart.find(item => item.product_id === productId);
        if (qty > item.stock) {
            alert('Stok tidak mencukupi!');
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId
                ? {
                    ...item,
                    quantity: qty,
                    subtotal: item.price * qty,
                }
                : item
        ));
    };

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const changeAmount = data.payment_amount - total;

    const submitSale = () => {
        if (cart.length === 0) {
            alert('Keranjang masih kosong!');
            return;
        }

        setData(data => ({
            ...data,
            items: cart.map(item => ({
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
            })),
            total,
            total_amount: total,
            change_amount: data.payment_amount - total,
        }));

        post(route('sales.store'), {
            onSuccess: () => {
                reset();
                setCart([]);
                alert('Transaksi berhasil disimpan.');
            }
        });
    };

    return (
        <Authenticated auth={auth} header="Transaksi Baru">
            <Head title="Transaksi Baru" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Produk */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Cari Produk */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">Pilih Produk</h2>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="w-full px-4 py-2 border rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className={`border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${
                                            selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-300' : ''
                                        }`}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.code}</div>
                                        <div className="text-green-600 font-bold mt-1">
                                            Rp {product.price_formatted}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Stok: {product.stock}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tambah Produk */}
                        {selectedProduct && (
                            <div className="bg-white shadow rounded-lg p-4">
                                <h3 className="font-medium mb-2">{selectedProduct.name}</h3>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedProduct.stock}
                                        className="w-20 px-3 py-2 border rounded-md"
                                        value={quantity}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value || 1);
                                            setQuantity(Math.min(value, selectedProduct.stock));
                                        }}
                                    />
                                    <button
                                        onClick={addToCart}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Tambahkan
                                    </button>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Keranjang */}
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">Keranjang Belanja</h2>
                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Belum ada produk di keranjang
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border-b">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.code}</div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.stock}
                                                    className="w-16 px-2 py-1 border rounded text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                                />
                                                <div className="w-24 text-right font-medium">
                                                    Rp {item.subtotal.toLocaleString('id-ID')}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pembayaran */}
                    <div className="space-y-4">
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4">Pembayaran</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Belanja
                                    </label>
                                    <div className="text-2xl font-bold text-green-600">
                                        Rp {total.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Id (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                    />
                                    {errors.user_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.user_id}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Invoice Number (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                    />
                                    {errors.invoice_number && (
                                        <div className="text-red-500 text-sm mt-1">{errors.invoice_number}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Pelanggan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                    />
                                    {errors.customer_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.customer_name}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Metode Pembayaran
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                    >
                                        <option value="cash">Tunai</option>
                                        <option value="debit">Debit Card</option>
                                        <option value="credit">Credit Card</option>
                                    </select>
                                    {errors.payment_method && (
                                        <div className="text-red-500 text-sm mt-1">{errors.payment_method}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Bayar
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={data.payment_amount}
                                        onChange={(e) => setData('payment_amount', parseInt(e.target.value || 0))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kembalian
                                    </label>
                                    <div className="text-xl font-semibold text-blue-600">
                                        Rp {changeAmount > 0 ? changeAmount.toLocaleString('id-ID') : 0}
                                    </div>
                                </div>

                                <button
                                    onClick={submitSale}
                                    disabled={processing || cart.length === 0}
                                    className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                                        processing || cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {processing ? 'Memproses...' : 'Simpan Transaksi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
