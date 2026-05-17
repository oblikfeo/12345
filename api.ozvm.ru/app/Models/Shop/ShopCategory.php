<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class ShopCategory extends Model
{
    use HasSlug;

    protected $fillable = [
        'shop_category_id',
        'external_id',
        'title',
        'slug'
    ];

    protected $hidden = [
        'pivot',
        'text', // todo uncomment in the future
        'shop_category_id',
        'external_id',
        'updated_at',
        'created_at'
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug')
            ->skipGenerateWhen(fn() => !empty($this->slug));
    }

    public function child(): HasMany
    {
        return $this->hasMany(self::class);
    }
}