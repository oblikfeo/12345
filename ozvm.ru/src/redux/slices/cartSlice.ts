import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { enforceCartLineStack } from '@/redux/cartLineActions';
import {
    loadCartState,
    qtyProductToCartThunk,
    type CartItemPayload,
} from "@/redux/thunks/cartThunks";

type CartItem = CartItemPayload;

export type AppState = {
    cart: CartState;
};

export interface CartState {
    items: CartItem[];
    quantity: number;
    totalPrice: number;
    loading: boolean;
}

const initialState: CartState = {
    items: [],
    quantity: 0,
    totalPrice: 0,
    loading: false
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(loadCartState.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadCartState.fulfilled, (state, action) => {
                state.totalPrice = action.payload.totalPrice;
                state.quantity = action.payload.quantity;
                state.items = action.payload.products;
                state.loading = false;
            })
            .addCase(loadCartState.rejected, (state) => {
                state.loading = false;
            })
            /* Optimistic pending убран: счётчики на фронте ведут локальный display + debounce,
             * иначе гонка с loadCartState даёт прыгающие цифры. */
            /* После PATCH qty → loadCartState может вернуть неверный stack (другой JSON).
             * fulfilled сабтха выполняется последним и фиксирует то кол-во, что ушло на API. */
            .addCase(qtyProductToCartThunk.fulfilled, (state, action) => {
                const { product, qty } = action.meta.arg;
                const idx = state.items.findIndex(
                    (i) => Number(i.id) === Number(product.id)
                );
                if (idx === -1) return;
                const clamped = Math.max(0, qty);
                state.items[idx] = { ...state.items[idx], stack: clamped };
                state.quantity = state.items.reduce((s, i) => s + i.stack, 0);
                state.totalPrice = state.items.reduce(
                    (s, i) => s + (Number(i.price) || 0) * i.stack,
                    0
                );
            })
            .addCase(enforceCartLineStack, (state, action) => {
                const { productId, stack } = action.payload;
                const idx = state.items.findIndex(
                    (i) => Number(i.id) === Number(productId)
                );
                if (idx === -1) return;
                if (stack <= 0) {
                    state.items.splice(idx, 1);
                } else {
                    state.items[idx] = { ...state.items[idx], stack };
                }
                state.quantity = state.items.reduce((s, i) => s + i.stack, 0);
                state.totalPrice = state.items.reduce(
                    (s, i) => s + (Number(i.price) || 0) * i.stack,
                    0
                );
            });
    },
    reducers: {
        setCart(state, action: PayloadAction<CartState>) {
            return action.payload;
        },
    },
});

export const { setCart } = cartSlice.actions;

export default cartSlice.reducer;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectTotalQuantity = (state: RootState) => state.cart.quantity;
export const selectTotalAmount = (state: RootState) => state.cart.totalPrice;