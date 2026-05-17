import styles from './squareCard.module.css'
import Image from 'next/image';
import img from '/img/newHaventLogo.svg'
import { Toaster, toaster } from "@/components/Toaster/toaster"
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import NoProducts from '../noProducts/noProducts'
import { useStableCartQuantity } from '@/hooks/useStableCartQuantity';

function SquareCatalogCard({ item, catalogParams }) {
    const stackInCart = useSelector((s) => {
        const row = s.cart.items.find((i) => Number(i.id) === Number(item.id));
        return row?.stack ?? 0;
    });

    const { displayQty, bumpBy, setAbsolute, flushNow, displayStr } = useStableCartQuantity(
        item,
        stackInCart,
        item.rests ?? 0
    );

    const [inputText, setInputText] = useState(displayStr);
    const inputFocusedRef = useRef(false);

    useEffect(() => {
        if (!inputFocusedRef.current) {
            setInputText(displayStr);
        }
    }, [displayStr]);

    const maxRests = item.rests ?? 0;

    const clampLocal = (q) => {
        const max = Number.isFinite(maxRests) ? maxRests : 0;
        const safe = Number.isFinite(q) ? q : 0;
        return Math.max(0, Math.min(safe, max));
    };

    const showCounter = displayQty > 0;

    return (
        <div className={styles.cart}>
            <div className={styles.productImg}>
                <Link href={{
                    pathname: `/catalog/${item.slug}`,
                    query: {
                        ...catalogParams,
                        id: item.id
                    }
                }}>
                    <Image className={styles.link} src={item.images[0] ?? img} alt='' width={200} height={200} />
                </Link>
            </div>
            <div className={styles.price}>
                <div className={styles.priceArea}>
                    <div className={styles.mainPrice}>{item.price} ₽ </div>
                    <div className={styles.subPrice}>нету</div>
                </div>
                <div className={item.rests > 0 ? styles.have : styles.havent}>{item.rests === 0 ? 'Нет в наличии' : `В наличии ${item.rests} шт`}</div>
            </div>
            <div className={styles.discription}>
                <Link href={{
                    pathname: `/catalog/${item.slug}`,
                    query: {
                        ...catalogParams,
                        id: item.id
                    }
                }}>
                    {item.title.length > 55 ? item.title.slice(0, 55) + '...' : item.title}
                </Link>
            </div>
            {showCounter ?
                <div className={styles.counter}>
                    <div className={styles.quantityControls}>
                        <button
                            onClick={() => {
                                if (item.rests === 0) {
                                    toaster.create({
                                        title: "Ошибка",
                                        description: "Товар отсутствует на складе",
                                        type: "error",
                                        duration: 3000,
                                    })
                                } else {
                                    bumpBy(-1);
                                }
                            }}
                            className={styles.quantityButton}
                            aria-label="Уменьшить количество"
                        >
                            <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="20" height="20" fill="#ECF5FF" />
                                <rect x="5" y="9" width="10" height="2" fill="#264794" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            inputMode="numeric"
                            value={inputText}
                            onFocus={(e) => {
                                inputFocusedRef.current = true;
                                e.target.select();
                            }}
                            onChange={(e) => {
                                const raw = e.target.value;
                                const digits = raw.replace(/[^\d]/g, '');
                                if (digits === '') {
                                    setInputText('');
                                    return;
                                }
                                const next = clampLocal(parseInt(digits, 10));
                                setInputText(String(next));
                                setAbsolute(next);
                            }}
                            onBlur={() => {
                                inputFocusedRef.current = false;
                                const base =
                                    inputText === '' || inputText === undefined
                                        ? stackInCart
                                        : parseInt(inputText, 10);
                                const next = clampLocal(Number.isFinite(base) ? base : stackInCart);
                                setInputText(String(next));
                                setAbsolute(next);
                                flushNow();
                            }}
                            className={styles.quantityInput}
                            aria-label="Количество товара"
                        />

                        <button
                            onClick={() => {
                                if (item.rests === 0) {
                                    toaster.create({
                                        title: "Ошибка",
                                        description: "Товар отсутствует на складе",
                                        type: "error",
                                        duration: 3000,
                                    })
                                } else if (displayQty >= maxRests) {
                                    toaster.create({
                                        title: "Ошибка",
                                        description: "количество единиц товара превышает остаток на складе",
                                        type: "error",
                                        duration: 3000,
                                    })
                                } else {
                                    bumpBy(1);
                                }
                            }}
                            className={styles.quantityButton}
                            aria-label="Увеличить количество"
                        >
                            <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="20" height="20" fill="#ECF5FF" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M9 11V15H11V11H15V9H11V5H9V9H5V11H9Z" fill="#264794" />
                            </svg>
                        </button>
                    </div>
                </div> :
                <div onClick={() => {
                    if (item.rests === 0) {
                        toaster.create({
                            title: "Ошибка",
                            description: "Товар отсутствует на складе",
                            type: "error",
                            duration: 3000,
                        })
                    } else if (stackInCart >= item.rests) {
                        toaster.create({
                            title: "Ошибка",
                            description: "количество единиц товара превышает остаток на складе",
                            type: "error",
                            duration: 3000,
                        })
                    } else {
                        bumpBy(1);
                    }
                }}

                    className={styles.buttonArea}>
                    <button className={item.rests > 0 ? styles.add : styles.disableAdd}>
                        <span>Добавить в корзину</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.4286 6.57134H12.2893L9.97923 2.57134L9.97851 2.57348L8.65995 4.85773L9.64924 6.57131H6.35068L8.98931 2.00061C9.14145 1.73775 9.18217 1.42561 9.10431 1.13275C9.02574 0.839883 8.83431 0.590612 8.57145 0.439169C8.30859 0.287026 7.99717 0.24631 7.7043 0.324883C7.41144 0.403455 7.16144 0.594891 7.01001 0.857748L3.71145 6.57131H0.571422C0.419994 6.57131 0.274279 6.63131 0.167143 6.73845C0.0599992 6.84559 0 6.99131 0 7.14273V8.28559C0 8.43702 0.0599992 8.58273 0.167143 8.68987C0.274286 8.79701 0.419998 8.85701 0.571422 8.85701H1.23L2.29357 15.2364C2.33929 15.5121 2.57786 15.7142 2.85714 15.7142H13.1429C13.4221 15.7142 13.6607 15.5121 13.7064 15.2364L14.77 8.85701H15.4286C15.58 8.85701 15.7257 8.79701 15.8329 8.68987C15.94 8.58272 16 8.43701 16 8.28559V7.14273C16 6.9913 15.94 6.84559 15.8329 6.73845C15.7257 6.63131 15.58 6.57134 15.4286 6.57134ZM5.23719 13.4206C5.20576 13.4263 5.17433 13.4285 5.14219 13.4285C4.86291 13.4285 4.62505 13.2263 4.57934 12.9506L4.00791 9.52205C3.95576 9.21062 4.16648 8.91633 4.47791 8.8649C4.78933 8.81275 5.08362 9.02347 5.13506 9.3349L5.70649 12.7635C5.75792 13.0742 5.5479 13.3685 5.23719 13.4206ZM8.57141 12.8571C8.57141 13.1728 8.3157 13.4285 7.99998 13.4285C7.68426 13.4285 7.42855 13.1728 7.42855 12.8571V9.42849C7.42855 9.11277 7.68426 8.85706 7.99998 8.85706C8.3157 8.85706 8.57141 9.11277 8.57141 9.42849V12.8571ZM11.4207 12.9506C11.375 13.2263 11.1371 13.4278 10.8578 13.4285C10.8257 13.4285 10.7943 13.4264 10.7628 13.4206C10.4521 13.3685 10.2421 13.0742 10.2936 12.7635L10.865 9.33491C10.9164 9.02349 11.2107 8.81276 11.5221 8.86491C11.8336 8.91634 12.0443 9.21062 11.9921 9.52206L11.4207 12.9506Z" fill="white" />
                        </svg>
                    </button>
                </div>}
        </div>
    );
}

