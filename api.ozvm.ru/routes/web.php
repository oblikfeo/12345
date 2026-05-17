<?php

use App\Http\Controllers\DebugController;
use App\Http\Controllers\ExchangeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/debug', DebugController::class);

Route::middleware('auth.basic')->group(function() {
    Route::any('/exchange', ExchangeController::class);
    Route::any('/exchange/orders', [ExchangeController::class, 'orders']);
    Route::any('/exchange/users', [ExchangeController::class, 'users']);
});