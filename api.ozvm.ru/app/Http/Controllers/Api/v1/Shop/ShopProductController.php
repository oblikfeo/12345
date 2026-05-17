<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Services\ShopProductService;

class ShopProductController extends Controller
{
    public function __invoke($slug)
    {
        return ShopProductService::get($slug);
    }
}