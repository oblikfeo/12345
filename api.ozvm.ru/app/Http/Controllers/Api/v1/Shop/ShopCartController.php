<?php

namespace App\Http\Controllers\Api\v1\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\ShopProduct;
use App\Services\ShopProductService;
use Gloudemans\Shoppingcart\Facades\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShopCartController extends Controller
{
    public function __invoke(Request $r)
    {
        $identifier = $r->user()?->id;
        if ($identifier) {
            Cart::restore((string)$identifier);
        }

        return response()->json($this->dto());
    }

    private function dto()
    {
        $items = Cart::content();

        $totalQty = 0;
        $total = 0;

        $ids = $items->map(function ($item) {
            return $item->id;
        });
        $products = ShopProductService::getList(collect(['ids' => $ids, 'limit' => 1000]))->keyBy('id');

        $transformed = $items->filter(function ($item) use ($products) {
            return $products->get($item->id);
        })->map(function ($item) use (&$total, &$totalQty, $products) {
            $product = $products->get($item->id);

            $price = $product ? (float)$product->price : (float)$item->price;
            $subtotal = $price * $item->qty;

            $total += $subtotal;
            $totalQty += $item->qty;
            return [
                'rowId'     => $item->rowId,
                'productId' => (int)$item->id,
                'name'      => $item->name,
                'price'     => $price,
                'qty'       => (int)$item->qty,
                'subtotal'  => $subtotal,
                'options'   => $item->options,
            ];
        });

        return [
            'items'      => $transformed->values(),
            'quantity'   => $totalQty,
            'totalPrice' => $total,
        ];
    }

    public function add(Request $r)
    {
        $data = $r->validate([
            'product_id' => 'required|integer',
            'name'       => 'required|string',
            'price'      => 'required|numeric',
            'qty'        => 'nullable|integer|min:1',
            'options'    => 'array'
        ]);

        $identifier = $r->user()?->id;
        Cart::restore((string)$identifier);

        $productId = $data['product_id'];
        $qty = $data['qty'] ?? 1;
        $options = $data['options'] ?? [];

        $existing = Cart::content()->first(function ($item) use ($productId, $options) {
            return $item->id == $productId && $item->options == collect($options);
        });

        if ($existing) {
            Cart::update($existing->rowId, $existing->qty + $qty);
        } else {
            Cart::add($productId, $data['name'], $qty, $data['price'], 0, $options);
        }

        Cart::store((string)$identifier);

        return response()->json($this->dto());
    }

    public function decrement(Request $r, string $rowId)
    {
        $identifier = $r->user()?->id;
        Cart::restore((string)$identifier);

        $item = Cart::content()->first(function ($item) use ($rowId) {
            return $item->id == $rowId;
        });

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        if ($item->qty > 1) {
            Cart::update($item->rowId, $item->qty - 1);
        } else {
            Cart::remove($item->rowId);
        }

        Cart::store((string)$identifier);

        return response()->json($this->dto());
    }

    public function remove(Request $r, string $rowId)
    {
        $identifier = $r->user()?->id;
        Cart::restore((string)$identifier);
        $item = Cart::content()->first(function ($item) use ($rowId) {
            return $item->id == $rowId;
        });

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        Cart::remove($item->rowId);

        Cart::store((string)$identifier);

        return response()->json($this->dto());
    }

    public function qty(Request $r, string $rowId)
    {
        $identifier = $r->user()?->id;
        Cart::restore((string)$identifier);

        $data = $r->validate([
            'qty'        => 'required|integer|min:0',
            'product_id' => 'nullable|integer',
            'name'       => 'nullable|string',
            'price'      => 'nullable|numeric',
        ]);
        $qty = $data['qty'];

        $item = Cart::content()->first(function ($item) use ($rowId) {
            return $item->id == $rowId;
        });

        if (!$item) {
            if ($qty <= 0) {
                Cart::store((string)$identifier);
                return response()->json($this->dto());
            }
            $productId = isset($data['product_id']) ? (int) $data['product_id'] : (int) $rowId;
            $name = $data['name'] ?? null;
            $price = $data['price'] ?? null;
            if ($name === null || $name === '' || $price === null) {
                return response()->json(['error' => 'Item not in cart'], 404);
            }
            Cart::add($productId, $name, $qty, (float) $price, 0, []);
        } elseif ($qty <= 0) {
            Cart::remove($item->rowId);
        } else {
            Cart::update($item->rowId, $qty);
        }

        Cart::store((string)$identifier);

        return response()->json($this->dto());
    }

    public function clear(Request $r)
    {
        $identifier = $r->user()?->id;
        Cart::restore((string)$identifier);
        Cart::destroy();
        Cart::store((string)$identifier);
        return response()->json($this->dto());
    }
}
