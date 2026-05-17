// components/basketPreview/CartItem.tsx
'use client'

import Image from 'next/image';
import img from '/img/haventlogo.png';
import styles from './basketPreview.module.css';
import { toaster } from '@/components/Toaster/toaster';
import { useAppDispatch } from '@/redux/hook';
import { removeProductFromCartThunk } from '@/redux/thunks/cartThunks';
import { useEffect, useRef, useState } from 'react';
import { useStableCartQuantity } from '@/hooks/useStableCartQuantity';

const minus = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="20" fill="#ECF5FF" />
        <rect x="5" y="9" width="10" height="2" fill="#264794" />
    </svg>
);

const plus = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="20" fill="#ECF5FF" />
        <path fillRule="evenodd" clipRule="evenodd" d="M9 11V15H11V11H15V9H11V5H9V9H5V11H9Z" fill="#264794" />
    </svg>
);

export default function CartItem({ item, productList }) {
    const dispatch = useAppDispatch();
    const inputRef = useRef(null);

    const productData = productList.find(
        (elem) => Number(elem?.id) === Number(item?.id)
    );
    const rList = Number(productData?.rests);
    const rCart = Number(item?.rests);
    const maxQty = (() => {
        if (Number.isFinite(rList) && rList >= 0) return rList;
        if (Number.isFinite(rCart) && rCart >= 0) return rCart;
        return Number.POSITIVE_INFINITY;
    })();
    const currentQty = Number(item?.stack) || 0;

    const cap =
        maxQty === Number.POSITIVE_INFINITY
            ? Number.MAX_SAFE_INTEGER
            : maxQty;

    const { displayQty, bumpBy, setAbsolute, flushNow, displayStr } =
        useStableCartQuantity(item, currentQty, cap);

    const [inputText, setInputText] = useState(displayStr);
    const inputFocusedRef = useRef(false);

    useEffect(() => {
        if (!inputFocusedRef.current) {
            setInputText(displayStr);
        }
    }, [displayStr]);

    const clampQty = (qty: number) => {
        if (!Number.isFinite(qty)) return 0;
        return Math.max(0, Math.min(qty, cap));
    };

    const handleInputFocus = (e) => {
        inputFocusedRef.current = true;
        e.target.select();
    };

    const handleIncrementQty = () => {
        if (maxQty === 0) {
            toaster.create({
                title: 'Ошибка',
                description: 'Товар отсутствует на складе',
                type: 'error',
                duration: 3000,
            });
            return;
        }
        if (
            maxQty !== Number.POSITIVE_INFINITY &&
            displayQty >= maxQty
        ) {
            toaster.create({
                title: 'Ошибка',
                description: 'Количество единиц товара превышает остаток на складе',
                type: 'error',
                duration: 3000,
            });
            return;
        }
        bumpBy(1);
    };

    return (
        <div className={styles.card}>
            <div className={styles.leftCard}>
                <Image
                    className={styles.cardImg}
                    src={item.images[0] || img}
                    alt=""
                    width={80}
                    height={80}
                />
                <div className={styles.description}>{item.title}</div>
            </div>
            <div className={styles.counter}>
                <div className={styles.quantityControls}>
                    <button
                        onClick={() => {
                            if (maxQty === 0) {
                                toaster.create({
                                    title: 'Ошибка',
                                    description: 'Товар отсутствует на складе',
                                    type: 'error',
                                    duration: 3000,
                                });
                                return;
                            }
                            bumpBy(-1);
                        }}
                        className={styles.quantityButton}
                        aria-label="Уменьшить количество"
                    >
                        {minus}
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        value={inputText}
                        onFocus={handleInputFocus}
                        onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                                setInputText('');
                                return;
                            }
                            const next = clampQty(parseInt(raw, 10));
                            setInputText(String(next));
                            setAbsolute(next);
                        }}
                        onBlur={() => {
                            inputFocusedRef.current = false;
                            const parsed =
                                inputText === ''
                                    ? currentQty
                                    : parseInt(inputText, 10);
                            const next = clampQty(
                                Number.isFinite(parsed) ? parsed : currentQty
                            );
                            setInputText(String(next));
                            setAbsolute(next);
                            flushNow();
                        }}
                        className={styles.quantityInput}
                        aria-label="Количество товара"
                    />

                    <button
                        onClick={handleIncrementQty}
                        className={styles.quantityButton}
                        aria-label="Увеличить количество"
                    >
                        {plus}
                    </button>
                </div>
            </div>
            <div className={styles.flex}>
                <div className={styles.price}>
                    <div className={styles.mainPrice}>{item.price * displayQty} ₽</div>
                    <div className={styles.allPrice}>{item.price} ₽ x 1</div>
                    <div className={styles.subPrice}>нету ₽</div>
                </div>
                <div
                    onClick={() => dispatch(removeProductFromCartThunk(item))}
                    className={styles.buy}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.610985 2.70239V4.1123H2.08013L3.24563 17.3569C3.27759 17.7209 3.58239 18 3.94777 18H14.0285C14.3939 18 14.6989 17.7206 14.7306 17.3566L15.8961 4.1123H17.389V2.70239H0.610985ZM13.3828 16.5901H4.59331L3.49545 4.1123H14.4809L13.3828 16.5901Z"
                            fill="#C51A1A"
                        />
                        <path
                            d="M11.3033 0H6.6976C6.04974 0 5.52268 0.527062 5.52268 1.17492V3.40731H6.93258V1.40991H11.0684V3.40731H12.4783V1.17492C12.4783 0.527062 11.9512 0 11.3033 0Z"
                            fill="#C51A1A"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
