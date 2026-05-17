<?php

namespace App\Models\Shop;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShopOrder extends Model
{
    protected $fillable = [
      'external_id',
      'user_id',
      'delivery_type',
      'customer_extra',
      'delivery_extra',
      'notified_at'
    ];

    protected $casts = [
        'customer_extra' => 'array',
        'delivery_extra' => 'array'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ShopOrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}