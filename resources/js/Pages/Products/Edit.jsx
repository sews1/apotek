import React, { useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, product, categories }) {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find(cat => cat.id === product.category_id) || null
  );

  const { data, setData, put, errors, processing } = useForm({
    code: product.code,
    name: product.name,
    category_id: product.category_id,
    description: product.description,
    purchase_price: product.purchase_price,
    selling_price: product.selling_price,
    stock: product.stock,
    min_stock: product.min_stock,
    unit: product.unit,
    entry_date: product.entry_date,
    expired_date: product.expired_date,
    image: null,
    is_active: product.is_active,
  });

  // Auto-generate product code when category changes
  useEffect(() => {
    if (data.category_id && data.category_id !== product.category_id) {
      const category = categories.find(cat => cat.id == data.category_id);
      setSelectedCategory(category);
      
      setIsGeneratingCode(true);
      
      fetch(`/api/products/generate-code?category_id=${data.category_id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to generate code');
          return res.json();
        })
        .then(result => {
          if (result.success && result.code) {
            setData('code', result.code);
          } else {
            throw new Error(result.message || 'Failed to generate code');
          }
        })
        .catch(error => {
          console.error('Error generating code:', error);
          // Fallback manual
          const lastCode = category.last_code || `${category.kode_prefix}-000`;
          const lastNumber = parseInt(lastCode.split('-')[1]);
          setData('code', `${category.kode_prefix}-${String(lastNumber + 1).padStart(3, '0')}`);
        })
        .finally(() => {
          setIsGeneratingCode(false);
        });
    } else if (!data.category_id) {
      setSelectedCategory(null);
      setData('code', '');
    }
  }, [data.category_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('products.update', product.id), {
      preserveScroll: true
    });
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setData('category_id', categoryId);
  };

  const handleFileChange = (e) => {
    setData('image', e.target.files[0]);
  };

  return (
    <Authenticated auth={auth}>
      <Head title="Edit Produk" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
              <nav className="flex mt-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link href={route('dashboard')} className="text-gray-400 hover:text-gray-500">
                      <svg className="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href={route('products.index')} className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">Produk</Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-500">Edit Produk</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            <Link
              href={route('products.index')}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Kembali
            </Link>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Basic Information Section */}
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Informasi Dasar Produk</h2>
              <p className="mt-1 text-sm text-gray-500">Detail utama tentang produk Anda</p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Category */}
                <div className="sm:col-span-3">
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                    Kategori Produk <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={data.category_id}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                </div>

                {/* Product Code */}
                <div className="sm:col-span-3">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Kode Produk <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="code"
                      id="code"
                      value={data.code}
                      onChange={(e) => setData('code', e.target.value)}
                      className={`block w-full pr-10 sm:text-sm rounded-md ${isGeneratingCode ? 'bg-gray-100' : ''}`}
                      placeholder={selectedCategory ? `${selectedCategory.kode_prefix}-001` : "Pilih kategori"}
                      required
                      readOnly={isGeneratingCode}
                    />
                    {isGeneratingCode && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                  {selectedCategory && (
                    <p className="mt-1 text-xs text-gray-500">
                      Format: {selectedCategory.kode_prefix}-XXX (contoh: {selectedCategory.last_code || `${selectedCategory.kode_prefix}-001`})
                    </p>
                  )}
                </div>

                {/* Product Name */}
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Deskripsi Produk
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

              </div>
            </div>

            {/* Pricing and Stock Section */}
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Harga & Stok</h2>
              <p className="mt-1 text-sm text-gray-500">Informasi harga dan manajemen inventaris</p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Purchase Price */}
                <div className="sm:col-span-2">
                  <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                    Harga Beli <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      name="purchase_price"
                      id="purchase_price"
                      value={data.purchase_price}
                      onChange={(e) => setData('purchase_price', e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">IDR</span>
                    </div>
                  </div>
                  {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>}
                </div>

                {/* Selling Price */}
                <div className="sm:col-span-2">
                  <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                    Harga Jual <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      name="selling_price"
                      id="selling_price"
                      value={data.selling_price}
                      onChange={(e) => setData('selling_price', e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">IDR</span>
                    </div>
                  </div>
                  {errors.selling_price && <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>}
                </div>

                {/* Profit Preview */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Estimasi Keuntungan</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {data.purchase_price && data.selling_price ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Rp {(data.selling_price - data.purchase_price).toLocaleString('id-ID')}
                        </span>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          {data.purchase_price > 0 ? 
                            `${Math.round(((data.selling_price - data.purchase_price) / data.purchase_price * 100))}%` 
                            : '0%'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Masukkan harga beli dan jual</span>
                    )}
                  </div>
                </div>
                {/* Stock */}
                <div className="sm:col-span-2">
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stok Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      value={data.stock}
                      onChange={(e) => setData('stock', e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{data.unit}</span>
                    </div>
                  </div>
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                </div>

                {/* Minimum Stock */}
                <div className="sm:col-span-2">
                  <label htmlFor="min_stock" className="block text-sm font-medium text-gray-700">
                    Stok Minimum <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="min_stock"
                      id="min_stock"
                      value={data.min_stock}
                      onChange={(e) => setData('min_stock', e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{data.unit}</span>
                    </div>
                  </div>
                  {errors.min_stock && <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>}
                </div>

                {/* Unit */}
                <div className="sm:col-span-2">
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={data.unit}
                    onChange={(e) => setData('unit', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Box</option>
                    <option value="botol">Botol</option>
                    <option value="strip">Strip</option>
                    <option value="tablet">Tablet</option>
                    <option value="kapsul">Kapsul</option>
                    <option value="sachet">Sachet</option>
                    <option value="tube">Tube</option>
                  </select>
                  {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Informasi Tambahan</h2>
              <p className="mt-1 text-sm text-gray-500">Detail tambahan tentang produk</p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Entry Date */}
                <div className="sm:col-span-2">
                  <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">
                    Tanggal Masuk <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="entry_date"
                      id="entry_date"
                      value={data.entry_date}
                      onChange={(e) => setData('entry_date', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  {errors.entry_date && <p className="mt-1 text-sm text-red-600">{errors.entry_date}</p>}
                </div>

                {/* Expired Date */}
                <div className="sm:col-span-2">
                  <label htmlFor="expired_date" className="block text-sm font-medium text-gray-700">
                    Tanggal Kadaluwarsa
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="expired_date"
                      id="expired_date"
                      value={data.expired_date}
                      onChange={(e) => setData('expired_date', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {errors.expired_date && <p className="mt-1 text-sm text-red-600">{errors.expired_date}</p>}
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Status Produk</label>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                        Produk Aktif
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {data.is_active ? 'Produk akan ditampilkan di katalog' : 'Produk tidak akan ditampilkan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing || isGeneratingCode}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}