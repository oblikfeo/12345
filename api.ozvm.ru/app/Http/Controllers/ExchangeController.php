<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessExchange;
use App\Services\ExchangeService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ExchangeController extends Controller
{
    public function __invoke(Request $request)
    {
        if($request->getContent()) {
            // Каждому архиву своя папка вне public: сервис после разбора удаляет её целиком.
            $directory = storage_path('app/exchange/' . date('Ymd_His') . '_' . Str::random(6));
            File::makeDirectory($directory, recursive: true);

            $zip = $directory . '/exchange.zip';
            file_put_contents($zip, $request->getContent());

            // Копия последнего архива от 1С — для разбора, что именно пришло.
            // Лежит вне public, наружу не отдаётся. Архив с товарами храним
            // отдельно: служебные обмены (заказы) приходят чаще и затирали бы его.
            @copy($zip, storage_path('app/exchange-last.zip'));
            $archive = new \ZipArchive();
            if ($archive->open($zip) === true) {
                for ($i = 0; $i < $archive->numFiles; $i++) {
                    if (str_starts_with((string) $archive->getNameIndex($i), 'goods/')) {
                        @copy($zip, storage_path('app/exchange-last-goods.zip'));
                        break;
                    }
                }
                $archive->close();
            }

            if (config('shop.exchange_async')) {
                ProcessExchange::dispatch($zip);
            } else {
                ExchangeService::run($zip);
            }
        } else {
            Log::info([
                $request->all()
            ]);
        }

        return response()->json(['success' => time()]);
    }

    public function orders(Request $request)
    {
        return ExchangeService::exportOrders($request);
    }

    public function users(Request $request)
    {
        return ExchangeService::exportUsers($request);
    }
}