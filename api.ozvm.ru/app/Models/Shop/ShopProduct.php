<?php

namespace App\Models\Shop;

use App\Models\Traits\HasImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Scout\Searchable;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class ShopProduct extends Model
{
    use HasSlug, HasImage, Searchable;

    protected $fillable = [
        'external_id',
        'shop_unit_id',
        'title',
        'slug',
        'text',
        'images',
        'unit_id'
    ];

    protected $casts = [
        'images' => 'array'
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->skipGenerateWhen(fn() => !empty($this->slug));
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