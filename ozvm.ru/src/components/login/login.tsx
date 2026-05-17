'use client'
import styles from "./login.module.css";
import Image from "next/image";
import logo from "../../../img/logo300.svg"
import Link from "next/link";
import Category from "../category/category";
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalQuantity } from '../../redux/slices/cartSlice';
import { clearData, getUserData } from "@/redux/slices/userSlice";
import React from "react";

interface LoginProps {
    setSlug: (slug?: string) => void;
    showCatalog?: boolean;
    clearSearchRef?: React.MutableRefObject<(() => void) | null>;
    resetAllFiltersRef?: React.MutableRefObject<(() => void) | null>;
}

export default function Login({ setSlug, showCatalog = true, clearSearchRef, resetAllFiltersRef }: LoginProps) {

    const totalQuantity = useSelector(selectTotalQuantity)
    const userName = useSelector(getUserData)

    const dispatch = useDispatch()

    const clearSearch = () => {
        if (clearSearchRef?.current) {
            clearSearchRef.current();
        }
    }

    const resetAllFilters = () => {
        if (resetAllFiltersRef?.current) {
            resetAllFiltersRef.current();
        }
    }

    return (
        <div className={styles.sticky}>
            <div className={`${styles.authorization} ${!showCatalog ? styles.fullHeight : ''}`}>
                <h1 className={styles.h1}>Рады видеть вас,</h1>
                <div className={styles.nameCompany}>{userName?.name}</div>
                <div className={styles.panel}>
                    <div className={styles.panelMenu}>
                        {lkImg}
                        <Link href="/lk">
                            <span className={styles.hover}>Личный кабинет</span>
                        </Link>
                    </div>
                    <div className={styles.panelMenu}>
                        {basketImg}{totalQuantity === 0 ? "" : basketImg2}
                        <Link href="/basket">
                            <span className={styles.hover}>Корзина</span>
                        </Link>
                        <div className={totalQuantity === 0 ? "" : styles.totalQuantity}>
                            <span>{totalQuantity === 0 ? "" : totalQuantity}</span>
                        </div>
                    </div>
                </div>

                <div onClick={() => {
                    localStorage.removeItem("USER_TOKEN")
                    dispatch(clearData())
                    //dispatch(clearCart())
                }} className={styles.buttons}>
                    <Link href="/">
                        <button className={styles.enter}>Выйти из личного кабинета</button>
                    </Link>
                </div>

                <Image className={styles.logo} src={logo} alt="" />
            </div>
            {showCatalog && <Category setSlug={setSlug} clearSearch={clearSearch} resetAllFilters={resetAllFilters} />}
        </div>
    );
}

const basketImg = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.2857 7.85695H15.3616L12.474 2.85694L12.4731 2.85962L10.8249 5.71494L12.0616 7.85691H7.93835L11.2366 2.14353C11.4268 1.81496 11.4777 1.42479 11.3804 1.05871C11.2822 0.692626 11.0429 0.381037 10.7143 0.191734C10.3857 0.00155577 9.99646 -0.0493403 9.63038 0.048877C9.2643 0.147092 8.95179 0.386386 8.76251 0.714958L4.63931 7.85691H0.714277C0.524993 7.85691 0.342848 7.93191 0.208928 8.06584C0.074999 8.19977 0 8.3819 0 8.57119V9.99976C0 10.189 0.074999 10.3712 0.208928 10.5051C0.342858 10.639 0.524997 10.714 0.714277 10.714H1.5375L2.86696 18.6882C2.92411 19.0329 3.22233 19.2855 3.57142 19.2855H16.4286C16.7777 19.2855 17.0759 19.0329 17.133 18.6882L18.4625 10.714H19.2857C19.475 10.714 19.6572 10.639 19.7911 10.5051C19.925 10.3712 20 10.189 20 9.99976V8.57119C20 8.3819 19.925 8.19976 19.7911 8.06584C19.6571 7.93191 19.475 7.85695 19.2857 7.85695ZM6.54649 16.4186C6.5072 16.4257 6.46792 16.4284 6.42774 16.4284C6.07864 16.4284 5.78131 16.1757 5.72417 15.8311L5.00989 11.5453C4.94471 11.1561 5.2081 10.7882 5.59738 10.7239C5.98666 10.6587 6.35453 10.9221 6.41882 11.3114L7.13311 15.5971C7.1974 15.9855 6.93488 16.3534 6.54649 16.4186ZM10.7143 15.7141C10.7143 16.1088 10.3946 16.4284 9.99998 16.4284C9.60532 16.4284 9.28569 16.1088 9.28569 15.7141V11.4284C9.28569 11.0337 9.60532 10.7141 9.99998 10.7141C10.3946 10.7141 10.7143 11.0337 10.7143 11.4284V15.7141ZM14.2759 15.8311C14.2187 16.1757 13.9214 16.4275 13.5723 16.4284C13.5321 16.4284 13.4928 16.4257 13.4535 16.4186C13.0652 16.3534 12.8026 15.9855 12.8669 15.5971L13.5812 11.3114C13.6455 10.9221 14.0134 10.6587 14.4027 10.7239C14.792 10.7882 15.0554 11.156 14.9902 11.5454L14.2759 15.8311Z" fill="#C51A1A" />
</svg>
const lkImg = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99992 20C6.93302 20 4.19946 18.6224 2.3559 16.4444C2.28906 16.3776 2.24479 16.3333 2.20052 16.2665C0.822046 14.5555 0 12.3776 0 10C0 4.48868 4.48868 0 10 0C15.5114 0 20 4.48868 20 10C20 12.3776 19.178 14.5556 17.7778 16.2665C17.7336 16.3333 17.6893 16.4002 17.6224 16.4444C15.8004 18.6224 13.0668 20 9.99992 20ZM9.99992 11.5998C12.6224 11.5998 15.0884 12.5998 16.9557 14.4002C17.7552 13.1337 18.2222 11.6224 18.2222 9.99998C18.2222 5.46708 14.5329 1.77773 9.99996 1.77773C5.46706 1.77773 1.77772 5.46708 1.77772 9.99998C1.77772 11.6224 2.24474 13.1338 3.04421 14.4002C4.91139 12.5998 7.37747 11.5998 9.99992 11.5998ZM9.99992 9.99993C8.15529 9.99993 6.66658 8.51122 6.66658 6.66659C6.66658 4.82196 8.15529 3.33325 9.99992 3.33325C11.8445 3.33325 13.3333 4.82196 13.3333 6.66659C13.3333 8.51122 11.8445 9.99993 9.99992 9.99993Z" fill="#C51A1A" />
</svg>
const basketImg2 = <svg className={styles.basketImg2} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle opacity="0.2" cx="20" cy="20" r="14" fill="#C51A1A" />
    <circle opacity="0.2" cx="20" cy="20" r="20" fill="#C51A1A" />
</svg>