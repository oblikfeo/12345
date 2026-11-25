<?php

namespace App\Services;

use App\Classes\Xml;
use App\Enums\ShopOrderDeliveryType;
use App\Models\Shop\ShopCategory;
use App\Models\Shop\ShopOrder;
use App\Models\Shop\ShopOrderItem;
use App\Models\Shop\ShopPriceType;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopStorage;
use App\Models\Shop\ShopUnit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ZipArchive;

class ExchangeService
{
    protected array|null $users = null;

    protected array|null $orders = null;

    protected array|null $prices = null;

    protected array|null $priceTypes = null;
    protected array $priceTypeByKeys = [];

    protected array|null $rests = null;

    protected array|null $storages = null;
    protected array|null $storageByKeys = null;

    protected array|null $units = null;
    protected array|null $unitByKeys = null;

    /* @var $groups \SimpleXMLElement[] */
    protected array|null $groups = null;
    /* @var $groupIDs int[] */
    protected array $groupIDs = [];
    protected array $groupByKeys = [];

    /* @var $goods \SimpleXMLElement[] */
    protected array|null $goods = null;
    /* @var $goodsIDs int[] */
    protected array $goodsIDs = [];

    /** Товары до импорта: external_id => [id, отпечаток карточки]. */
    protected array $productByKeys = [];
    /** external_id товаров, пришедших в этой выгрузке. */
    protected array $goodsKeys = [];
    /** Товары, у которых поменялась карточка, — только их отправляем в поиск. */
    protected array $changedProductIDs = [];

    /** Счётчики для лога обмена. */
    protected array $stats = [];

    protected static int $queries = 0;
    protected static bool $listening = false;

