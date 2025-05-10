<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Halaman Publik
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

// Autentikasi
Route::middleware('guest')->group(function () {
    // Login Routes
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.attempt');

    // Registration Routes
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.attempt');
});

// Logout
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

// Dashboard (dipindah ke luar grup dan ditambahkan middleware langsung)
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Area Terproteksi
Route::middleware(['auth', 'verified'])->group(function () {
    // Profile Management
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Product Management
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::get('/{product}', [ProductController::class, 'show'])->name('show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [ProductController::class, 'update'])->name('products.update'); // Corrected here
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
    });

    // API for product search
    Route::get('/api/products/search', [ProductController::class, 'search'])->name('api.products.search');
    Route::get('/api/products/last-code', [ProductController::class, 'getLastCode']);

    // Sales Management
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/', [SaleController::class, 'index'])->name('index');
        Route::get('/create', [SaleController::class, 'create'])->name('create');
        Route::post('/', [SaleController::class, 'store'])->name('store');
        Route::get('/{sale}', [SaleController::class, 'show'])->name('show');
        Route::get('/{sale}/invoice', [SaleController::class, 'invoice'])->name('invoice');

    });

    // Additional Inventory Routes
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/low-stock', [ProductController::class, 'lowStock'])->name('low-stock');
        Route::get('/expired', [ProductController::class, 'expiredProducts'])->name('expired');
    });

    // Categories Routes
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::get('/create', [CategoryController::class, 'create'])->name('create');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
        Route::patch('/{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
        Route::patch('/{category}/restore', [CategoryController::class, 'restore'])->name('restore');
    });
});

// // API untuk Inertia
// Route::middleware('auth')->prefix('api')->group(function () {
//     Route::get('/products/search', [ProductController::class, 'search'])->name('api.products.search');
// });
