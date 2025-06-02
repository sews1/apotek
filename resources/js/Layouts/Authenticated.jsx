import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Authenticated({ auth = {}, header, children }) {
    const [reportOpen, setReportOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const reportRef = useRef(null);
    const profileRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                reportRef.current &&
                !reportRef.current.contains(event.target)
            ) {
                setReportOpen(false);
            }
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Check if user has access to a specific route
    const hasAccess = (requiredRole) => {
        const userRole = auth.user?.role;

        if (!requiredRole) return true;

        if (userRole === "owner") return true;

        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(userRole);
        }

        return userRole === requiredRole;
    };

    // Handle unauthorized access
    const handleUnauthorized = () => {
        Swal.fire({
            title: "Akses Ditolak",
            text: "Anda tidak memiliki akses ke menu ini",
            icon: "error",
            confirmButtonText: "OK",
        });
    };

    // Navigation items with required roles
    const navItems = [
        {
            href: "/dashboard",
            active: route().current("dashboard"),
            icon: (
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
            ),
            label: "Dashboard",
            roles: ["admin", "warehouse", "owner"], // All roles have access
        },
        {
            href: "/products",
            active: route().current("products*"),
            icon: (
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            ),
            label: "Produk",
            roles: ["admin", "warehouse", "owner"],
        },
        {
            href: "/categories",
            active: route().current("categories*"),
            icon: (
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                </svg>
            ),
            label: "Kategori",
            roles: ["admin", "warehouse", "owner"],
        },
        {
            href: "/suppliers",
            active: route().current("suppliers*"),
            icon: (
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
            label: "Supplier",
            roles: ["warehouse", "owner"],
        },
        {
            href: "/sales",
            active: route().current("sales*"),
            icon: (
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
            label: "POS",
            roles: ["admin", "owner"],
            isButton: true,
        },
    ];

    // Report items with required roles
    const reportItems = [
        {
            href: "/reports/weekly",
            label: "Penjualan Mingguan",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
        {
            href: "/reports/monthly",
            label: "Penjualan Bulanan",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
        {
            href: "/reports/yearly",
            label: "Penjualan Tahunan",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
        {
            href: "/reports/product",
            label: "Laporan Produk",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
        {
            href: "/reports/supplier",
            label: "Laporan Daftar Supplier",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
        {
            href: "/reports/member",
            label: "Laporan Data Karyawan",
            icon: (
                <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            roles: ["owner"],
        },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => hasAccess(item.roles));
    const filteredReportItems = reportItems.filter((item) =>
        hasAccess(item.roles)
    );
    const showReportsDropdown = filteredReportItems.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={header} />

            {/* Modern Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Left: Logo & Navigation */}
                        <div className="flex items-center space-x-8">
                            <Link
                                href="/dashboard"
                                className="flex items-center space-x-2"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
                                    Apotek{" "}
                                    <span className="text-blue-600">
                                        Hero Farma
                                    </span>
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex space-x-6">
                                {filteredNavItems.map((item) =>
                                    item.isButton ? (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                                            title={item.label}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <NavLink
                                            key={item.href}
                                            href={item.href}
                                            active={item.active}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </NavLink>
                                    )
                                )}

                                {/* Reports Dropdown */}
                                {showReportsDropdown && (
                                    <div className="relative" ref={reportRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReportOpen(!reportOpen);
                                                setProfileOpen(false);
                                            }}
                                            className={`inline-flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all ${
                                                route().current("reports*")
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        >
                                            <svg
                                                className="w-5 h-5 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            Laporan
                                            <svg
                                                className={`ml-1 w-4 h-4 transition-transform ${
                                                    reportOpen
                                                        ? "transform rotate-180"
                                                        : ""
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {reportOpen && (
                                            <div className="absolute z-20 mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
                                                {filteredReportItems.map(
                                                    (item) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() =>
                                                                setReportOpen(
                                                                    false
                                                                )
                                                            }
                                                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                                        >
                                                            {item.icon}
                                                            {item.label}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* User Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                                        onClick={() => {
                                            setProfileOpen(!profileOpen);
                                            setReportOpen(false);
                                        }}
                                        aria-haspopup="true"
                                        aria-expanded={
                                            profileOpen ? "true" : "false"
                                        }
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold select-none">
                                            {auth?.user?.name
                                                ? auth.user.name
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : "G"}
                                        </div>
                                        <span className="hidden md:inline">
                                            {auth?.user?.name ?? "Guest"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${
                                                profileOpen
                                                    ? "transform rotate-180"
                                                    : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 z-30 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                                            <Link
                                                href="/profile"
                                                onClick={() =>
                                                    setProfileOpen(false)
                                                }
                                                className="flex items-center px-4 py-3 text-gray-700 text-sm hover:bg-blue-50 hover:text-blue-700 transition"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-3 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.624 0 5.085.787 7.121 2.121M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                Lihat Profil
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex items-center w-full px-4 py-3 text-left text-gray-700 text-sm hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-3 text-red-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1m6-10V5a3 3 0 00-3-3H8a3 3 0 00-3 3v1"
                                                    />
                                                </svg>
                                                Logout
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Mobile Menu Button */}
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {mobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {filteredNavItems.map((item) => (
                                <MobileNavLink
                                    key={item.href}
                                    href={item.href}
                                    active={item.active}
                                >
                                    {item.icon}
                                    {item.label}
                                </MobileNavLink>
                            ))}

                            {showReportsDropdown && (
                                <MobileNavLink
                                    href="/reports/weekly"
                                    active={route().current("reports*")}
                                >
                                    <svg
                                        className="w-5 h-5 mr-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Laporan
                                </MobileNavLink>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all ${
                active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
            {children}
        </Link>
    );
}
