<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Services\ShopOrderService;
use Illuminate\Http\Request;

class ShopCheckoutController extends Controller
{
    public function __invoke(Request $request)
    {
        return ShopOrderService::checkout($request);
    }
}