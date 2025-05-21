import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';


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

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add selected product to cart
    const addToCart = () => {
        if (!selectedProduct || quantity < 1 || quantity > selectedProduct.stock) return;

        const existingItem = cart.find(item => item.product_id === selectedProduct.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > selectedProduct.stock) return alert('Stok tidak mencukupi!');
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
        setCart(cart.filter(item => item.product_id !== productId));
    };

    // Update item quantity in cart
    const updateQuantity = (productId, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (qty < 1) return;

        const item = cart.find(item => item.product_id === productId);
        if (qty > item.stock) return alert('Stok tidak mencukupi!');

        setCart(cart.map(item =>
            item.product_id === productId
                ? { ...item, quantity: qty, subtotal: item.price * qty }
                : item
        ));
    };

    // Calculate total and change amount
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const changeAmount = data.payment_amount - total;

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
            text: 'Jumlah pembayaran kurang dari total belanja.',
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
        total,
        total_amount: total,
        change_amount: changeAmount,
    });

    post(route('sales.store'), {
        onSuccess: () => {
            reset();
            setCart([]);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Transaksi berhasil disimpan.',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    });
};


return (
    <Authenticated auth={auth} header="Transaksi Baru">
        <Head title="Transaksi Baru" />

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bagian Produk & Keranjang */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pencarian Produk */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cari Produk</h2>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau kode produk..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`cursor-pointer p-4 border rounded-xl shadow-sm hover:shadow-lg transition ${
                                        selectedProduct?.id === product.id ? 'bg-blue-100 border-blue-500' : ''
                                    }`}
                                >
                                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.code}</p>
                                    <p className="text-green-600 font-bold mt-2">Rp {product.price_formatted}</p>
                                    <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tambah Produk Terpilih */}
                    {selectedProduct && (
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-lg font-bold mb-2">{selectedProduct.name}</h3>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedProduct.stock}
                                    className="w-24 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        setQuantity(Math.min(val, selectedProduct.stock));
                                    }}
                                />
                                <button
                                    onClick={addToCart}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <FaPlus /> Tambah
                                </button>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Keranjang */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Keranjang</h2>
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-500">Keranjang kosong.</p>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <p className="font-medium text-gray-700">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.code}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.stock}
                                                className="w-16 border rounded-lg text-center px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                                            />
                                            <p className="w-24 text-right font-semibold text-gray-800">
                                                Rp {item.subtotal.toLocaleString('id-ID')}
                                            </p>
                                            <button
                                                onClick={() => removeFromCart(item.product_id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bagian Pembayaran */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-5">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pembayaran</h2>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Total Belanja</label>
                            <div className="text-3xl font-bold text-green-600">
                                Rp {total.toLocaleString('id-ID')}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Nama Pelanggan (Opsional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Metode Pembayaran</label>
                            <select
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                            >
                                <option value="cash">Tunai</option>
                                <option value="debit">Kartu Debit</option>
                                <option value="credit">Kartu Kredit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Jumlah Bayar</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.payment_amount}
                                onChange={(e) => setData('payment_amount', parseInt(e.target.value || 0))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Kembalian</label>
                            <div className="text-2xl font-semibold text-blue-600">
                                Rp {changeAmount > 0 ? changeAmount.toLocaleString('id-ID') : 0}
                            </div>
                        </div>

                        <button
                            onClick={submitSale}
                            disabled={processing || cart.length === 0}
                            className={`w-full py-3 text-white font-semibold rounded-xl transition duration-200 ${
                                processing || cart.length === 0
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Authenticated>
);

}
