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
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/last-code', [ProductController::class, 'getLastCode']);