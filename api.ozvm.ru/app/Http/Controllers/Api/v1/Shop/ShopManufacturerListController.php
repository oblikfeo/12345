<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopProp;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopPriceType;
use App\Models\Shop\ShopProductPrice;
use App\Models\Shop\ShopRest;
use App\Models\Shop\ShopStorage;
use App\Services\ShopProductService;
use App\Services\UserService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

class ShopManufacturerListController extends Controller
{
    public function __invoke()
    {
        // Ищем по "Изготовитель" или "Производитель"
        $manufacturerProp = ShopProp::query()
            ->whereIn('title', ['Изготовитель', 'Производитель'])
            ->first();
        
        if (!$manufacturerProp) {
            return [];
        }

        /* @var $user UserService */
        $user = App::make(UserService::class);
        $stock = ShopStorage::query()->where('external_id', $user->user?->external_stock_id)->first();
        $priceTypeId = $user?->priceId ?: 1;

        // Используем ShopProductService::getQuery для получения товаров, видимых пользователю
        $baseQuery = ShopProductService::getQuery(collect());
        
        // Получаем ID товаров, которые видны пользователю
        $visibleProductIds = $baseQuery->pluck('id');
        
        if ($visibleProductIds->isEmpty()) {
            return [];
        }

        // Получаем производителей только для видимых товаров
        $manufacturers = DB::table('shop_product_shop_prop as spp')
            ->whereIn('spp.shop_product_id', $visibleProductIds)
            ->where('spp.shop_prop_id', $manufacturerProp->id)
            ->whereNotNull('spp.value')
            ->where('spp.value', '!=', '')
            ->whereRaw('TRIM(spp.value) != ""')
            ->select('spp.value')
            ->distinct()
            ->orderBy('spp.value')
            ->pluck('value')
            ->map(function($value) {
                return trim($value);
            })
            ->filter(function($value) {
                // Строгая проверка - не пустая строка, не только пробелы, минимум 1 символ
                $trimmed = trim($value);
                return !empty($trimmed) && strlen($trimmed) > 0 && $trimmed !== '';
            })
            ->unique()
            ->values()
            ->reject(function($value) {
                // Отбрасываем если после trim пусто
                return empty(trim($value));
            });

        return $manufacturers;
    }
}







