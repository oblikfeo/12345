<?php

namespace App\Services;

use App\Models\Shop\ShopCategory;
use App\Models\Shop\ShopPriceType;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductPrice;
use App\Models\Shop\ShopProp;
use App\Models\Shop\ShopRest;
use App\Models\Shop\ShopStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Builder;
use function Symfony\Component\String\b;

class ShopProductService
{
    protected static int $defaultPriceTypeID = 1;

    public function __construct(public ShopProduct $product)
    {
    }

    public static function getChildID(ShopCategory $category)
    {
        $ids = [$category->id];
        foreach ($category->child as $item) {
            $ids[] = $item->id;
            if ($item->child) $ids = array_merge($ids, self::getChildID($item));
        }

        return $ids;
    }

    public static function getQuery(Collection $filters)
    {
        $tableRests    = (new ShopRest())->getTable();
        $tableProducts = (new ShopProduct())->getTable();
        $tablePrices   = (new ShopProductPrice())->getTable();

        /* @var $user UserService */
        $user = App::make(UserService::class);
        $stock = ShopStorage::query()->where('external_id', $user->user?->external_stock_id)->first();

        $query = ShopProduct::query()
            ->select([
                $tableProducts . '.*',
                DB::raw($tablePrices . '.value as price'),
                DB::raw('sum(' . $tableRests . '.value) as rests'),
                DB::raw('IF(sum(' . $tableRests . '.value) <> 0, 1, 0) as available')
            ])
            ->leftJoin($tableRests, $tableRests . '.shop_product_id', '=', $tableProducts . '.id')
            ->leftJoin($tablePrices, $tablePrices . '.shop_product_id', '=', $tableProducts . '.id')
            ->where('priceable_type', ShopPriceType::class)
            ->where('priceable_id', $user?->priceId ?: self::$defaultPriceTypeID)
            ->when($stock, function ($query) use ($stock) {
                $query->where('shop_storage_id', $stock->id);
            })
            ->groupBy($tableProducts . '.id')
            ->with(['categories', 'props']);


        $ids = [];
        if ($filters->get('query')) {
            $engine        = ShopProduct::search($filters->get('query'));
            $engine->limit = 1000;

            $ids = $engine->keys();
            $query->whereIn($tableProducts . '.id', $ids);
        }

        if ($filters->has('ids')) {
            $whereIds = $filters->get('ids');
            if(is_string($whereIds)) {
                $whereIds = explode(',', $whereIds);
            }
            $query->whereIn($tableProducts . '.id', $whereIds ?: []);
        }

        $order = in_array($filters->get('order', ''), ['title', 'price']) ? $filters->get('order', 'title') : 'default';
        $dir   = in_array($filters->get('dir', 'asc'), ['asc', 'desc']) ? $filters->get('dir', 'asc') : 'asc';

        $query->orderByRaw('IF(sum(' . $tableRests . '.value) <> 0, 1, 0) desc');

        switch ($order) {
            case 'title':
                $query->orderBy($order, $dir);
                break;
            case 'price':
                $query->orderBy(
                    DB::raw('ISNULL(' . $tablePrices . '.value' . '), ' . $tablePrices . '.value'),
                    $dir
                );
            default:
                if ($ids) {
                    $query->orderBy(DB::raw("FIELD(" . $tableProducts . ".id, " . implode(',', $ids->toArray()) . ")"));
                }
                break;
        }

        if ($filters->has('categories') || $filters->has('slugs')) {
            $categoryIDs = [];
            if ($filters->has('categories')) {
                $categoryIDs = $filters->get('categories', []);
                if (!is_array($categoryIDs)) {
                    $categoryIDs = [$categoryIDs];
                }
                $categoryIDs = ShopCategory::query()->whereIn('id', $categoryIDs)->pluck('id')->toArray();
            }
            if ($filters->has('slugs')) {
                $slugs = $filters->get('slugs', []);
                if (!is_array($slugs)) {
                    $slugs = [$slugs];
                }
                $categoryIDs = array_merge(
                    $categoryIDs,
                    ShopCategory::query()->whereIn('slug', $slugs)->pluck('id')->toArray()
                );
            }
            $categories = ShopCategory::query()->whereIn('id', $categoryIDs)->with(['child'])->get();
            foreach ($categories as $category) {
                $categoryIDs = array_merge(self::getChildID($category), $categoryIDs);
            }
            $categoryIDs = array_unique($categoryIDs);

            if (empty($categoryIDs)) abort(404);

            $query->whereHas('categories', function ($query) use ($categoryIDs) {
                $query->whereIn("shop_category_shop_product.shop_category_id", $categoryIDs);
            });
        }

        // Фильтрация по производителю
        if ($filters->has('manufacturer')) {
            $manufacturer = urldecode($filters->get('manufacturer'));
            $manufacturer = trim($manufacturer);
            $manufacturerProp = ShopProp::query()
                ->whereIn('title', ['Изготовитель', 'Производитель'])
                ->first();
            if ($manufacturerProp) {
                $query->whereHas('props', function ($query) use ($manufacturerProp, $manufacturer) {
                    $query->where('shop_props.id', $manufacturerProp->id)
                          ->whereRaw('BINARY TRIM(shop_product_shop_prop.value) = BINARY ?', [trim($manufacturer)]);
                });
            }
        }

        return $query;
    }

    public static function get(int|string $slugOrID)
    {
        $product = self::getQuery(collect())->where((new ShopProduct())->getTable() . '.slug', $slugOrID)->first();
        if(!$product) {
            $product = self::getQuery(collect())->where((new ShopProduct())->getTable() . '.id', $slugOrID)->first();
        }

        if (!$product) abort(404);

        return (new self($product))->transform(true);
    }

    public static function find(int $id)
    {
        $product = self::getQuery(collect())->where((new ShopProduct())->getTable() . '.id', $id)->first();

        if(!$product) return null;

        return (new self($product))->transform(extra: [ 'external_id' => $product->external_id ]);
    }

    public static function getList(Collection $filters)
    {
        $products = self::getQuery($filters)
            ->paginate($filters->get('limit', ($filters->has('ids') ? 1000 : 20)))
            ->appends(request()->input());

        return $products->setCollection(
            $products->getCollection()->transform(fn($product) => (new self($product))->transform())
        );
    }

    public function transform($withExtra = false, $extra = [])
    {
        return (object)array_merge([
            'id'         => $this->product->id,
            'title'      => $this->product->title,
            'slug'       => $this->product->slug,
            'price'      => (float)$this->product->price,
            'rests'      => (float)$this->product->rests,
            'props'      => $this->product->props,
            'categories' => $this->product->categories,
            'images'     => array_map(fn($image) => asset($image), $this->product->images),
        ], $withExtra ? [
            'text' => $this->product->text
        ] : [], $extra);
    }
}
