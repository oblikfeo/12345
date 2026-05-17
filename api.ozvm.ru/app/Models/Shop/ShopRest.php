<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class ShopRest extends Model
{
    protected $fillable = [
        'shop_product_id',
        'shop_storage_id',
        'value'
    ];

    public $timestamps = false;
}