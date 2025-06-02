<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class);
    Route::apiResource('sales', SaleController::class);

    // Route khusus
    Route::get('products/search/{keyword}', [ProductController::class, 'search']);

    // Tambahkan route laporan produk
    Route::get('products/reports', [ProductController::class, 'reports']);
});
