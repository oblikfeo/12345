<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class ShopOrderItem extends Model
{
    protected $fillable = [
        'external_id',
        'shop_order_id',
        'shop_product_id',
        'title',
        'image',
        'quantity',
        'price',
        'total',
    ];
}