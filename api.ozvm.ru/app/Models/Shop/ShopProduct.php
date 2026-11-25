<?php

namespace App\Models\Shop;

use App\Models\Traits\HasImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class ShopProduct extends Model
{
    use HasSlug, HasImage, Searchable;

    protected $fillable = [
        'external_id',
        'shop_unit_id',
        'pieces_per_pack',
        'nomenclature_kind',
        'is_prescription',
        'title',
        'slug',
        'text',
        'images',
        'unit_id',
        'exchange_hash'
    ];

    protected $hidden = ['exchange_hash'];

    protected $casts = [
        'images' => 'array',
        'pieces_per_pack' => 'integer',
        'is_prescription' => 'boolean',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->skipGenerateWhen(fn() => !empty($this->slug));
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(ShopUnit::class, 'shop_unit_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ShopCategory::class);
    }

    public function rests(): BelongsToMany
    {
        return $this->belongsToMany(ShopStorage::class, 'shop_rests')->withPivot(['value']);
    }

    public function props(): BelongsToMany
    {
        return $this->belongsToMany(ShopProp::class, 'shop_product_shop_prop')->withPivot(['value']);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ShopProductPrice::class);
    }
}