<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Pages
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

// Authentication
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.attempt');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.attempt');
});

// Logout
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// Protected Area
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/weekly-stats', [DashboardController::class, 'getWeeklyStats'])->name('dashboard.weekly-stats');

    // Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');

        // Tambahan fitur profil
        Route::patch('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/avatar', [ProfileController::class, 'removeAvatar'])->name('avatar.remove');
        Route::post('/resend-verification', [ProfileController::class, 'resendVerification'])->name('resend-verification');
        Route::get('/download-data', [ProfileController::class, 'downloadData'])->name('download-data');
        Route::patch('/notifications', [ProfileController::class, 'updateNotifications'])->name('notifications.update');
        Route::patch('/privacy', [ProfileController::class, 'updatePrivacy'])->name('privacy.update');
        Route::post('/logout-other-devices', [ProfileController::class, 'logoutOtherDevices'])->name('logout-other-devices');

        // 2FA
        Route::post('/2fa/enable', [ProfileController::class, 'enableTwoFactor'])->name('2fa.enable');
        Route::delete('/2fa/disable', [ProfileController::class, 'disableTwoFactor'])->name('2fa.disable');
        Route::post('/2fa/confirm', [ProfileController::class, 'confirmTwoFactor'])->name('2fa.confirm');

        // Activity Log
        Route::get('/activity', [ProfileController::class, 'activityLog'])->name('activity');
    });

    // Public Profile View
    Route::get('/profile/{id?}', [ProfileController::class, 'show'])->name('profile.show');

    // Product Management
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/expired', [ProductController::class, 'expiredProducts'])->name('expired');

        Route::middleware('role:warehouse')->group(function () {
            Route::get('/create', [ProductController::class, 'create'])->name('create');
            Route::post('/', [ProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
            Route::put('/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('toggle-status');
        });
    });

    // API Product Routes
    Route::get('/api/products/search', [ProductController::class, 'search'])->name('api.products.search');
    Route::get('/api/products/last-code', [ProductController::class, 'getLastCode']);

    // Sales Management
    Route::middleware('role:admin,owner')->prefix('sales')->name('sales.')->group(function () {
        Route::get('/', [SaleController::class, 'index'])->name('index');
        Route::get('/create', [SaleController::class, 'create'])->name('create');
        Route::post('/', [SaleController::class, 'store'])->name('store');
        Route::get('/{sale}', [SaleController::class, 'show'])->name('show');
        Route::get('/{sale}/invoice', [SaleController::class, 'invoice'])->name('invoice');
        Route::get('/sales/{sale}/invoice-pdf', [SaleController::class, 'downloadInvoice'])->name('sales.invoice.pdf');
    });

    // Inventory
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/low-stock', [ProductController::class, 'lowStock'])->name('low-stock');
        Route::get('/expired', [ProductController::class, 'expiredProducts'])->name('expired');
    });

    // Categories
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');

        Route::middleware('role:warehouse')->group(function () {
            Route::get('/create', [CategoryController::class, 'create'])->name('create');
            Route::post('/', [CategoryController::class, 'store'])->name('store');
            Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
            Route::patch('/{category}', [CategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
            Route::patch('/{category}/restore', [CategoryController::class, 'restore'])->name('restore');
        });
    });

    // Suppliers
    Route::middleware('role:owner,warehouse')->prefix('suppliers')->name('suppliers.')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('index');
        Route::get('/create', [SupplierController::class, 'create'])->name('create');
        Route::post('/', [SupplierController::class, 'store'])->name('store');
        Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
        Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
        Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
    });

    // Reports
    Route::middleware('role:owner')->prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/weekly', [ReportController::class, 'weekly'])->name('weekly');
        Route::get('/monthly', [ReportController::class, 'monthly'])->name('monthly');
        Route::get('/yearly', [ReportController::class, 'yearly'])->name('yearly');
        Route::get('/product', [ReportController::class, 'product'])->name('product');
        Route::get('/supplier', [ReportController::class, 'supplier'])->name('supplier');
        Route::get('/UserPerformance', [ReportController::class, 'userperformance'])->name('userperformance');
        Route::get('/user-performance', [ReportController::class, 'userPerformance'])->name('user-performance');
        Route::get('/user-activity-chart', [ReportController::class, 'getUserActivityChart'])->name('user-activity-chart');
    });

    // API Data Reports
    Route::middleware('role:owner')->prefix('api/reports')->name('api.reports.')->group(function () {
        Route::get('/user-activity-data', [ReportController::class, 'getUserActivityChart']);
        Route::get('/user-session-data/{userId}', [ReportController::class, 'getUserSessionData']);
        Route::get('/productivity-metrics', [ReportController::class, 'getProductivityMetrics']);
    });
});
