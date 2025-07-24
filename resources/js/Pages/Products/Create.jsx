import React, { useEffect } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, categories }) {
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
    entry_date: '',
    expired_date: '',
    image: null,
    is_active: true,
  });

  useEffect(() => {
    if (data.category_id) {
      fetch(`/api/products/last-code?category_id=${data.category_id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch code');
          return res.json();
        })
        .then(result => {
          if (result.code) {
            setData('code', result.code);
          }
        })
        .catch(() => {
          setData('code', '');
        });
    } else {
      setData('code', '');
    }
  }, [data.category_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('products.store'));
  };

  return (
    <Authenticated auth={auth}>
      <Head title="Tambah Produk" />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
              <p className="mt-2 text-base text-gray-500">
                Lengkapi informasi produk baru Anda di bawah ini
              </p>
            </div>
            <Link
              href={route('products.index')}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Kembali
            </Link>
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
            {/* Header Section */}
            <div className="px-6 py-5 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Informasi Produk</h2>
              <p className="mt-1 text-sm text-gray-500">Detail dasar tentang produk Anda</p>
            </div>

            {/* Category and Product Code */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Kategori Produk <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  value={data.category_id}
                  onChange={e => setData('category_id', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition-all duration-200"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Kode Produk
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    id="code"
                    value={data.code}
                    onChange={e => setData('code', e.target.value)}
                    className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-all duration-200"
                    placeholder="Masukkan kode produk"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              </div>
            </div>

            {/* Product Name and Description */}
            <div className="px-6 py-5 space-y-6">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi Produk
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>

            {/* Pricing and Stock Section */}
            <div className="px-6 py-5 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Harga & Stok</h2>
              <p className="mt-1 text-sm text-gray-500">Informasi harga dan manajemen inventaris</p>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                  Harga Beli <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="purchase_price"
                    value={data.purchase_price}
                    onChange={e => setData('purchase_price', e.target.value)}
                    className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-all duration-200"
                    required
                  />
                </div>
                {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                  Harga Jual <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    id="selling_price"
                    value={data.selling_price}
                    onChange={e => setData('selling_price', e.target.value)}
                    className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 transition-all duration-200"
                    required
                  />
                </div>
                {errors.selling_price && <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stok Beli <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    id="stock"
                    value={data.stock}
                    onChange={e => setData('stock', e.target.value)}
                    className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{data.unit || 'unit'}</span>
                  </div>
                </div>
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700">
                  Stok Minimum <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    id="min_stock"
                    value={data.min_stock}
                    onChange={e => setData('min_stock', e.target.value)}
                    className="block w-full pr-10 sm:text-sm border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-3 transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{data.unit || 'unit'}</span>
                  </div>
                </div>
                {errors.min_stock && <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="px-6 py-5 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Informasi Tambahan</h2>
              <p className="mt-1 text-sm text-gray-500">Detail tambahan tentang produk</p>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">
                  Tanggal Masuk <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="date"
                    id="entry_date"
                    value={data.entry_date}
                    onChange={e => setData('entry_date', e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                    required
                  />
                </div>
                {errors.entry_date && <p className="mt-1 text-sm text-red-600">{errors.entry_date}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="expired_date" className="block text-sm font-medium text-gray-700">
                  Tanggal Kadaluwarsa
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <input
                    type="date"
                    id="expired_date"
                    value={data.expired_date}
                    onChange={e => setData('expired_date', e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  />
                </div>
                {errors.expired_date && <p className="mt-1 text-sm text-red-600">{errors.expired_date}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="unit"
                  value={data.unit}
                  onChange={e => setData('unit', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  required
                />
                {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status Produk</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={data.is_active}
                      onChange={e => setData('is_active', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Aktif
                    </label>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {data.is_active ? 'Akan ditampilkan' : 'Tidak ditampilkan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
         

            {/* Submit Button */}
            <div className="px-6 py-4 bg-gray-50 text-right">
              <button
                type="submit"
                disabled={processing}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Simpan Produk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}