<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products/search/{keyword}', [ProductController::class, 'search']);
    Route::get('products/reports', [ProductController::class, 'reports']);
    Route::get('products/last-code', [ProductController::class, 'getLastCode']); // New route for product code
    Route::get('/products/generate-code', [\App\Http\Controllers\API\ProductCodeController::class, 'generateCode']);
    // Sales
    Route::apiResource('sales', SaleController::class);
    Route::get('sales/reports', [SaleController::class, 'reports']);
    
    // Categories
    Route::apiResource('categories', CategoryController::class);
    
    // Additional routes can be added here
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint not found. Please check the API documentation.'
    ], 404);
});