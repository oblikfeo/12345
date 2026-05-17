<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Services\ShopProductService;
use Illuminate\Http\Request;

class ShopProductListController extends Controller
{
    public function __invoke(Request $request)
    {
        return ShopProductService::getList($request->collect());
    }
}