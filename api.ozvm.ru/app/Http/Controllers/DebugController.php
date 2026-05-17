<?php

namespace App\Http\Controllers;

use App\Mail\OrderMail;
use App\Mail\RegistrationRequestMail;
use App\Mail\RegistrationUserMail;
use App\Models\Shop\ShopOrder;
use App\Models\Shop\ShopProduct;
use App\Models\User;
use App\Services\ExchangeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use function Termwind\render;

class DebugController extends Controller
{
    public function __invoke(Request $request)
    {
        return (new RegistrationUserMail())->render();

        //$zip = storage_path('app/public/exchange_1741596164/exchange.zip');
        //$zip = storage_path('app/public/exchange_1741592708/exchange.zip');
        //$zip = storage_path('app/public/exchange.zip');

        //$exchange = new ExchangeService($zip);
        //$exchange->import();
    }
}