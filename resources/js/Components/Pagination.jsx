// resources/js/Components/Pagination.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // Jangan tampilkan pagination jika hanya ada 1 halaman
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
                {links[0].url && (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                )}
                {links[links.length - 1].url && (
                    <Link
                        href={links[links.length - 1].url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{links[0].label}</span> to{' '}
                        <span className="font-medium">{links[links.length - 1].label}</span> of{' '}
                        <span className="font-medium">{links[links.length - 1].total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    link.active
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!link.url}
                            >
                                {link.label.includes('Previous') ? (
                                    <span>Previous</span>
                                ) : link.label.includes('Next') ? (
                                    <span>Next</span>
                                ) : (
                                    <span>{link.label}</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}