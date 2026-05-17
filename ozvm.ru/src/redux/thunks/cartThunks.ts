import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/api/__API__';
import { enforceCartLineStack } from '@/redux/cartLineActions';
import type { RootState } from '@/redux/store';
import type { Product } from '@/redux/slices/types';

/** не давать браузеру/CDN вернуть старую корзину после PATCH */
const noCacheConfig = (): Pick<AxiosRequestConfig, 'params' | 'headers'> => ({
    params: { _t: Date.now() },
    headers: {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache',
    },
});

/** Laravel: resource / обёртка data / camelCase vs snake_case */
function extractApiRecord(raw: unknown): Record<string, unknown> {
    if (raw == null || typeof raw !== 'object') return {};
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.items)) return o;
    const inner = o.data;
    if (inner != null && typeof inner === 'object') {
        const d = inner as Record<string, unknown>;
        if (Array.isArray(d.items)) return d;
    }
    return o;
}

function toQtyNumber(v: unknown): number | undefined {
    if (v == null || v === '') return undefined;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function cartLineProductId(item: Record<string, unknown>): number | undefined {
    const nested = item.product;
    const candidates = [
        item.productId,
        item.product_id,
        item.shop_product_id,
        item.shopProductId,
        nested != null && typeof nested === 'object'
            ? (nested as Record<string, unknown>).id
            : undefined,
    ];
    for (const c of candidates) {
        const n = toQtyNumber(c);
        if (n !== undefined) return n;
    }
    return undefined;
}

function cartLineQty(item: Record<string, unknown>): number {
    const direct =
        item.qty ??
        item.quantity ??
        item.count ??
        item.stack ??
        item.amount ??
        item.units;

    let n = toQtyNumber(direct);
    if (n !== undefined && n >= 0) return n;

    const pivot = item.pivot;
    if (pivot != null && typeof pivot === 'object' && !Array.isArray(pivot)) {
        const pv = pivot as Record<string, unknown>;
        n = toQtyNumber(
            pv.qty ?? pv.quantity ?? pv.count ?? pv.stack ?? pv.amount
        );
        if (n !== undefined && n >= 0) return n;
    }

    const nestedProduct = item.product;
    if (
        nestedProduct != null &&
        typeof nestedProduct === 'object' &&
        !Array.isArray(nestedProduct)
    ) {
        const pr = nestedProduct as Record<string, unknown>;
        n = toQtyNumber(pr.qty ?? pr.quantity ?? pr.min_quantity);
        if (n !== undefined && n >= 0) return n;
    }

    const qtyKey = /^(qty|quantity|count|amount|stack|units)$/i;
    for (const [k, v] of Object.entries(item)) {
        if (!qtyKey.test(k)) continue;
        n = toQtyNumber(v);
        if (n !== undefined && n >= 0) return n;
    }

    for (const v of Object.values(item)) {
        if (v == null || typeof v !== 'object' || Array.isArray(v)) continue;
        const sub = v as Record<string, unknown>;
        for (const [k, val] of Object.entries(sub)) {
            if (!qtyKey.test(k)) continue;
            n = toQtyNumber(val);
            if (n !== undefined && n >= 0) return n;
        }
    }

    return 1;
}

function cartTotalsFromRecord(
    cart: Record<string, unknown>,
    rawItems: unknown[]
): { totalPrice: number; quantity: number } {
    const tp = toQtyNumber(cart.totalPrice ?? cart.total_price);
    const pq = toQtyNumber(
        cart.quantity ??
            cart.total_quantity ??
            cart.items_count ??
            cart.itemsCount
    );
    const qtyFromLines = Array.isArray(rawItems)
        ? rawItems.reduce<number>((s, li) => {
              if (li != null && typeof li === 'object') {
                  return s + cartLineQty(li as Record<string, unknown>);
              }
              return s;
          }, 0)
        : 0;
    return {
        totalPrice: tp ?? 0,
        quantity: pq ?? qtyFromLines,
    };
}

export type LoadCartPayload = {
    totalPrice: number;
    quantity: number;
    products: Array<CartItemPayload>;
};

/** поля для merge в reducer (как минимум Product + stack) */
export type CartItemPayload = Product & {
    stack: number;
    rests?: number;
};

export const loadCartState = createAsyncThunk(
    'cart/loadCartState',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('USER_TOKEN');

            const bustCart = noCacheConfig();
            const cartRes = await axiosInstance.get<unknown>(
                '/api/v1/cart',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...bustCart.headers,
                    },
                    params: bustCart.params,
                }
            );

            const cartBody = extractApiRecord(cartRes.data);
            const rawItems = Array.isArray(cartBody.items) ? cartBody.items : [];

            const ids = rawItems
                .map((item) =>
                    item != null && typeof item === 'object'
                        ? cartLineProductId(item as Record<string, unknown>)
                        : undefined
                )
                .filter((id): id is number => id != null && !Number.isNaN(id));

            const uniqueIds = [...new Set(ids)].join(',');

            if (!uniqueIds) {
                const { totalPrice, quantity } = cartTotalsFromRecord(
                    cartBody,
                    rawItems
                );
                return {
                    totalPrice,
                    quantity,
                    products: [] as CartItemPayload[],
                } satisfies LoadCartPayload;
            }

            const bustProducts = noCacheConfig();
            const result = await axiosInstance.get(
                `/api/v1/shop/products?ids=${uniqueIds}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...bustProducts.headers,
                    },
                    params: bustProducts.params,
                }
            );

            const body = result.data as { data?: Product[] };
            const products = Array.isArray(body.data) ? body.data : [];

            const { totalPrice, quantity } = cartTotalsFromRecord(
                cartBody,
                rawItems
            );

            const productsMerged: CartItemPayload[] = products.map(
                (product: Product) => {
                    const cartItem = rawItems.find((line) => {
                        if (line == null || typeof line !== 'object')
                            return false;
                        const pid = cartLineProductId(
                            line as Record<string, unknown>
                        );
                        return (
                            pid !== undefined &&
                            Number(pid) === Number(product.id)
                        );
                    });
                    const stack = cartItem
                        ? cartLineQty(cartItem as Record<string, unknown>)
                        : 1;
                    return {
                        ...product,
                        stack,
                    };
                }
            );

            return {
                totalPrice,
                quantity,
                products: productsMerged,
            } satisfies LoadCartPayload;
        } catch (error) {
            console.error(error);
            return rejectWithValue(error);
        }
    }
);

export const addProductToCartThunk = createAsyncThunk(
    'cart/addProduct',
    async (product: Product, { dispatch }) => {
        const token = localStorage.getItem('USER_TOKEN');

        await axiosInstance.post(
            '/api/v1/cart/items',
            {
                product_id: product.id,
                price: product.price,
                name: product.title,
                qty: 1,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        await dispatch(loadCartState()).unwrap();
    }
);

interface QtyPayload {
    product: Product;
    qty: number;
}

export const qtyProductToCartThunk = createAsyncThunk(
    'cart/qtyProduct',
    async ({ product, qty }: QtyPayload, { dispatch }) => {
        const token = localStorage.getItem('USER_TOKEN');

        await axiosInstance.patch(
            `/api/v1/cart/items/${product.id}`,
            {
                product_id: product.id,
                price: product.price,
                name: product.title,
                qty: qty,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        await dispatch(loadCartState()).unwrap();
    }
);

export const removeProductFromCartThunk = createAsyncThunk(
    'cart/removeProduct',
    async (product: Product, { dispatch }) => {
        const token = localStorage.getItem('USER_TOKEN');

        await axiosInstance.delete(`/api/v1/cart/items/${product.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        await dispatch(loadCartState()).unwrap();
    }
);

export const decrementProductInCartThunk = createAsyncThunk(
    'cart/decrementProduct',
    async (product: Product, { dispatch, getState, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('USER_TOKEN');
            const st = getState() as RootState;
            const row = st.cart.items.find(
                (i) => Number(i.id) === Number(product.id)
            );
            const expectedStack = Math.max(0, row?.stack ?? 0);

            await axiosInstance.patch(
                `/api/v1/cart/items/${product.id}/decrement`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await dispatch(loadCartState()).unwrap();
            dispatch(
                enforceCartLineStack({
                    productId: Number(product.id),
                    stack: expectedStack,
                })
            );
        } catch (error) {
            console.error(error);
            return rejectWithValue(error);
        }
    }
);
