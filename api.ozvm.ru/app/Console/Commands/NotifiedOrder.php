<?php

namespace App\Console\Commands;

use App\Mail\OrderMail;
use App\Models\Shop\ShopOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotifiedOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notified-order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications for new orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        ShopOrder::query()
            ->whereNull('notified_at')
            ->whereBetween('created_at', [
                Carbon::now()->subDay(),
                Carbon::now()->subMinutes(20)
            ])
            ->chunk(100, function($orders) {
                foreach ($orders as $order) {
                    $email = $order->user->manager_email ?: env('ORDER_NOTIFIED', '');
                    Log::info('Order notified ' . $order->id, ['email' => $email]);
                    try {
                        Mail::to($email)->send(new OrderMail($order));
                        $order->notified_at = Carbon::now();
                        $order->save();
                    } catch (\Exception $e) {
                        Log::error('Order notified error: ' . $e->getMessage(), ['order_id' => $order->id]);
                    }
                }
            });
    }
}
