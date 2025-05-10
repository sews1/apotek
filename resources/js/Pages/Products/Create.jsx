import React, { useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

export default function Create({ auth, categories }) {
  const [autoCode, setAutoCode] = useState('');
  const { data, setData, post, errors, processing } = useForm({
    code: '',
    name: '',
    category_id: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    stock: '',
    min_stock: '',
    unit: '',
    image: null,
  });

  useEffect(() => {
    if (data.category_id) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(data.category_id));
      if (selectedCategory) {
        const prefix = getPrefixByCategory(selectedCategory.name);
        fetch(`/api/products/last-code?category_id=${data.category_id}`)
          .then(res => res.json())
          .then(result => {
            setData('code', result.code);
            setAutoCode(result.code);
          });
      }
    }
  }, [data.category_id]);

  const getPrefixByCategory = (categoryName) => {
    switch (categoryName) {
      case 'Obat Bebas': return 'OBB';
      case 'Obat Bebas Terbatas': return 'OBT';
      case 'Obat Keras': return 'OBK';
      case 'Alat Kesehatan': return 'ALK';
      case 'Perawatan Tubuh': return 'PRT';
      default: return 'PRD';  // Default prefix for other categories
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('products.store'));
  };

  return (
    <Authenticated auth={auth}>
      <Head title="Tambah Produk" />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Tambah Produk</h1>
          <Link href={route('products.index')} className="text-blue-600 hover:underline">
            Kembali
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium">Kategori</label>
            <select
              value={data.category_id}
              onChange={e => setData('category_id', e.target.value)}
              className="mt-1 w-full border rounded p-2"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && <div className="text-red-500 text-sm">{errors.category_id}</div>}
          </div>

          <div>
            <label className="block font-medium">Kode Produk</label>
            <input
              type="text"
              value={autoCode}
              onChange={e => setData('code', e.target.value)}
              className="mt-1 w-full border rounded p-2 bg-gray-100"
              readOnly
            />
            {errors.code && <div className="text-red-500 text-sm">{errors.code}</div>}
          </div>

          <div>
            <label className="block font-medium">Nama Produk</label>
            <input
              type="text"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="mt-1 w-full border rounded p-2"
              required
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>

          <div>
            <label className="block font-medium">Deskripsi</label>
            <textarea
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              className="mt-1 w-full border rounded p-2"
            />
            {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Harga Beli</label>
              <input
                type="number"
                value={data.purchase_price}
                onChange={e => setData('purchase_price', e.target.value)}
                className="mt-1 w-full border rounded p-2"
                required
              />
              {errors.purchase_price && <div className="text-red-500 text-sm">{errors.purchase_price}</div>}
            </div>
            <div>
              <label className="block font-medium">Harga Jual</label>
              <input
                type="number"
                value={data.selling_price}
                onChange={e => setData('selling_price', e.target.value)}
                className="mt-1 w-full border rounded p-2"
                required
              />
              {errors.selling_price && <div className="text-red-500 text-sm">{errors.selling_price}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Stok</label>
              <input
                type="number"
                value={data.stock}
                onChange={e => setData('stock', e.target.value)}
                className="mt-1 w-full border rounded p-2"
                required
              />
              {errors.stock && <div className="text-red-500 text-sm">{errors.stock}</div>}
            </div>
            <div>
              <label className="block font-medium">Minimal Stok</label>
              <input
                type="number"
                value={data.min_stock}
                onChange={e => setData('min_stock', e.target.value)}
                className="mt-1 w-full border rounded p-2"
                required
              />
              {errors.min_stock && <div className="text-red-500 text-sm">{errors.min_stock}</div>}
            </div>
          </div>

          <div>
            <label className="block font-medium">Satuan</label>
            <input
              type="text"
              value={data.unit}
              onChange={e => setData('unit', e.target.value)}
              className="mt-1 w-full border rounded p-2"
              required
            />
            {errors.unit && <div className="text-red-500 text-sm">{errors.unit}</div>}
          </div>

          <div>
            <label className="block font-medium">Gambar</label>
            <input
              type="file"
              onChange={e => setData('image', e.target.files[0])}
              className="mt-1 w-full border rounded p-2"
            />
            {errors.image && <div className="text-red-500 text-sm">{errors.image}</div>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {processing ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </Authenticated>
  );
}
