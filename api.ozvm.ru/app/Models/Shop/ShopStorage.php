<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class ShopStorage extends Model
{
    protected $fillable = [
        'external_id',
        'title',
    ];
}