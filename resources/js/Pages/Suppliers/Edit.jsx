import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';
import {
  FaArrowLeft,
  FaSave,
  FaBoxes,
  FaUserTie,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';

export default function Edit({ auth, supplier }) {
  const { data, setData, put, processing, errors } = useForm({
    name: supplier.name ?? '',
    phone: supplier.phone ?? '',
    address: supplier.address ?? '',
    item: supplier.item ?? '', // sesuai dengan field backend
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    put(route('suppliers.update', supplier.id), {
      data: {
        ...data,
      },
      preserveScroll: true,
    });
  };

  return (
    <Authenticated
      auth={auth}
      header={
        <div className="flex items-center">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Edit Supplier
          </h2>
        </div>
      }
    >
      <Head title="Edit Supplier" />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Form Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-500">
            <h3 className="text-lg font-medium text-white">
              Edit Informasi Supplier
            </h3>
            <p className="mt-1 text-sm text-green-100">
              Perbarui data supplier berikut
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FaUserTie className="mr-2 text-green-500" />
                Nama Supplier
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                className={`block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.name
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                }`}
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Contoh: PT. Sehat Selalu"
                required
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FaPhone className="mr-2 text-green-500" />
                Nomor Telepon
              </label>
              <input
                type="text"
                className={`block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.phone
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                }`}
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
                placeholder="Contoh: 081234567890"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                Alamat
              </label>
              <textarea
                rows={3}
                className={`shadow-sm block w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.address
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                }`}
                value={data.address}
                onChange={(e) => setData('address', e.target.value)}
                placeholder="Alamat lengkap supplier"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Item Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FaBoxes className="mr-2 text-green-500" />
                Barang yang Disuplai
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                rows={3}
                className={`shadow-sm block w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.item
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : ''
                }`}
                value={data.item}
                onChange={(e) => setData('item', e.target.value)}
                placeholder="Pisahkan dengan koma, contoh: Paracetamol, Vitamin C, Masker Medis"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Masukkan daftar produk yang disediakan oleh supplier ini
              </p>
              {errors.item && (
                <p className="mt-2 text-sm text-red-600">{errors.item}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link
                href={route('suppliers.index')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaArrowLeft className="mr-2" />
                Kembali
              </Link>
              <button
                type="submit"
                disabled={processing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  processing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <FaSave className="mr-2" />
                {processing ? 'Menyimpan...' : 'Perbarui Supplier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}