    public function __construct(string $pathZip)
    {
        $directory = dirname($pathZip) . '/exchange_' . time();
        $zip       = new ZipArchive;
        if ($zip->open($pathZip) === True) {
            $zip->extractTo($directory);
            $zip->close();
        }

        $files = $this->findXmlFiles($directory);
        if ($files) {
            foreach ($files as $file) {
                $content = @file_get_contents($file);
                if ($content && $xml = simplexml_load_string($content)) {
                    $attrs = $xml->attributes();
                    $id    = $attrs['Ид'] ?? '';

                    if ($id == 'Индивидуальные цены') {

                    } else if (isset($xml->Контрагенты)) {
                        $this->users[] = json_decode(json_encode($xml), true);
                    } else if (isset($xml->Заказы)) {
                        $this->orders[] = json_decode(json_encode($xml), true);
                    }
                }
            }
        }

        $xmlGroups = glob($directory . '/groups/*.xml');
        if ($xmlGroups) {
            foreach ($xmlGroups as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->groups[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlUnits = glob($directory . '/units/*.xml');
        if ($xmlUnits) {
            foreach ($xmlUnits as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->units[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlGoods = glob($directory . '/goods/*.xml');
        if ($xmlGoods) {
            foreach ($xmlGoods as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->goods[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlStorages = glob($directory . '/storages/*.xml');
        if ($xmlStorages) {
            foreach ($xmlStorages as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->storages[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlRests = glob($directory . '/rests/*.xml');
        if ($xmlRests) {
            foreach ($xmlRests as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->rests[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlPriceList = glob($directory . '/priceLists/*.xml');
        if ($xmlPriceList) {
            foreach ($xmlPriceList as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->priceTypes[] = json_decode(json_encode($xml), true);
                }
            }
        }
        $xmlPrices = glob($directory . '/prices/*.xml');
        if ($xmlPrices) {
            foreach ($xmlPrices as $xmlFile) {
                $content = @file_get_contents($xmlFile);
                if ($content && $xml = simplexml_load_string($content)) {
                    $this->prices[] = json_decode(json_encode($xml), true);
                }
            }
        }

        $this->moveImages($directory);

        if(env('APP_ENV') !== 'local') {
            File::delete($pathZip);
            File::cleanDirectory(dirname($pathZip));
            File::deleteDirectory(dirname($pathZip));
        }
    }

    /**
     * Разбор одного архива от 1С с записью в лог обмена: сколько шло,
     * сколько запросов к базе, что поменялось.
     */
    public static function run(string $pathZip): array
    {
        if (!self::$listening) {
            DB::listen(fn () => self::$queries++);
            self::$listening = true;
        }

        $queries = self::$queries;
        $started = microtime(true);

        $service = new self($pathZip);
        $service->import();

        $stats = [
            'zip'     => basename(dirname($pathZip)),
            'sec'     => round(microtime(true) - $started, 2),
            'queries' => self::$queries - $queries,
            'mem_mb'  => round(memory_get_peak_usage(true) / 1048576),
        ] + $service->stats;

        Log::channel('exchange')->info('import', $stats);

        return $stats;
    }

    public function stats(): array
    {
        return $this->stats;
    }

    public function findXmlFiles($directory)
    {
        $files = [];

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($iterator as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'xml') {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }

    public function import()
    {
        // Поиск обновляем одним пакетом в конце и только по изменившимся
        // карточкам, а не отдельным запросом на каждый сохранённый товар.
        ShopProduct::withoutSyncingToSearch(function () {
            $this->importUnits();
            $this->importPriceTypes();
            $this->importStorages();
            $this->importGroups();
            $this->importGoods();
            $this->importRests();
            $this->importPrices();
            $this->importUsers();
            $this->importOrders();
        });

        if ($this->changedProductIDs) {
            ShopProduct::query()->whereIn('id', array_unique($this->changedProductIDs))->searchable();
            $this->stats['search_updated'] = count(array_unique($this->changedProductIDs));
        }
    }

    protected function moveImages(string $directory)
    {
        if ($this->goods) {
            foreach ($this->goods as $xml) {
                $base  = $xml['Каталог'];
                $goods = isset($base['Товары']['Товар']['Ид']) ? [$base['Товары']['Товар']] : $base['Товары']['Товар'];

                foreach ($goods as $good) {
                    if (isset($good['Картинка'])) {
                        $images = is_array($good['Картинка']) ? $good['Картинка'] : [$good['Картинка']];

                        foreach ($images as $image) {
                            $path = $directory . '/goods/' . $image;
                            if (file_exists($path)) {
                                $file = storage_path('app/public/images/' . $image);
                                if (!file_exists(dirname($file))) {
                                    File::makeDirectory(dirname($file), recursive: true);
                                }
                                File::move($path, storage_path('app/public/images/' . $image));
                            }
                        }
                    }
                }
            }
        }
    }

    /** external_id => id; при дублях — первый по id, как и выборка ->first(). */
    protected function productIdsByKeys(): array
    {
        $map = [];
        foreach (DB::table('shop_products')->orderBy('id')->get(['id', 'external_id']) as $row) {
            $map[$row->external_id] ??= $row->id;
        }

        return $map;
    }

    /**
     * Цены: одна выборка текущих значений, в базу пишем только разницу.
     * Итог тот же, что у прежнего updateOrCreate по каждой цене:
     * у товара из выгрузки остаются ровно присланные типы цен.
     */
    protected function importPrices()
    {
        if (!$this->prices) {
            return;
        }

        $productIds = $this->productIdsByKeys();
        $priceTypes = $this->priceTypeByKeys + ShopPriceType::query()->pluck('id', 'external_id')->all();

        // Если товар пришёл несколько раз, побеждает последнее предложение.
        $desired = [];
        foreach ($this->prices as $xml) {
            foreach ($xml['ПакетПредложений']['Предложения']['Предложение'] as $price) {
                $productId = $productIds[$price['Ид']] ?? null;
                if (!$productId) {
                    continue;
                }

                $list  = isset($price['Цены']['Цена']['ЦенаЗаЕдиницу']) ? [$price['Цены']['Цена']] : $price['Цены']['Цена'];
                $items = [];
                foreach ($list as $item) {
                    $type = $priceTypes[$item['ИдТипаЦены']] ?? null;
                    if ($type) {
                        $items[$type] = (float) $item['ЦенаЗаЕдиницу'];
                    }
                }
                $desired[$productId] = $items;
            }
        }

        $current = [];
        foreach (
            DB::table('shop_product_prices')
                ->orderBy('id')
                ->get(['id', 'shop_product_id', 'priceable_type', 'priceable_id', 'value']) as $row
        ) {
            if (isset($desired[$row->shop_product_id])) {
                $current[$row->shop_product_id][] = $row;
            }
        }

        $now     = Carbon::now();
        $inserts = [];
        $updates = [];
        $deletes = [];

        foreach ($desired as $productId => $items) {
            $kept = [];
            foreach ($current[$productId] ?? [] as $row) {
                $type = (int) $row->priceable_id;
                if ($row->priceable_type !== ShopPriceType::class || !array_key_exists($type, $items) || isset($kept[$type])) {
                    $deletes[] = $row->id;
                    continue;
                }

                $kept[$type] = true;
                if (abs((float) $row->value - $items[$type]) >= 0.005) {
                    $updates[(string) $items[$type]][] = $row->id;
                }
            }

            foreach ($items as $type => $value) {
                if (!isset($kept[$type])) {
                    $inserts[] = [
                        'shop_product_id' => $productId,
                        'priceable_type'  => ShopPriceType::class,
                        'priceable_id'    => $type,
                        'value'           => $value,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ];
                }
            }
        }

        DB::transaction(function () use ($inserts, $updates, $deletes, $now) {
            foreach (array_chunk($deletes, 1000) as $ids) {
                DB::table('shop_product_prices')->whereIn('id', $ids)->delete();
            }
            foreach ($updates as $value => $ids) {
                foreach (array_chunk($ids, 1000) as $chunk) {
                    DB::table('shop_product_prices')->whereIn('id', $chunk)->update(['value' => (float) $value, 'updated_at' => $now]);
                }
            }
            foreach (array_chunk($inserts, 500) as $rows) {
                DB::table('shop_product_prices')->insert($rows);
            }
        }, 2);

        $this->stats['prices'] = [
            'products' => count($desired),
            'inserted' => count($inserts),
            'updated'  => array_sum(array_map('count', $updates)),
            'deleted'  => count($deletes),
        ];
    }

    protected function importUsers()
    {
        if ($this->users) {
            $existing = User::query()->whereNotNull('external_id')->get()->keyBy('external_id');
            $this->stats['users'] = ['total' => 0, 'skipped' => 0];

            foreach ($this->users as $xml) {
                $users = $xml['Контрагенты']['Контрагент'];

                foreach ($users as $user) {
                    $this->stats['users']['total']++;
                    $this->storeUser($user, $existing);
                }
            }
        }
    }

    public function storeUser($user, $existing = null)
    {
        try {
            if (is_array($user) && $user['Почта']) {
                $attributes = [
                    'min_order_amount'  => (float)$user['МинимальнаяСуммаЗаказа'],
                    'external_price_id' => (string)$user['ВидЦенИд'],
                    'external_stock_id' => (string)$user['Склад'] ?? null,
                    'name'              => (string)$user['Наименование'],
                    'manager_name'      => (string)$user['Менеджер'] ?? null,
                    'manager_email'     => (string)$user['ПочтаМенеджера'] ?? null,
                    'phone'             => (string)$user['Телефон'],
                    'email'             => (string)$user['Почта'],
                ];
                $passwordHash = strrev(base64_encode((string)$user['Пароль']));

                // Хеш пароля (bcrypt) — самое дорогое в импорте контрагента.
                // Сайт меняет password и password_hash всегда вместе, поэтому
                // совпавший password_hash значит, что пароль тот же.
                $current = $existing?->get($user['Ид']);
                if ($current && $current->password_hash === $passwordHash && $this->sameAttributes($current, $attributes)) {
                    $this->stats['users']['skipped']++;
                    return;
                }

                User::query()->updateOrCreate(
                    [
                        'external_id' => $user['Ид']
                    ],
                    $attributes + [
                        'password'      => Hash::make((string)$user['Пароль']),
                        'password_hash' => $passwordHash,
                    ]
                );
            } elseif (!is_array($user)) {
                // todo maybelog
            }
        } catch (\Exception $exception) {
        }
    }

    protected function sameAttributes($model, array $attributes): bool
    {
        foreach ($attributes as $key => $value) {
            $old = $model->getAttributes()[$key] ?? null;
            if ($old === null) {
                return false;
            }
            if (is_float($value) ? abs((float) $old - $value) >= 0.005 : (string) $old !== (string) $value) {
                return false;
            }
        }

        return true;
    }

    protected function storePriceType($type)
    {
        $priceType = ShopPriceType::query()->updateOrCreate(
            [
                'external_id' => $type['Ид']
            ],
            [
                'title' => $type['Наименование']
            ]
        );

        $this->priceTypeByKeys[$priceType->external_id] = $priceType->id;
    }

    protected function importPriceTypes()
    {
        if ($this->priceTypes) {
            foreach ($this->priceTypes as $xml) {
                $types = $xml['Классификатор']['ТипыЦен']['ТипЦены'];
                foreach ($types as $type) {
                    $this->storePriceType($type);
                }
            }
        }
    }

    /**
     * Остатки: одна выборка текущих значений, в базу пишем только разницу.
     * Итог тот же, что у прежнего rests()->sync() по каждому товару.
     * Остатки товаров, которых нет в выгрузке, обнуляем только когда выгрузка
     * полная: 1С присылает и частичные, и они стирали наличие у остальных.
     */
    protected function importRests()
    {
        if (!$this->rests) {
            return;
        }

        $productIds = $this->productIdsByKeys();
        $storageIds = ($this->storageByKeys ?? []) + ShopStorage::query()->pluck('id', 'external_id')->all();

        $desired = [];
        foreach ($this->rests as $xml) {
            foreach ($xml['ПакетПредложений']['Предложения']['Предложение'] as $rest) {
                $productId = $productIds[$rest['Ид']] ?? null;
                if (!$productId) {
                    continue;
                }

                $storages = isset($rest['Остатки']['Остаток']['Склад']) ? [$rest['Остатки']['Остаток']['Склад']] : $rest['Остатки']['Остаток'];

                $items = [];
                foreach ($storages as $storage) {
                    if (isset($storage['Склад'])) {
                        $storage = $storage['Склад'];
                    }

                    if (!isset($storage['Ид'])) continue;

                    if (isset($storageIds[$storage['Ид']])) {
                        // (float): max(0, 0.0) вернул бы целое 0 и сравнение ниже не сработало бы
                        $items[$storageIds[$storage['Ид']]] = (float) max(0, (float)$storage['Количество']);
                    }
                }
                $desired[$productId] = $items;
            }
        }

        // [товар][склад] => [значение, id строк]
        $current = [];
        foreach (DB::table('shop_rests')->orderBy('id')->get(['id', 'shop_product_id', 'shop_storage_id', 'value']) as $row) {
            $cell = &$current[$row->shop_product_id][$row->shop_storage_id];
            if ($cell === null) {
                $cell = ['value' => (float) $row->value, 'ids' => []];
            } elseif ($cell['value'] !== (float) $row->value) {
                $cell['value'] = null; // дубли с разными значениями — перепишем
            }
            $cell['ids'][] = $row->id;
            unset($cell);
        }

        $inserts = [];
        $updates = [];
        $deletes = [];

        foreach ($desired as $productId => $items) {
            $cells = $current[$productId] ?? [];
            foreach ($items as $storageId => $value) {
                if (!isset($cells[$storageId])) {
                    $inserts[] = ['shop_product_id' => $productId, 'shop_storage_id' => $storageId, 'value' => $value];
                } elseif ($cells[$storageId]['value'] !== $value) {
                    $updates[(string) $value] = array_merge($updates[(string) $value] ?? [], $cells[$storageId]['ids']);
                }
            }
            foreach ($cells as $storageId => $cell) {
                if (!array_key_exists($storageId, $items)) {
                    array_push($deletes, ...$cell['ids']);
                }
            }
        }

        $absent = array_diff_key($current, $desired);
        $share  = $current ? 1 - count($absent) / count($current) : 1;
        $full   = $share >= (float) config('shop.exchange_remove_min_share');
        if ($full) {
            foreach ($absent as $cells) {
                foreach ($cells as $cell) {
                    array_push($deletes, ...$cell['ids']);
                }
            }
        }

        DB::transaction(function () use ($inserts, $updates, $deletes) {
            foreach (array_chunk($deletes, 1000) as $ids) {
                DB::table('shop_rests')->whereIn('id', $ids)->delete();
            }
            foreach ($updates as $value => $ids) {
                foreach (array_chunk($ids, 1000) as $chunk) {
                    DB::table('shop_rests')->whereIn('id', $chunk)->update(['value' => (float) $value]);
                }
            }
            foreach (array_chunk($inserts, 500) as $rows) {
                DB::table('shop_rests')->insert($rows);
            }
        }, 2);

        $this->stats['rests'] = [
            'products' => count($desired),
            'inserted' => count($inserts),
            'updated'  => array_sum(array_map('count', $updates)),
            'deleted'  => count($deletes),
            'share'    => round($share, 3),
            'absent_cleared' => $full,
        ];
    }

    protected function importOrders()
    {
        if ($this->orders) {
            foreach ($this->orders as $xml) {
                if(!isset($xml['Заказы']['Заказ']) && !isset($xml['Заказы']['Заказ']['ИдСайт'])) continue;

                  $orders = isset($xml['Заказы']['Заказ']['ИдСайт']) ? [$xml['Заказы']['Заказ']] : $xml['Заказы']['Заказ'];

                foreach ($orders as $order) {
                    ShopOrder::query()
                        ->where('external_id', $order['ИдСайт'])
                        ->whereNull('notified_at')
                        ->update([
                            'notified_at' => Carbon::now()
                        ]);
                }
            }
        }
    }

    protected function storeStorage($storage)
    {
        if ($storage['Ид']) {
            $storage = ShopStorage::query()->updateOrCreate(
                [
                    'external_id' => $storage['Ид']
                ], [
                    'title' => trim($storage['Наименование']),
                ]
            );

            $this->storageByKeys[$storage->external_id] = $storage->id;
        }
    }

    protected function importStorages()
    {
        if ($this->storages) {
            foreach ($this->storages as $xml) {
                $base     = $xml['Классификатор'];
                $storages = isset($base['Склады']['Склад']['Ид']) ? [$base['Склады']['Склад']] : $base['Склады']['Склад'];

                foreach ($storages as $storage) {
                    $this->storeStorage($storage);
                }
            }
        }
    }

    protected function removeGroups()
    {
        ShopCategory::query()->whereNotIn('id', $this->groupIDs)->delete();
    }

    protected function storeGroups(array $groups, ShopCategory $parent = null)
    {
        foreach ($groups as $group) {
            $category = ShopCategory::query()->updateOrCreate(
                [
                    'external_id' => $group['Ид']
                ],
                [
                    'title'            => trim($group['Наименование']),
                    'shop_category_id' => $parent?->id
                ]
            );

            $this->groupIDs[]                          = $category->id;
            $this->groupByKeys[$category->external_id] = $category->id;

            if (isset($group['Группы'], $group['Группы']['Группа'])) {
                if (isset($group['Группы']['Группа']['Ид'])) {
                    $this->storeGroups([$group['Группы']['Группа']], $category);
                } else {
                    $this->storeGroups($group['Группы']['Группа'], $category);
                }
            }
        }
    }

    protected function importGroups()
    {
        if ($this->groups) {
            foreach ($this->groups as $xml) {
                $base   = $xml['Классификатор'];
                $groups = isset($base['Группы']['Группа']['Группы']['Группа']) ? $base['Группы']['Группа']['Группы']['Группа'] : $base['Группы']['Группа'];

                $this->storeGroups(isset($groups['Ид']) ? [$groups] : $groups);
            }
            $this->removeGroups();
        }
    }

    protected function storeUnit(array $unit)
    {
        if ($unit['Ид']) {
            $unit = ShopUnit::query()->updateOrCreate(
                [
                    'external_id' => $unit['Ид']
                ], [
                    'title'       => $unit['НаименованиеПолное'] ? trim($unit['НаименованиеПолное']) : trim($unit['НаименованиеКраткое']),
                    'title_short' => $unit['НаименованиеКраткое'] ? trim($unit['НаименованиеКраткое']) : trim($unit['НаименованиеПолное'])
                ]
            );

            $this->unitByKeys[$unit->external_id] = $unit->id;
        }
    }

    protected function importUnits()
    {
        if ($this->units) {
            foreach ($this->units as $xml) {
                $base  = $xml['Классификатор'];
                $units = isset($base['ЕдиницыИзмерения']['ЕдиницаИзмерения']['Ид']) ? [$base['ЕдиницыИзмерения']['ЕдиницаИзмерения']] : $base['ЕдиницыИзмерения']['ЕдиницаИзмерения'];

                foreach ($units as $unit) {
                    $this->storeUnit($unit);
                }
            }
        }
    }

    protected function storeGood(array $good)
    {
        if ($good['Ид']) {
            $unit = $good['БазоваяЕдиница'] ? trim($good['БазоваяЕдиница']) : null;
            if ($unit) {
                $unit = $this->unitByKeys[$unit] ?? null;
            }

            $images = [];
            if (isset($good['Картинка'])) {
                $images = is_array($good['Картинка']) ? $good['Картинка'] : [$good['Картинка']];
                $images = array_map(fn($image) => "/storage/images/" . $image, $images);
            }

            $attributes = [
                'title'           => trim($good['Наименование']),
                'shop_unit_id'    => $unit,
                'pieces_per_pack' => $this->extractPiecesPerPack($good),
                'nomenclature_kind' => $this->findNamedExchangeValue($good, 'ВидНоменклатуры') ?: null,
                'is_prescription' => $this->extractPrescription($good),
                'text'            => $good['Описание'] ?: null,
                'images'          => $images,
            ];

            // Уменьшенные копии для новых фото. Уже готовые пропускаются — это одна проверка файла.
            // Делаем и для неизменившихся товаров: файлы фото приходят отдельной выгрузкой.
            // Сбой здесь не должен ронять импорт товара.
            foreach ($images as $image) {
                try {
                    ProductThumbService::make($image);
                } catch (\Throwable $e) {
                    Log::warning('Не удалось сделать копию фото ' . $image . ': ' . $e->getMessage());
                }
            }

            if(isset($good['Группы']['Ид']) && is_array($good['Группы']['Ид'])) {
                $groups = array_map(fn($item) => $item, $good['Группы']['Ид']);
            } else {
                $groups = isset($good['Группы']['Ид']) ? [$good['Группы']['Ид']] : array_map(fn($item) => $item['Ид'], $good['Группы']);
            }
            $ids    = array_values(array_filter(array_map(fn($externalID) => $this->groupByKeys[$externalID] ?? null, $groups)));

            // null — свойства не разобрать, их не трогаем (как и раньше при ошибке)
            try {
                $props = [];
                if ($good['Страна'] ?? false) {
                    $props[1] = ['value' => $good['Страна']];
                }
                if ($good['Изготовитель'] ?? false) {
                    $props[2] = ['value' => $good['Изготовитель']['ОфициальноеНаименование']];
                }
            } catch (\Exception $exception) {
                Log::error($exception);
                $props = null;
            }

            $this->goodsKeys[$good['Ид']] = true;
            $this->stats['goods']['total']++;

            // Отпечаток всего, что пишем в карточку. Совпал с прошлым — товар не трогаем.
            $hash     = md5(json_encode([$attributes, $ids, $props], JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION));
            $existing = $this->productByKeys[$good['Ид']] ?? null;
            if ($existing && $existing['hash'] === $hash && config('shop.exchange_skip_unchanged')) {
                $this->goodsIDs[] = $existing['id'];
                $this->stats['goods']['skipped']++;
                return;
            }

            $product = DB::transaction(function () use ($good, $attributes, $hash, $ids, $props) {
                $product = ShopProduct::query()->updateOrCreate(
                    [
                        'external_id' => $good['Ид']
                    ],
                    $attributes + ['exchange_hash' => $hash]
                );

                $product->categories()->sync($ids);

                if ($props !== null) {
                    try {
                        $product->props()->sync($props);
                    } catch (\Exception $exception) {
                        Log::error($exception);
                        ShopProduct::query()->whereKey($product->id)->update(['exchange_hash' => null]);
                    }
                }

                return $product;
            });

            $this->stats['goods']['changed']++;
            $this->changedProductIDs[] = $product->id;
            $this->goodsIDs[] = $product->id;
        }
    }

    protected function extractPiecesPerPack(array $good): ?int
    {
        $value = $this->findNamedExchangeValue($good, 'Штук в упаковке');
        if ($value === null || $value === '') {
            return null;
        }

        $pieces = (int) preg_replace('/\D+/', '', (string) $value);

        return $pieces > 0 ? $pieces : null;
    }

    /**
     * «Рецептурный»: 1С присылает его реквизитом товара со значением true / false.
     * На случай, если выгрузку перенастроят на свойство-справочник, понимаем и его:
     * код свойства из config('shop.prescription_property_id'), значения те же.
     * Нет ни того ни другого — признак неизвестен, возвращаем null.
     */
    protected function extractPrescription(array $good): ?bool
    {
        $value = $this->findNamedExchangeValue($good, 'Рецептурный');

        if ($value === null) {
            $items = $good['ЗначенияСвойств']['ЗначенияСвойства'] ?? null;
            if ($items) {
                if (isset($items['Ид'])) {
                    $items = [$items];
                }

                foreach ($items as $item) {
                    if (trim((string) ($item['Ид'] ?? '')) !== config('shop.prescription_property_id')) {
                        continue;
                    }

                    $raw   = $item['Значение'] ?? null;
                    $value = is_array($raw) ? ($raw[0] ?? null) : $raw;
                    break;
                }
            }
        }

        $value = mb_strtolower(trim((string) $value));

        if (in_array($value, ['true', 'да'], true)) {
            return true;
        }

        if (in_array($value, ['false', 'нет'], true)) {
            return false;
        }

        return null;
    }

    protected function findNamedExchangeValue(array $data, string $name): ?string
    {
        foreach ($data as $key => $value) {
            if (is_string($key) && mb_strtolower(trim($key)) === mb_strtolower($name) && is_scalar($value)) {
                return trim((string) $value);
            }
        }

        foreach (['ЗначенияРеквизитов', 'ЗначенияСвойств'] as $block) {
            if (empty($data[$block])) {
                continue;
            }

            $items = $data[$block]['ЗначениеРеквизита']
                ?? $data[$block]['ЗначенияСвойства']
                ?? $data[$block]['ЗначениеСвойства']
                ?? null;

            if (!$items) {
                continue;
            }

            if (isset($items['Наименование']) || isset($items['Ид'])) {
                $items = [$items];
            }

            foreach ($items as $item) {
                $itemName = trim((string) ($item['Наименование'] ?? $item['НаименованиеСвойства'] ?? ''));
                if ($itemName !== $name) {
                    continue;
                }

                $itemValue = $item['Значение'] ?? $item['ЗначениеСвойства'] ?? null;
                if (is_array($itemValue)) {
                    $itemValue = $itemValue['#text'] ?? $itemValue[0] ?? null;
                }

                if ($itemValue !== null && $itemValue !== '') {
                    return trim((string) $itemValue);
                }
            }
        }

        return null;
    }

    /**
     * Удаляем товары, которых нет в выгрузке, только если выгрузка полная.
     * 1С присылает и частичные (1–3 файла товаров из 4) — раньше после них
     * удалялся остальной каталог и потом создавался заново под новыми id.
     */
    protected function removeGoods()
    {
        $existing = count($this->productByKeys);
        $present  = count(array_intersect_key($this->productByKeys, $this->goodsKeys));
        $share    = $existing ? $present / $existing : 1;

        $this->stats['goods']['share'] = round($share, 3);

        if ($share < (float) config('shop.exchange_remove_min_share')) {
            $this->stats['goods']['remove_skipped'] = true;
            return;
        }

        $removed = 0;
        ShopProduct::query()
            ->whereNotIn('id', $this->goodsIDs)
            ->select('id')
            ->chunkById(500, function ($products) use (&$removed) {
                // Bulk delete skips model events, so remove products from the search index explicitly first.
                $products->unsearchable();

                ShopProduct::query()->whereIn('id', $products->pluck('id'))->delete();
                $removed += $products->count();
            });

        $this->stats['goods']['removed'] = $removed;
    }

    /** У связей товар–категория нет внешнего ключа: связи удалённых товаров убираем сами. */
    protected function removeOrphanCategoryLinks()
    {
        $this->stats['goods']['orphan_links_removed'] = DB::delete(
            'DELETE c FROM shop_category_shop_product c LEFT JOIN shop_products p ON p.id = c.shop_product_id WHERE p.id IS NULL'
        );
    }

    protected function importGoods()
    {
        if ($this->goods) {
            $this->stats['goods'] = ['total' => 0, 'changed' => 0, 'skipped' => 0];

            foreach (DB::table('shop_products')->orderBy('id')->get(['id', 'external_id', 'exchange_hash']) as $row) {
                $this->productByKeys[$row->external_id] ??= ['id' => $row->id, 'hash' => $row->exchange_hash];
            }

            foreach ($this->goods as $xml) {
                $base  = $xml['Каталог'];
                $goods = isset($base['Товары']['Товар']['Ид']) ? [$base['Товары']['Товар']] : $base['Товары']['Товар'];

                foreach ($goods as $good) {
                    $this->storeGood($good);
                }
            }
            $this->removeGoods();
            $this->removeOrphanCategoryLinks();
        }
    }


    public static function exportUsers(Request $request)
    {
        $xml = new Xml('<?xml version="1.0" encoding="UTF-8"?><КоммерческаяИнформация/>');
        $xml->addAttribute('ДатаФормирования', date('Y-m-d\\TH:i:s', strtotime('now')));
        $xml->addAttribute('ВерсияСхемы', '2.04');

        $users = User::query()->orderBy('id', 'desc')
            ->whereNotNull('external_id')
            ->where('id', '<>', 2) // Remove exchange user from collection
            ->get();

        $docs = $xml->addChild('Контрагенты');
        foreach ($users as $user) {
            $doc = $docs->addChild('Контрагент');
            $doc->addAttribute('ВремяИзменения', $user->updated_at);
            Xml::safeAddChild($doc, 'Ид', $user->external_id);
            Xml::safeAddChild($doc, 'Наименование', $user->name);
            Xml::safeAddChild($doc, 'Пароль', self::decodeExchangePassword($user->password_hash));
            Xml::safeAddChild($doc, 'Телефон', $user->phone);
            Xml::safeAddChild($doc, 'Почта', $user->email);
        }

        $dom               = dom_import_simplexml($xml)->ownerDocument;
        $dom->formatOutput = true;
        $xml               = $dom->saveXML();

        return response($xml)->header('Content-type', 'text/xml');
    }

    /**
     * 1С забирает заказы каждую минуту, а меняются они заметно реже.
     * Собранный XML отдаём повторно, пока в этих заказах, их позициях и
     * покупателях ничего не изменилось. Проверка — три лёгких запроса
     * вместо сборки всех заказов с позициями. «Дата формирования»
     * в ответе всегда текущая, как и без кеша.
     */
    public static function exportOrders(Request $request)
    {
        $from  = $request->get('from');
        $query = $from
            ? ShopOrder::query()->where('created_at', '>', Carbon::parse($from))
            : ShopOrder::query()->orderBy('id', 'desc')->limit(20);

        $heads = (clone $query)->get(['id', 'user_id', 'updated_at']);
        $items = ShopOrderItem::query()
            ->whereIn('shop_order_id', $heads->pluck('id'))
            ->selectRaw('count(*) as c, max(updated_at) as m')
            ->first();

        $fingerprint = md5(json_encode([
            $heads->map(fn ($order) => [$order->id, (string) $order->updated_at])->all(),
            [$items?->c, $items?->m],
            User::query()->whereIn('id', $heads->pluck('user_id')->filter())->max('updated_at'),
        ]));

        $cacheKey = 'exchange_orders:' . md5((string) $from);
        $cached   = Cache::get($cacheKey);

        if (is_array($cached) && ($cached['fingerprint'] ?? null) === $fingerprint) {
            $xml = $cached['xml'];
        } else {
            $xml = self::buildOrdersXml($query->with(['user', 'items'])->get());
            Cache::forever($cacheKey, ['fingerprint' => $fingerprint, 'xml' => $xml]);
        }

        $xml = preg_replace(
            '/ДатаФормирования="[^"]*"/u',
            'ДатаФормирования="' . date('Y-m-d\TH:i:s') . '"',
            $xml,
            1
        );

        return response($xml)->header('Content-type', 'text/xml');
    }

    protected static function buildOrdersXml($orders): string
    {
        $xml = new Xml('<?xml version="1.0" encoding="UTF-8"?><КоммерческаяИнформация/>');
        $xml->addAttribute('ДатаФормирования', date('Y-m-d\TH:i:s', strtotime('now')));
        $xml->addAttribute('ВерсияСхемы', '2.04');

        $docs = $xml->addChild('Документы');
        foreach ($orders as $order) {
            $doc = $docs->addChild('Документ');
            $doc->addChild('Ид', $order->external_id);
            $doc->addChild('Номер', $order->id);
            $doc->addChild('Дата', $order->created_at->format('Y-m-d'));
            $doc->addChild('Время', $order->created_at->format('H:i:s'));

            $user = $doc->addChild('Контрагент');
            if ($order->user) {
                Xml::safeAddChild($user, 'Ид', $order->user->external_id);
                Xml::safeAddChild($user, 'Наименование', $order->user->name);
                Xml::safeAddChild($user, 'Телефон', $order->user->phone);
                Xml::safeAddChild($user, 'Адрес', $order->user->address);
                Xml::safeAddChild($user, 'Почта', $order->user->email);
                Xml::safeAddChild($user, 'Пароль', self::decodeExchangePassword($order->user->password_hash));
            }
            $recipient = $doc->addChild('Получатель');
            Xml::safeAddChild($recipient, 'Наименование', $order->customer_extra['recipient']['name'] ?? '');
            Xml::safeAddChild($recipient, 'Телефон', $order->customer_extra['recipient']['phone'] ?? '');

            $delivery = $doc->addChild('Доставка');
            Xml::safeAddChild(
                $delivery,
                'Наименование',
                $order->delivery_type == ShopOrderDeliveryType::DELIVERY->value ? 'Доставка' : 'Самовывоз'
            );
            if ($order->delivery_type == ShopOrderDeliveryType::DELIVERY->value) {
                Xml::safeAddChild($delivery, 'Адрес', $order->delivery_extra['address'] ?? '');
                Xml::safeAddChild($delivery, 'Подъезд', $order->delivery_extra['entrance'] ?? '');
                Xml::safeAddChild($delivery, 'Этаж', $order->delivery_extra['floor'] ?? '');
                Xml::safeAddChild($delivery, 'Квартира', $order->delivery_extra['apartment'] ?? '');
                Xml::safeAddChild($delivery, 'Комментарий', $order->delivery_extra['comment'] ?? '');
            }

            $products = $doc->addChild('Товары');
            foreach ($order->items as $item) {
                $product = $products->addChild('Товар');
                Xml::safeAddChild($product, 'Ид', $item->external_id);
                Xml::safeAddChild($product, 'Наименование', $item->title);
                Xml::safeAddChild($product, 'Цена', $item->price);
                Xml::safeAddChild($product, 'Количество', $item->quantity);
                Xml::safeAddChild($product, 'ЕдиницаИзмерения', self::orderItemUnitLabel($item->sale_unit ?? null));
                Xml::safeAddChild($product, 'Сумма', $item->total);
            }
        }

        $dom               = dom_import_simplexml($xml)->ownerDocument;
        $dom->formatOutput = true;
        return $dom->saveXML();
    }

    protected static function orderItemUnitLabel(?string $saleUnit): string
    {
        return $saleUnit === 'pack' ? 'упак' : 'шт';
    }

    protected static function decodeExchangePassword(?string $passwordHash): string
    {
        if (!$passwordHash) {
            return '';
        }

        $decoded = base64_decode(strrev($passwordHash), true);

        return $decoded !== false ? $decoded : '';
    }
}
