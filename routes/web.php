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
use App\Http\Controllers\Api\ProductCodeController;
use App\Http\Controllers\UserController;

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

});
Route::middleware(['auth', 'can:owner'])->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    });
// Logout (hanya untuk user login)
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// Protected Area
Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/weekly-stats', [DashboardController::class, 'getWeeklyStats'])->name('dashboard.weekly-stats');

    /*
    |--------------------------------------------------------------------------
    | Profile Management
    |--------------------------------------------------------------------------
    */
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::patch('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    });

    /*
    |--------------------------------------------------------------------------
    | Product Management
    |--------------------------------------------------------------------------
    */
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

    /*
    |--------------------------------------------------------------------------
    | API Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('api')->name('api.')->group(function () {
        // Product API
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('search', [ProductController::class, 'search'])->name('search');
            Route::get('last-code', [ProductController::class, 'getLastCode'])->name('last-code');

            // Product code generator
            Route::get('generate-code', [ProductCodeController::class, 'generateCode'])->name('generate-code');
            Route::post('check-code', [ProductCodeController::class, 'checkCodeAvailability'])->name('check-code');
            Route::post('generate-bulk-codes', [ProductCodeController::class, 'generateBulkCodes'])->name('generate-bulk-codes');
            Route::get('code-statistics', [ProductCodeController::class, 'getCodeStatistics'])->name('code-statistics');

            Route::get('reports', [ProductController::class, 'reports'])->name('reports');
            Route::get('low-stock', [ProductController::class, 'lowStock'])->name('low-stock');
            Route::get('out-of-stock', [ProductController::class, 'outOfStock'])->name('out-of-stock');
            Route::get('expiring-soon', [ProductController::class, 'expiringSoon'])->name('expiring-soon');
        });

        // Category API
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [CategoryController::class, 'getForReports'])->name('list');
            Route::get('statistics', [CategoryController::class, 'statistics'])->name('statistics');
            Route::get('export', [CategoryController::class, 'export'])->name('export');
        });

        // Sales API
        Route::prefix('sales')->name('sales.')->group(function () {
            Route::get('daily-stats', [SaleController::class, 'dailyStats'])->name('daily-stats');
            Route::get('monthly-stats', [SaleController::class, 'monthlyStats'])->name('monthly-stats');
            Route::get('top-products', [SaleController::class, 'topProducts'])->name('top-products');
        });

        // Reports API (owner only)
        Route::middleware('role:owner')->prefix('reports')->name('reports.')->group(function () {
            Route::get('/user-activity-data', [ReportController::class, 'getUserActivityChart']);
            Route::get('/user-session-data/{userId}', [ReportController::class, 'getUserSessionData']);
            Route::get('/productivity-metrics', [ReportController::class, 'getProductivityMetrics']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/low-stock', [ProductController::class, 'lowStock'])->name('low-stock');
        Route::get('/expired', [ProductController::class, 'expiredProducts'])->name('expired');
        Route::get('/expiring-soon', [ProductController::class, 'expiringSoon'])->name('expiring-soon');
        Route::get('/out-of-stock', [ProductController::class, 'outOfStock'])->name('out-of-stock');
        Route::get('/overview', [ProductController::class, 'inventoryOverview'])->name('overview');

        Route::middleware('role:warehouse')->group(function () {
            Route::post('/adjust-stock', [ProductController::class, 'adjustStock'])->name('adjust-stock');
            Route::post('/bulk-adjust', [ProductController::class, 'bulkAdjustStock'])->name('bulk-adjust');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');

        Route::middleware('role:warehouse')->group(function () {
            Route::get('/create', [CategoryController::class, 'create'])->name('create');
            Route::post('/', [CategoryController::class, 'store'])->name('store');
            Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
           Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
            Route::patch('/{category}/restore', [CategoryController::class, 'restore'])->name('restore');
            Route::delete('/{id}/force-delete', [CategoryController::class, 'forceDelete'])->name('force-delete');
            Route::post('/bulk-action', [CategoryController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/export', [CategoryController::class, 'export'])->name('export');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Suppliers
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:owner,warehouse')->prefix('suppliers')->name('suppliers.')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('index');
        Route::get('/create', [SupplierController::class, 'create'])->name('create');
        Route::post('/', [SupplierController::class, 'store'])->name('store');
        Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
        Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
        Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
        Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
    });

    /*
    |--------------------------------------------------------------------------
    | Sales Management
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin,owner')->prefix('sales')->name('sales.')->group(function () {
        Route::get('/', [SaleController::class, 'index'])->name('index');
        Route::get('/create', [SaleController::class, 'create'])->name('create');
        Route::post('/', [SaleController::class, 'store'])->name('store');
        Route::get('/{sale}', [SaleController::class, 'show'])->name('show');
        Route::get('/{sale}/invoice', [SaleController::class, 'invoice'])->name('invoice');
        Route::get('/{sale}/invoice-pdf', [SaleController::class, 'downloadInvoice'])->name('invoice.pdf');
    });

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:owner')->prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/weekly', [ReportController::class, 'weekly'])->name('weekly');
        Route::get('/monthly', [ReportController::class, 'monthly'])->name('monthly');
        Route::get('/yearly', [ReportController::class, 'yearly'])->name('yearly');
        Route::get('/product', [ReportController::class, 'product'])->name('product');
        Route::get('/supplier', [ReportController::class, 'supplier'])->name('supplier');
        Route::get('/user-performance', [ReportController::class, 'userPerformance'])->name('user-performance');
        Route::get('/user-activity-chart', [ReportController::class, 'getUserActivityChart'])->name('user-activity-chart');
    });
});
