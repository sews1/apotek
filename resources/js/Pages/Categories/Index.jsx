import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

const hasPermission = (user, permission) =>
  user?.roles?.some(role => role.permissions.includes(permission));

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    <div className={`w-2 h-2 rounded-full mr-1 ${active ? 'bg-green-500' : 'bg-red-500'}`}></div>
    {active ? 'Aktif' : 'Tidak Aktif'}
  </span>
);

const CategoryIcon = ({ categoryName }) => {
  // Icon mapping for common pharmacy categories
  const getIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('obat') || lowerName.includes('medicine')) {
      return '💊';
    } else if (lowerName.includes('vitamin') || lowerName.includes('suplemen')) {
      return '🍊';
    } else if (lowerName.includes('perawatan') || lowerName.includes('skincare')) {
      return '🧴';
    } else if (lowerName.includes('alat') || lowerName.includes('medical')) {
      return '🩺';
    } else if (lowerName.includes('bayi') || lowerName.includes('baby')) {
      return '👶';
    } else {
      return '📦';
    }
  };

  return (
    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-lg">
      {getIcon(categoryName)}
    </div>
  );
};

const CategoryTableRow = ({ category, handleDelete, canEdit, canDelete, auth }) => (
  <tr className="hover:bg-gray-50 transition-colors duration-150">
    <td className="px-6 py-4">
      <div className="flex items-center">
        <CategoryIcon categoryName={category.name} />
        <div className="ml-4">
          <div className="text-sm font-semibold text-gray-900">{category.name}</div>
          <div className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded mt-1 inline-block">
            {category.kode_prefix}
          </div>
          {category.description && (
            <div className="text-sm text-gray-500 mt-1 max-w-xs">
              {category.description.length > 50 
                ? `${category.description.substring(0, 50)}...` 
                : category.description
              }
            </div>
          )}
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge active={category.is_active} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
          </svg>
          {category.products_count} produk
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end space-x-2">
        {auth.user?.role === 'warehouse' && (
          <>
            <Link
              href={route('categories.edit', category.id)}
              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors duration-150 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors duration-150 text-sm font-medium"
              disabled={category.products_count > 0}
              title={category.products_count > 0 ? 'Tidak dapat menghapus kategori yang memiliki produk' : 'Hapus kategori'}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </>
        )}
      </div>
    </td>
  </tr>
);

const CategoryTable = ({ categories, handleDelete, canEdit, canDelete, auth }) => {
  if (!categories.data.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada kategori obat</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Mulai dengan membuat kategori untuk mengorganisir produk obat dan kesehatan di apotek Anda.
        </p>
        {auth.user?.role === 'warehouse' && (
          <Link
            href={route('categories.create')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kategori Pertama
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daftar Kategori Obat</h3>
            <p className="text-sm text-gray-500 mt-1">
              Total {categories.data.length} kategori dari {categories.total} kategori
            </p>
          </div>
          {auth.user?.role === 'warehouse' && (
            <Link
              href={route('categories.create')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg shadow-sm hover:shadow-md hover:from-indigo-700 hover:to-indigo-600 transition-all duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kategori
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Kategori Obat
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jumlah Produk
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.data.map(category => (
              <CategoryTableRow
                key={category.id}
                category={category}
                handleDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
                auth={auth}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pagination = ({ links }) => {
  if (!links || links.length <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
      <div className="flex flex-1 justify-between sm:hidden">
        {links.find(link => link.label.includes('Previous')) && (
          <button
            onClick={() => router.visit(links.find(link => link.label.includes('Previous')).url)}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sebelumnya
          </button>
        )}
        {links.find(link => link.label.includes('Next')) && (
          <button
            onClick={() => router.visit(links.find(link => link.label.includes('Next')).url)}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Selanjutnya
          </button>
        )}
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Menampilkan halaman <span className="font-medium">{links.find(link => link.active)?.label || 1}</span>
          </p>
        </div>
        <div className="flex space-x-1">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => link.url && router.visit(link.url)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                link.active 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : link.url 
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-300 cursor-not-allowed'
              }`}
              disabled={!link.url || link.active}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

const FilterCard = ({ filters, handleFilter }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center mb-4">
      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900">Filter & Pencarian</h3>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-2">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Cari Kategori Obat
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            type="text"
            placeholder="Cari berdasarkan nama kategori atau kode prefix..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
            value={filters.search || ''}
            onChange={e => handleFilter('search', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status Kategori
        </label>
        <select
          id="status"
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
          value={filters.trashed || ''}
          onChange={e => handleFilter('trashed', e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="only">Hanya Aktif</option>
          <option value="with">Termasuk Tidak Aktif</option>
          <option value="only_trashed">Hanya yang Dihapus</option>
        </select>
      </div>
    </div>
  </div>
);

export default function Index({ auth, categories, filters }) {
  const [searchTimeout, setSearchTimeout] = React.useState(null);

  const canCreate = hasPermission(auth.user, 'create-category');
  const canEdit = hasPermission(auth.user, 'edit-category');
  const canDelete = hasPermission(auth.user, 'delete-category');

  const applyFilter = (key, value) => {
    router.get(route('categories.index'), {
      ...filters,
      [key]: value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key, value) => {
    if (key === 'search') {
      clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(() => applyFilter(key, value), 500));
    } else {
      applyFilter(key, value);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus Kategori',
      text: `Apakah Anda yakin ingin menghapus kategori "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      backdrop: true,
      allowOutsideClick: false
    });

    if (result.isConfirmed) {
      router.delete(route('categories.destroy', id), {
        onSuccess: () => {
          toast.success('Kategori berhasil dihapus');
          Swal.fire({
            title: 'Berhasil!',
            text: 'Kategori telah dihapus dari sistem.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        onError: (errors) => {
          const errorMessage = errors.message || 'Gagal menghapus kategori';
          toast.error(errorMessage);
          Swal.fire({
            title: 'Gagal!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        },
      });
    }
  };

  return (
    <Authenticated auth={auth} header="Manajemen Kategori Obat">
      <Head title="Manajemen Kategori Obat - Sistem Apotek" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kategori Obat & Produk Kesehatan</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Kelola dan organisir kategori produk farmasi untuk kemudahan pencarian dan inventori
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{categories.total}</div>
                  <div className="text-xs text-gray-500">Total Kategori</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {categories.data.filter(cat => cat.is_active).length}
                  </div>
                  <div className="text-xs text-gray-500">Kategori Aktif</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {categories.data.reduce((sum, cat) => sum + cat.products_count, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Produk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <FilterCard filters={filters} handleFilter={handleFilter} />
          </div>

          {/* Table Section */}
          <div>
            <CategoryTable
              categories={categories}
              handleDelete={handleDelete}
              canEdit={canEdit}
              canDelete={canDelete}
              auth={auth}
            />
            <Pagination links={categories.links} />
          </div>

          {/* Help Text */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Tips Pengelolaan Kategori</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Gunakan kategori untuk mengelompokkan obat berdasarkan jenis (obat keras, bebas, herbal), 
                  fungsi (analgesik, antibiotik, vitamin), atau target penggunaan (dewasa, anak, bayi). 
                  Kode prefix membantu dalam sistem penamaan SKU produk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}