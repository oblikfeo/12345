<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Services\ShopCategoryService;

class ShopCategoryListController extends Controller
{
    public function __invoke()
    {
        return ShopCategoryService::getList();
    }
}