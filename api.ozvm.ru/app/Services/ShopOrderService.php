<?php

namespace App\Services;

use App\Enums\ShopOrderDeliveryType;
use App\Mail\OrderMail;
use App\Models\Shop\ShopOrder;
use App\Models\Shop\ShopOrderItem;
use App\Models\Shop\ShopProduct;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ShopOrderService
{
    public static function checkout(Request $request)
    {
        $request->validate([
            'delivery.type'   => ['required', Rule::enum(ShopOrderDeliveryType::class)],
            'recipient.name'  => ['required'],
            'recipient.phone' => ['required'],
            /*'cart'            => ['required', 'array'],
            'cart.*.id'       => ['required'],
            'cart.*.qty'      => ['required'],*/
            ...($request->input('delivery.type') !== 'pickup' ? [
                'delivery.address' => ['required']
            ] : []
            )
        ]);

        $cartError    = [];
        $cartProducts = [];

        //$cart         = $request->get('cart', []);
        $identifier = $request->user()?->id;
        Cart::restore((string)$identifier);

        $cart = Cart::content();
        foreach ($cart as $i => $item) {
            $product = ShopProductService::find($item->id ?? 0);
            if (!$product) {
                //$cartError["cart.$i.id"] = "Заказываемого товара не существует" . $item->id;
            } else {
                $availableQty = min((float)$item->qty, (float)$product->rests);

                if ($availableQty <= 0) {
                    continue;
                }

                $cartProducts[$item->id] = [
                    'product' => $product,
                    'qty'     => $availableQty,
                ];
            }
        }
        if ($cartError) {
            throw ValidationException::withMessages($cartError);
        }

        if (!$cartProducts) {
            throw ValidationException::withMessages([
                'cart' => 'В корзине нет товаров для оформления с учетом актуальных остатков',
            ]);
        }

        $type = $request->input('delivery.type', 'delivery');

        $order = [
            'external_id'    => Str::uuid(),
            'delivery_type'  => $type,
            'user_id'        => $request->user()?->id,
            'customer_extra' => [
                'recipient' => [
                    'name'  => $request->input('recipient.name', ''),
                    'phone' => $request->input('recipient.phone', '')
                ]
            ],
        ];
        if ($type == 'delivery') {
            $order['delivery_extra'] = [
                'address'   => $request->input('delivery.address', ''),
                'entrance'  => $request->input('delivery.entrance', ''),
                'floor'     => $request->input('delivery.floor', ''),
                'apartment' => $request->input('delivery.apartment', ''),
                'comment'   => $request->input('delivery.comment', '')
            ];
        } else {
            $order['delivery_extra'] = [
                'comment'   => $request->input('delivery.comment', '')
            ];
        }
        $order = ShopOrder::query()->create($order);

        foreach ($cart as $item) {
            if(!isset($cartProducts[$item->id])) continue;

            $productData = $cartProducts[$item->id];
            $product = $productData['product'];
            $qty = $productData['qty'];

            ShopOrderItem::query()->create([
                'external_id'     => $product->external_id,
                'shop_order_id'   => $order->id,
                'shop_product_id' => $product->id,
                'title'           => $product->title,
                'image'           => $product->images ? $product->images[0] : null,
                'quantity'        => $qty,
                'price'           => $product->price,
                'total'           => $product->price * $qty
            ]);
        }
        $identifier = $request->user()?->id;
        Cart::restore((string)$identifier);
        Cart::destroy();
        Cart::store((string)$identifier);

        if ($request->user() && env('APP_ENV') !== 'local') {
            try {
                Mail::to($request->user()->email)->send(new OrderMail($order));
            } catch (\Throwable $e) {
                Log::error('Order mail send failed', [
                    'order_id'            => $order->id,
                    'order_external_id'   => $order->external_id ?? null,
                    'user_id'             => $request->user()->id,
                    'email_to'            => $request->user()->email,
                    'message'             => $e->getMessage(),
                    'file'                => $e->getFile(),
                    'line'                => $e->getLine(),
                ]);
            }
        }

        return [
            'uuid'    => $order->external_id
        ];
    }
}
