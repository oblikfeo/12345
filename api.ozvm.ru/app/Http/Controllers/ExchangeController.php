<?php

namespace App\Http\Controllers;

use App\Services\ExchangeService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ExchangeController extends Controller
{
    public function __invoke(Request $request)
    {
        if($request->getContent()) {
            $path = 'exchange_' . time();
            if (!file_exists(storage_path('app/public/' . $path))) {
                File::makeDirectory(storage_path('app/public/' . $path), recursive: true);
            }
            file_put_contents(storage_path('app/public/' . $path . '/exchange.zip'), $request->getContent());

            $zip = storage_path('app/public/' . $path . '/exchange.zip');

            $exchange = new ExchangeService($zip);
            $exchange->import();
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