import styles from './listCard.module.css'
import Image from 'next/image';
import img from '/img/newHaventLogo.svg'
import { toaster } from "@/components/Toaster/toaster"
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NoProducts from '../noProducts/noProducts'
import { useEffect, useRef, useState } from "react";
import { useStableCartQuantity } from '@/hooks/useStableCartQuantity';

function ListCardProductRow({ item, catalogParams }) {
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

    const lineQty = displayQty;
    const maxRests = item.rests ?? 0;

    const clampLocal = (q) => {
        const max = Number.isFinite(maxRests) ? maxRests : 0;
        const safe = Number.isFinite(q) ? q : 0;
        return Math.max(0, Math.min(safe, max));
    };

    return (
        <div className={styles.cart}>
            {item.id == 3 ? skid : ""}
            {item.id == 1 ? skid : ""}
            <Link href={{
                pathname: `/catalog/${item.slug}`,
                query: {
                    ...catalogParams,
                    id: item.id
                }
            }}>
                <Image props={item.id} className={styles.link} src={item.images[0] ?? img} alt='' width={60} height={60} />
            </Link>
            <div props={item.id} className={styles.discription}>
                <Link href={{
                    pathname: `/catalog/${item.slug}`,
                    query: {
                        ...catalogParams,
                        id: item.id
                    }
                }}>
                    {item.title}
                </Link>
            </div>
            <div className={item.rests > 0 ? styles.have : styles.havent}>{item.rests === 0 ? 'Нет в наличии' : `Доступно ${item.rests} шт`}</div>
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
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="20" height="20" fill="#ECF5FF" />
                            <rect x="5" y="9" width="10" height="2" fill="#264794" />
                        </svg>
                    </button>

                    <input
                        type="text"
                        min="0"
                        max={item.rests}
                        inputMode="numeric"
                        value={inputText}
                        placeholder='0'
                        onFocus={(e) => {
                            inputFocusedRef.current = true;
                            e.target.select();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === '0' && e.target.value === '') {
                                e.preventDefault();
                            }
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
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="20" height="20" fill="#ECF5FF" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M9 11V15H11V11H15V9H11V5H9V9H5V11H9Z" fill="#264794" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={styles.price}>
                <div>
                    <div className={styles.mainPrice}>
                        {item.price} ₽
                    </div>
                    <div className={styles.allPrice}>
                        {lineQty ? item.price * lineQty : 0} ₽ x {lineQty}
                    </div>
                    <div className={styles.subPrice}>
                        { } ₽
                    </div>
                </div>
                <div>
                    <div className={styles.buy}>
                        <Link href="/basket">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.4286 6.57145H12.2893L9.97923 2.57144L9.97851 2.57359L8.65995 4.85784L9.64924 6.57141H6.35068L8.98931 2.00071C9.14145 1.73786 9.18217 1.42572 9.10431 1.13285C9.02574 0.83999 8.83431 0.590719 8.57145 0.439276C8.30859 0.287133 7.99717 0.246416 7.7043 0.32499C7.41144 0.403562 7.16144 0.594997 7.01001 0.857855L3.71145 6.57141H0.571422C0.419994 6.57141 0.274279 6.63141 0.167143 6.73856C0.0599992 6.8457 0 6.99141 0 7.14284V8.28569C0 8.43712 0.0599992 8.58284 0.167143 8.68997C0.274286 8.79712 0.419998 8.85712 0.571422 8.85712H1.23L2.29357 15.2365C2.33929 15.5122 2.57786 15.7143 2.85714 15.7143H13.1429C13.4221 15.7143 13.6607 15.5122 13.7064 15.2365L14.77 8.85712H15.4286C15.58 8.85712 15.7257 8.79712 15.8329 8.68997C15.94 8.58283 16 8.43712 16 8.28569V7.14284C16 6.99141 15.94 6.84569 15.8329 6.73856C15.7257 6.63141 15.58 6.57145 15.4286 6.57145ZM5.23719 13.4207C5.20576 13.4264 5.17433 13.4286 5.14219 13.4286C4.86291 13.4286 4.62505 13.2264 4.57934 12.9507L4.00791 9.52216C3.95576 9.21073 4.16648 8.91644 4.47791 8.865C4.78933 8.81286 5.08362 9.02358 5.13506 9.335L5.70649 12.7636C5.75792 13.0743 5.5479 13.3686 5.23719 13.4207ZM8.57141 12.8572C8.57141 13.1729 8.3157 13.4286 7.99998 13.4286C7.68426 13.4286 7.42855 13.1729 7.42855 12.8572V9.42859C7.42855 9.11287 7.68426 8.85716 7.99998 8.85716C8.3157 8.85716 8.57141 9.11287 8.57141 9.42859V12.8572ZM11.4207 12.9507C11.375 13.2265 11.1371 13.4279 10.8578 13.4286C10.8257 13.4286 10.7943 13.4265 10.7628 13.4207C10.4521 13.3686 10.2421 13.0743 10.2936 12.7636L10.865 9.33502C10.9164 9.02359 11.2107 8.81287 11.5221 8.86502C11.8336 8.91645 12.0443 9.21073 11.9921 9.52217L11.4207 12.9507Z" fill="#C51A1A" />
                            </svg>
                        </Link>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default function ListCard({ setCurrentPage, totalPage, currentPage, productsFetch }) {
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
                            <button
                                className={styles.hover}
                                style={{
                                    fontSize: item === currentPage ? '24px' : '16px',
                                    color: item === currentPage ? "red" : "rgba(38, 71, 148, 1)"
                                }}
                                key={index}
                                onClick={() => setCurrentPage(item)}
                            >
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
            <div className={styles.wrapper}>
                {productsFetch?.length > 0 ? (
                    productsFetch.map((item) => (
                        <ListCardProductRow
                            key={item.id}
                            item={item}
                            catalogParams={catalogParams}
                        />
                    ))
                ) : (
                    <NoProducts />
                )}
                <nav className={styles.nav}>
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
            </div>
        </>
    )
}

const skid = <svg className={styles.skid} width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="10.1302" cy="10" rx="10.1302" ry="10" fill="#C51A1A" />
    <path d="M6.41414 7.4C6.41414 7.04 6.49014 6.716 6.64214 6.428C6.80214 6.14 7.02614 5.912 7.31414 5.744C7.60214 5.568 7.93414 5.48 8.31014 5.48C8.69414 5.48 9.02614 5.568 9.30614 5.744C9.59414 5.912 9.81414 6.14 9.96614 6.428C10.1261 6.716 10.2061 7.04 10.2061 7.4C10.2061 7.752 10.1261 8.076 9.96614 8.372C9.81414 8.66 9.59414 8.892 9.30614 9.068C9.02614 9.236 8.69414 9.32 8.31014 9.32C7.93414 9.32 7.60214 9.236 7.31414 9.068C7.02614 8.892 6.80214 8.66 6.64214 8.372C6.49014 8.076 6.41414 7.752 6.41414 7.4ZM7.26614 7.4C7.26614 7.6 7.30614 7.788 7.38614 7.964C7.47414 8.14 7.59414 8.28 7.74614 8.384C7.90614 8.488 8.09414 8.54 8.31014 8.54C8.53414 8.54 8.72214 8.488 8.87414 8.384C9.02614 8.28 9.14214 8.14 9.22214 7.964C9.31014 7.788 9.35414 7.6 9.35414 7.4C9.35414 7.192 9.31014 7.004 9.22214 6.836C9.14214 6.66 9.02614 6.52 8.87414 6.416C8.72214 6.312 8.53414 6.26 8.31014 6.26C8.09414 6.26 7.90614 6.312 7.74614 6.416C7.59414 6.52 7.47414 6.66 7.38614 6.836C7.30614 7.004 7.26614 7.192 7.26614 7.4ZM10.7941 12.2C10.7941 11.84 10.8701 11.516 11.0221 11.228C11.1821 10.94 11.4061 10.712 11.6941 10.544C11.9821 10.368 12.3141 10.28 12.6901 10.28C13.0741 10.28 13.4061 10.368 13.6861 10.544C13.9741 10.712 14.1941 10.94 14.3461 11.228C14.5061 11.516 14.5861 11.84 14.5861 12.2C14.5861 12.552 14.5061 12.876 14.3461 13.172C14.1941 13.46 13.9741 13.692 13.6861 13.868C13.4061 14.036 13.0741 14.12 12.6901 14.12C12.3141 14.12 11.9821 14.036 11.6941 13.868C11.4061 13.692 11.1821 13.46 11.0221 13.172C10.8701 12.876 10.7941 12.552 10.7941 12.2ZM11.6461 12.2C11.6461 12.4 11.6861 12.588 11.7661 12.764C11.8541 12.94 11.9741 13.08 12.1261 13.184C12.2861 13.288 12.4741 13.34 12.6901 13.34C12.9141 13.34 13.1021 13.288 13.2541 13.184C13.4061 13.08 13.5221 12.94 13.6021 12.764C13.6901 12.588 13.7341 12.4 13.7341 12.2C13.7341 11.992 13.6901 11.804 13.6021 11.636C13.5221 11.46 13.4061 11.32 13.2541 11.216C13.1021 11.112 12.9141 11.06 12.6901 11.06C12.4741 11.06 12.2861 11.112 12.1261 11.216C11.9741 11.32 11.8541 11.46 11.7661 11.636C11.6861 11.804 11.6461 11.992 11.6461 12.2ZM12.7501 5.6H13.6501L8.25014 14H7.35014L12.7501 5.6Z" fill="white" />
</svg>
