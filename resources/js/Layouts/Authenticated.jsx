import { Head, Link } from '@inertiajs/react';
// ... (imports tetap sama)

export default function Authenticated({ auth, header, children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head title={header} />

            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex space-x-8">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard">
                                    <span className="text-xl font-bold text-blue-600">Apotek Sehat</span>
                                </Link>
                            </div>
                            <div className="hidden sm:flex sm:space-x-8">
                                <NavLink href="/dashboard" active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href="/products" active={route().current('products*')}>
                                    Produk
                                </NavLink>
                                <NavLink href="/sales" active={route().current('sales*')}>
                                    Penjualan
                                </NavLink>
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <div className="ml-3 relative">
                                <span className="text-gray-600">{auth.user.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                active
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
        >
            {children}
        </Link>
    );
}