<?php

use App\Http\Controllers\Api\v1\Shop\ShopCartController;
use App\Http\Controllers\Api\v1\Shop\ShopCategoryListController;
use App\Http\Controllers\Api\v1\Shop\ShopCheckoutController;
use App\Http\Controllers\Api\v1\Shop\ShopManufacturerListController;
use App\Http\Controllers\Api\v1\Shop\ShopProductController;
use App\Http\Controllers\Api\v1\Shop\ShopProductListController;
use App\Http\Controllers\Api\v1\User\UserEditController;
use App\Http\Controllers\Api\v1\User\UserGetController;
use App\Http\Controllers\Api\v1\User\UserLoginController;
use App\Http\Controllers\Api\v1\User\UserOrdersController;
use App\Http\Controllers\Api\v1\User\UserRegistrationController;
use App\Http\Controllers\Api\v1\User\UserResetPasswordController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function() {
    Route::prefix('user')->group(function () {
        Route::middleware('auth:sanctum')->group(function() {
            Route::get('', UserGetController::class);
            Route::post('edit', UserEditController::class);
            Route::get('orders', UserOrdersController::class);
        });
        Route::post('login', UserLoginController::class);
        Route::post('registration', UserRegistrationController::class);
        Route::post('reset-password', UserResetPasswordController::class);
    });
    Route::prefix('shop')->group(function() {
        Route::middleware('option_auth')->group(function() {
            Route::get('categories', ShopCategoryListController::class);
            Route::get('manufacturers', ShopManufacturerListController::class);
            Route::get('products', ShopProductListController::class);
            Route::get('products/{slug}', ShopProductController::class);
            Route::post('checkout', ShopCheckoutController::class);
        });
    });
    Route::prefix('cart')->group(function () {
        Route::middleware('auth:sanctum')->group(function() {
            Route::get('/', ShopCartController::class);
            Route::post('/items', [ShopCartController::class, 'add']);
            Route::patch('/items/{rowId}', [ShopCartController::class, 'qty']);
            Route::delete('/items/{rowId}', [ShopCartController::class, 'remove']);
            Route::patch('/items/{rowId}/decrement', [ShopCartController::class, 'decrement']);
            Route::delete('/', [ShopCartController::class, 'clear']);
        });
    });
});