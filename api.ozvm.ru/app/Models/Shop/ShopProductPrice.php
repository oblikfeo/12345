<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ShopProductPrice extends Model
{
    protected $fillable = [
        'shop_product_id',
        'priceable_id',
        'priceable_type',
        'value',
    ];

    protected $hidden = [
        'pivot'
    ];

    public function priceable(): MorphTo
    {
        return $this->morphTo();
    }
}