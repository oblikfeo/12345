<?php

namespace App\Services;

use App\Classes\Xml;
use App\Enums\ShopOrderDeliveryType;
use App\Models\Shop\ShopCategory;
use App\Models\Shop\ShopOrder;
use App\Models\Shop\ShopPriceType;
use App\Models\Shop\ShopProduct;
use App\Models\Shop\ShopProductPrice;
use App\Models\Shop\ShopRest;
use App\Models\Shop\ShopStorage;
use App\Models\Shop\ShopUnit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
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
    protected array $restsProductIDs = [];

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
        $this->importUnits();
        $this->importPriceTypes();
        $this->importStorages();
        $this->importGroups();
        $this->importGoods();
        $this->importRests();
        $this->importPrices();
        $this->importUsers();
        $this->importOrders();
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

    protected function storePrice($price)
    {
        $product = ShopProduct::query()->where('external_id', $price['Ид'])->first();
        if ($product) {
            $list = isset($price['Цены']['Цена']['ЦенаЗаЕдиницу']) ? [$price['Цены']['Цена']] : $price['Цены']['Цена'];

            $exist = [];
            foreach ($list as $item) {
                $type = $this->priceTypeByKeys[$item['ИдТипаЦены']];

                $price = ShopProductPrice::query()->updateOrCreate(
                    [
                        'shop_product_id' => $product->id,
                        'priceable_type'  => ShopPriceType::class,
                        'priceable_id'    => $type
                    ], [
                        'value' => (float)$item['ЦенаЗаЕдиницу']
                    ]
                );

                $exist[] = $price->id;
            }
            ShopProductPrice::query()
                ->where('shop_product_id', $product->id)
                ->whereNotIn('id', $exist)
                ->delete();
        }
    }

    protected function importUsers()
    {
        if ($this->users) {
            foreach ($this->users as $xml) {
                $users = $xml['Контрагенты']['Контрагент'];

                foreach ($users as $user) {
                    $this->storeUser($user);
                }
            }
        }
    }

    public function storeUser($user)
    {
        try {
            if (is_array($user) && $user['Почта']) {
                $user = User::query()->updateOrCreate(
                    [
                        'external_id' => $user['Ид']
                    ],
                    [
                        'min_order_amount'  => (float)$user['МинимальнаяСуммаЗаказа'],
                        'external_price_id' => (string)$user['ВидЦенИд'],
                        'external_stock_id' => (string)$user['Склад'] ?? null,
                        'name'              => (string)$user['Наименование'],
                        'manager_name'      => (string)$user['Менеджер'] ?? null,
                        'manager_email'     => (string)$user['ПочтаМенеджера'] ?? null,
                        'phone'             => (string)$user['Телефон'],
                        'email'             => (string)$user['Почта'],
                        'password'          => Hash::make((string)$user['Пароль']),
                        'password_hash'     => strrev(base64_encode((string)$user['Пароль']))
                    ]
                );
            } elseif (!is_array($user)) {
                // todo maybelog
            }
        } catch (\Exception $exception) {
        }
    }

    protected function importPrices()
    {
        if ($this->prices) {
            foreach ($this->prices as $xml) {
                $prices = $xml['ПакетПредложений']['Предложения']['Предложение'];

                foreach ($prices as $price) {
                    $this->storePrice($price);
                }
            }
        }
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

    protected function storeRest($rest)
    {
        $product = ShopProduct::query()->where('external_id', $rest['Ид'])->first();
        if ($product) {
            $storages = isset($rest['Остатки']['Остаток']['Склад']) ? [$rest['Остатки']['Остаток']['Склад']] : $rest['Остатки']['Остаток'];

            $rests = [];
            foreach ($storages as $storage) {
                if(isset($storage['Склад'])) {
                    $storage = $storage['Склад'];
                }

                if(!isset($storage['Ид'])) continue;

                if(!isset($this->storageByKeys[$storage['Ид']])) {
                    $storageModel = ShopStorage::query()->where('external_id', $storage['Ид'])->first();
                    if($storageModel) {
                        $this->storageByKeys[$storage['Ид']] = $storageModel->id;
                    }
                }

                if (isset($this->storageByKeys[$storage['Ид']])) {
                    $quantity = (float)$storage['Количество'];
                    $rests[$this->storageByKeys[$storage['Ид']]] = ['value' => max(0, $quantity)];
                }
            }
            $product->rests()->sync($rests);
            $this->restsProductIDs[] = $product->id;
        }
    }

    protected function importRests()
    {
        if ($this->rests) {
            DB::transaction(function () {
                foreach ($this->rests as $xml) {
                    $rests = $xml['ПакетПредложений']['Предложения']['Предложение'];
                    foreach ($rests as $rest) {
                        $this->storeRest($rest);
                    }
                }
                ShopRest::query()->whereNotIn('shop_product_id', $this->restsProductIDs)->delete();
            }, 2);
        }
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

            $product = ShopProduct::query()->updateOrCreate(
                [
                    'external_id' => $good['Ид']
                ],
                [
                    'title'        => trim($good['Наименование']),
                    'shop_unit_id' => $unit,
                    'text'         => $good['Описание'] ?: null,
                    'images'       => $images,
                ]
            );

            if(isset($good['Группы']['Ид']) && is_array($good['Группы']['Ид'])) {
                $groups = array_map(fn($item) => $item, $good['Группы']['Ид']);
            } else {
                $groups = isset($good['Группы']['Ид']) ? [$good['Группы']['Ид']] : array_map(fn($item) => $item['Ид'], $good['Группы']);
            }
            $ids    = array_filter(array_map(fn($externalID) => $this->groupByKeys[$externalID] ?? null, $groups));

            $product->categories()->sync($ids);

            try {
                $props = [];
                if ($good['Страна'] ?? false) {
                    $props[1] = ['value' => $good['Страна']];
                }
                if ($good['Изготовитель'] ?? false) {
                    $props[2] = ['value' => $good['Изготовитель']['ОфициальноеНаименование']];
                }
                $product->props()->sync($props);
            } catch (\Exception $exception) {
                Log::error($exception);
            }
            $this->goodsIDs[] = $product->id;
        }
    }

    protected function removeGoods()
    {
        ShopProduct::query()
            ->whereNotIn('id', $this->goodsIDs)
            ->select('id')
            ->chunkById(500, function ($products) {
                // Bulk delete skips model events, so remove products from the search index explicitly first.
                $products->unsearchable();

                ShopProduct::query()->whereIn('id', $products->pluck('id'))->delete();
            });
    }

    protected function importGoods()
    {
        if ($this->goods) {
            foreach ($this->goods as $xml) {
                $base  = $xml['Каталог'];
                $goods = isset($base['Товары']['Товар']['Ид']) ? [$base['Товары']['Товар']] : $base['Товары']['Товар'];

                foreach ($goods as $good) {
                    $this->storeGood($good);
                }
            }
            $this->removeGoods();
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
            $doc->addChild('Ид', $user->external_id);
            $doc->addChild('Наименование', $user->name);
            $doc->addChild('Пароль', base64_decode(strrev($user->password_hash)));
            $doc->addChild('Телефон', $user->phone);
            $doc->addChild('Почта', $user->email);
        }

        $dom               = dom_import_simplexml($xml)->ownerDocument;
        $dom->formatOutput = true;
        $xml               = $dom->saveXML();

        return response($xml)->header('Content-type', 'text/xml');
    }

    public static function exportOrders(Request $request)
    {
        $xml = new Xml('<?xml version="1.0" encoding="UTF-8"?><КоммерческаяИнформация/>');
        $xml->addAttribute('ДатаФормирования', date('Y-m-d\\TH:i:s', strtotime('now')));
        $xml->addAttribute('ВерсияСхемы', '2.04');

        if ($request->get('from')) {
            $orders = ShopOrder::query()->where('created_at', '>', Carbon::parse($request->get('from')))->get();
        } else {
            $orders = ShopOrder::query()->orderBy('id', 'desc')->limit(20)->get();
        }

        $docs = $xml->addChild('Документы');
        foreach ($orders as $order) {
            $doc = $docs->addChild('Документ');
            $doc->addChild('Ид', $order->external_id);
            $doc->addChild('Номер', $order->id);
            $doc->addChild('Дата', $order->created_at->format('Y-m-d'));
            $doc->addChild('Время', $order->created_at->format('H:i:s'));

            $user = $doc->addChild('Контрагент');
            if ($order->user) {
                $user->addChild('Ид', $order->user->external_id);
                $user->addChild('Наименование', $order->user->name);
                $user->addChild('Телефон', $order->user->phone);
                $user->addChild('Адрес', $order->user->address);
                $user->addChild('Почта', $order->user->email);
                $user->addChild('Пароль', base64_decode(strrev($order->user->password_hash)));
            }
            $recipient = $doc->addChild('Получатель');
            $recipient->addChild('Наименование', $order->customer_extra['recipient']['name'] ?? '');
            $recipient->addChild('Телефон', $order->customer_extra['recipient']['phone'] ?? '');

            $delivery = $doc->addChild('Доставка');
            $delivery->addChild('Наименование', $order->delivery_type == ShopOrderDeliveryType::DELIVERY->value ? 'Доставка' : 'Самовывоз');
            if ($order->delivery_type == ShopOrderDeliveryType::DELIVERY->value) {
                $delivery->addChild('Адрес', $order->delivery_extra['address'] ?? '');
                $delivery->addChild('Подъезд', $order->delivery_extra['entrance'] ?? '');
                $delivery->addChild('Этаж', $order->delivery_extra['floor'] ?? '');
                $delivery->addChild('Квартира', $order->delivery_extra['apartment'] ?? '');
                $delivery->addChild('Комментарий', $order->delivery_extra['comment'] ?? '');
            }

            $products = $doc->addChild('Товары');
            foreach ($order->items as $item) {
                $product = $products->addChild('Товар');
                $product->addChild('Ид', $item->external_id);
                $product->addChild('Наименование', $item->title);
                $product->addChild('Цена', $item->price);
                $product->addChild('Количество', $item->quantity);
                $product->addChild('Сумма', $item->total);
            }
        }

        $dom               = dom_import_simplexml($xml)->ownerDocument;
        $dom->formatOutput = true;
        $xml               = $dom->saveXML();

        return response($xml)->header('Content-type', 'text/xml');
    }
}
