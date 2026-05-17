import { createAction } from '@reduxjs/toolkit';

/** После decrement + loadCartState снова правим stack (тот же баг парсера, что и у qty). */
export const enforceCartLineStack = createAction<{
    productId: number;
    stack: number;
}>('cart/enforceLineStack');
