<?php

namespace App\Services;

use App\Models\Shop\ShopCategory;

class ShopCategoryService
{
    public function __construct(public ShopCategory $category)
    {
    }

    public static function getList()
    {
        return ShopCategory::query()
            ->with('child')
            ->whereNull('shop_category_id')
            ->get();
    }
}