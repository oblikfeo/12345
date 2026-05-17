import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { store } from '@/redux/store';
import type { RootState } from '@/redux/store';
import { useAppDispatch } from '@/redux/hook';
import type { Product } from '@/redux/slices/types';
import {
    addProductToCartThunk,
    qtyProductToCartThunk,
    removeProductFromCartThunk,
} from '@/redux/thunks/cartThunks';

const DEFAULT_DEBOUNCE_MS = 320;

function clampToStock(q: number, maxRests: number): number {
    const cap =
        Number.isFinite(maxRests) && maxRests >= 0 ? maxRests : 0;
    if (!Number.isFinite(q)) return 0;
    return Math.max(0, Math.min(q, cap));
}

/**
 * Счётчик: локально — сразу, на сервер — debounce + очередь запросов.
 * Пока пользователь меняет число, ответы Redux / loadCartState не перебивают экран.
 */
export function useStableCartQuantity(
    product: Product | null | undefined,
    stackFromStore: number,
    maxRests: number,
    debounceMs: number = DEFAULT_DEBOUNCE_MS
) {
    const dispatch = useAppDispatch();

    const clamp = useCallback(
        (q: number) => clampToStock(q, maxRests),
        [maxRests]
    );

    const [displayQty, setDisplayQty] = useState(() =>
        clamp(stackFromStore)
    );
    const targetRef = useRef(clamp(stackFromStore));
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chainRef = useRef<Promise<void>>(Promise.resolve());

    /** Уже было действие пользователя (± / ввод) — не затирать экран «отстающим» стором. */
    const userAdjustedRef = useRef(false);
    const lastProductIdRef = useRef<unknown>(product?.id);

    useEffect(() => {
        const id = product?.id;
        if (Number(id) !== Number(lastProductIdRef.current)) {
            lastProductIdRef.current = id;
            userAdjustedRef.current = false;
            const s = clamp(stackFromStore);
            targetRef.current = s;
            setDisplayQty(s);
            return;
        }

        if (timerRef.current != null) return;

        const s = clamp(stackFromStore);

        if (userAdjustedRef.current) {
            /* Не подменяем ввод пользователя устаревшим stack из Redux. */
            if (targetRef.current !== s) return;
            setDisplayQty(s);
            return;
        }

        targetRef.current = s;
        setDisplayQty(s);
    }, [stackFromStore, maxRests, clamp, product?.id]);

    const pumpDisplayFromStore = useCallback(() => {
        if (!product) return;
        const row = (store.getState() as RootState).cart.items.find(
            (i) => Number(i.id) === Number(product.id)
        );
        const s = clamp(row?.stack ?? 0);
        targetRef.current = s;
        setDisplayQty(s);
    }, [product, clamp]);

    const runCommit = useCallback(
        async (abs: number) => {
            if (!product) return;
            const q = clamp(abs);
            if (q === 0) {
                await dispatch(removeProductFromCartThunk(product)).unwrap();
                return;
            }
            const row = (store.getState() as RootState).cart.items.find(
                (i) => Number(i.id) === Number(product.id)
            );
            const serverStack = row?.stack ?? 0;
            if (serverStack === 0) {
                await dispatch(addProductToCartThunk(product)).unwrap();
                if (q > 1) {
                    await dispatch(
                        qtyProductToCartThunk({ product, qty: q })
                    ).unwrap();
                }
            } else {
                await dispatch(
                    qtyProductToCartThunk({ product, qty: q })
                ).unwrap();
            }
        },
        [dispatch, product, clamp]
    );

    const scheduleCommit = useCallback(() => {
        if (!product) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            const committedSnapshot = targetRef.current;
            chainRef.current = chainRef.current
                .then(() => runCommit(committedSnapshot))
                .then(() => {
                    /* Если за время запроса пользователь снова нажал ± — стор не трогаем. */
                    if (targetRef.current !== committedSnapshot) return;
                    pumpDisplayFromStore();
                })
                .catch((e) => {
                    console.error(e);
                    if (targetRef.current !== committedSnapshot) return;
                    pumpDisplayFromStore();
                });
        }, debounceMs);
    }, [debounceMs, product, runCommit, pumpDisplayFromStore]);

    const bumpBy = useCallback(
        (delta: number) => {
            if (!product) return;
            userAdjustedRef.current = true;
            const next = clamp(targetRef.current + delta);
            targetRef.current = next;
            setDisplayQty(next);
            scheduleCommit();
        },
        [product, clamp, scheduleCommit]
    );

    const setAbsolute = useCallback(
        (raw: number) => {
            if (!product) return;
            userAdjustedRef.current = true;
            const next = clamp(raw);
            targetRef.current = next;
            setDisplayQty(next);
            scheduleCommit();
        },
        [product, clamp, scheduleCommit]
    );

    const flushNow = useCallback(() => {
        if (!product) return;
        userAdjustedRef.current = true;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        const committedSnapshot = targetRef.current;
        chainRef.current = chainRef.current
            .then(() => runCommit(committedSnapshot))
            .then(() => {
                if (targetRef.current !== committedSnapshot) return;
                pumpDisplayFromStore();
            })
            .catch((e) => {
                console.error(e);
                if (targetRef.current !== committedSnapshot) return;
                pumpDisplayFromStore();
            });
    }, [product, runCommit, pumpDisplayFromStore]);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        []
    );

    return {
        displayQty,
        bumpBy,
        setAbsolute,
        flushNow,
        displayStr: String(displayQty),
    };
}
