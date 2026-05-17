<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class ShopPriceType extends Model
{
    protected $fillable = [
        'external_id',
        'title'
    ];
}