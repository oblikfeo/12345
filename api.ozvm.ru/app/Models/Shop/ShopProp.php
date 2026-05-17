<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;

class ShopProp extends Model
{
    protected $fillable = [
        'title'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];
}