export default function SquareCard({ productsFetch, currentPage, totalPage, setCurrentPage }) {
    const searchParams = useSearchParams()

    const query = searchParams.get('query') || ''
    const order = searchParams.get('order') || ''
    const view = searchParams.get('view') || 'list'
    const categorySlug = searchParams.get('slug') || ''

    const catalogParams = {
        query: query,
        order: order,
        view: view,
        slug: categorySlug
    }

    const pageCount = totalPage;

    const getPagesArray = () => {
        if (pageCount <= 10) {
            return Array.from({ length: pageCount }, (_, i) => i + 1);
        }
        let pagesArray = [];
        for (let i = 0; i < 5; i++) {
            pagesArray.push(i + 1);
        }
        if (currentPage > 5 && currentPage != pageCount) {
            pagesArray.push(currentPage);
        } else {
            pagesArray.push('...');
        }
        for (let i = pageCount - 1; i < pageCount; i++) {
            pagesArray.push(i + 1);
        }
        return pagesArray;
    };

    const renderPaginationButtons = () => {
        const pagesArray = getPagesArray();
        return (
            <div className={styles.pagination}>
                {pagesArray.map((item, index) => {
                    if (typeof item === 'number') {
                        return (
                            <button className={styles.hover}
                                style={{
                                    fontSize: item === currentPage ? '24px' : '16px',
                                    color: item === currentPage ? "red" : "rgba(38, 71, 148, 1)"
                                }}
                                key={index}
                                onClick={() => setCurrentPage(item)}>
                                {item}
                            </button>
                        );
                    } else {
                        return <span key={index}>{item}</span>;
                    }
                })}
            </div>
        );
    };

    return (
        <>
            <div className={styles.square}>
                {productsFetch?.length > 0 ? (
                    productsFetch.map((item) => (
                        <SquareCatalogCard
                            key={item.id}
                            item={item}
                            catalogParams={catalogParams}
                        />
                    ))
                ) : (
                    <NoProducts />
                )}
            </div>
            <nav>
                <ul className={styles.pagination}>
                    <svg onClick={() => {
                        if (currentPage !== 1) {
                            setCurrentPage(currentPage - 1)
                        } else {
                            toaster.create({
                                title: "Навигация",
                                description: "Вы находитесь на первой странице",
                                type: "error",
                                duration: 2000,
                            })
                        }
                    }} className={styles.svg} width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.4 1.4L6 0L0 6L6 12L7.4 10.6L2.8 6L7.4 1.4Z" fill="#264794" />
                    </svg>
                    {renderPaginationButtons()}
                    <svg onClick={() => {
                        if (currentPage !== pageCount) {
                            setCurrentPage(currentPage + 1)
                        } else {
                            toaster.create({
                                title: "Навигация",
                                description: "Вы находитесь на последней странице",
                                type: "error",
                                duration: 2000,
                            })
                        }
                    }} className={styles.svg} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.9999 7.4L12.3999 6L18.3999 12L12.3999 18L10.9999 16.6L15.5999 12L10.9999 7.4Z" fill="#C51A1A" />
                        <circle cx="7" cy="12" r="2" fill="#C51A1A" />
                    </svg>
                </ul>
            </nav>
            <Toaster />
        </>
    )
}
