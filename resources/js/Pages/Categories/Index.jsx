import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Authenticated';

const hasPermission = (user, permission) =>
  user?.roles?.some(role => role.permissions.includes(permission));

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

const CategoryTableRow = ({ category, handleDelete, canEdit, canDelete, auth }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{category.name}</div>
          {category.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
          )}
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge active={category.is_active} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
        {category.products_count} products
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
      {auth.user?.role === 'warehouse' && (
        <>
          <Link
            href={route('categories.edit', category.id)}
            className="text-blue-600 hover:text-blue-800 inline-flex items-center mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => handleDelete(category.id, category.name)}
            className="text-red-600 hover:text-red-800 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </>
      )}
    </td>
  </tr>
);

const CategoryTable = ({ categories, handleDelete, canEdit, canDelete, auth }) => {
  if (!categories.data.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="flex gap-3 p-4">
        {auth.user?.role === 'warehouse' && (
          <Link
            href={route('categories.create')}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Category
          </Link>
        )}
      </div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
            <th className="px-6 py-3 relative text-right"><span className="sr-only">Actions</span></th>
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
  );
};

const Pagination = ({ links }) => {
  if (!links || links.length <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-4">
      <div className="hidden md:flex">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => link.url && router.visit(link.url)}
            className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium ${
              link.active ? 'border-indigo-500 text-indigo-600' : ''
            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!link.url}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </nav>
  );
};

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
      title: 'Are you sure?',
      text: `Category "${name}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      router.delete(route('categories.destroy', id), {
        onSuccess: () => {
          toast.success('Category deleted successfully');
          Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        },
        onError: () => {
          toast.error('Failed to delete category');
          Swal.fire('Error!', 'Failed to delete category.', 'error');
        },
      });
    } else {
      Swal.fire('Cancelled', 'Category was not deleted.', 'info');
    }
  };

  return (
    <Authenticated auth={auth} header="Category Management">
      <Head title="Category Management" />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-700">Manage your product categories and organize your inventory.</p>
          </div>
          {canCreate && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href={route('categories.create')}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
              >
                Add category
              </Link>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 bg-white shadow-sm rounded-lg p-4">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search by name..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filters.search || ''}
                onChange={e => handleFilter('search', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={filters.trashed || ''}
                onChange={e => handleFilter('trashed', e.target.value)}
              >
                <option value="">All</option>
                <option value="only">Active</option>
                <option value="with">Including Inactive</option>
                <option value="only_trashed">Deleted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8">
          <CategoryTable
            categories={categories}
            handleDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
            auth={auth}
          />
          <Pagination links={categories.links} />
        </div>
      </div>
    </Authenticated>
  );
}