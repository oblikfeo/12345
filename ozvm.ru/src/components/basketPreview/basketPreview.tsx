'use client'
import styles from "./basketPreview.module.css"
import Image from 'next/image';
import basketImg from '../../../img/basketImg.png'
import { useSelector } from 'react-redux';
import {
    selectTotalAmount,
    selectTotalQuantity,
    selectCartLoading
} from '../../redux/slices/cartSlice';
import { Toaster, toaster } from "@/components/Toaster/toaster"
import Delivery from "../delivery/delivery";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/api/__API__";
import CartItem from "@/components/basketPreview/cartItem";

export default function BasketPreview({ open, setOpen, setModalChange, name, phone, minOrder, setProduct, product, cartItems, buy, setEntrance, setFloor, setApartment, setComment, buy2, setAdress, address, show, setShow }) {
    const cartLoading = useSelector(selectCartLoading);
    const totalAmount = useSelector(selectTotalAmount);
    const quantity = useSelector(selectTotalQuantity);

    const [where, setWhere] = useState("Доставка")
    const [isChecking, ] = useState(false)

    useEffect(() => {
        if (cartLoading) return;
        if (!cartItems.length) {
            setProduct([]);
            return;
        }
        const ids = cartItems.map((item) => item.id).filter(Boolean).join(',');
        if (!ids) return;

        axiosInstance.get(`/api/v1/shop/products?ids=${ids}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}`,
                'Cache-Control': 'no-cache, no-store',
                Pragma: 'no-cache',
            },
            params: { _t: Date.now() },
        })
            .then((responses) => {
                const { data } = responses.data;
                setProduct([...data]);
            })
            .catch((error) => {
                console.error('Ошибка при получении данных:', error);
            });
    }, [cartLoading, cartItems]);

    useEffect(() => {
        if (!quantity || totalAmount < minOrder) {
            setOpen(false)
        }
    }, [quantity, totalAmount])

    const scrollToTop = () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };

    useEffect(() => {
        if (open) {
            scrollToTop();
        }
    }, [open]);

    return (
        <div className={styles.open}>
            <div className={styles.wrapper}>
                {cartItems.map(item => (
                    <CartItem
                        key={item.id}
                        item={item}
                        productList={product}
                    />
                ))}
                {!open && <div className={styles.next}>
                    <div className={styles.totalAmount}><span className={styles.itogo}>Итого:</span> {totalAmount} ₽</div>
                    <button
                        onClick={() => {
                            if (quantity === 0) {
                                toaster.create({
                                    title: "Ошибка",
                                    description: "Корзина пуста, добавьте товары",
                                    type: "error",
                                    duration: 3000,
                                })
                            } else if (totalAmount < minOrder) {
                                toaster.create({
                                    title: "Ошибка",
                                    description: `Минимальный заказ ${minOrder} ₽`,
                                    type: "warning",
                                    duration: 3000,
                                })
                            } else {
                                setOpen(true)
                                scrollToTop();
                            }
                        }}
                        className={styles.but}>
                        Перейти к оформлению заказа
                    </button>
                </div>}
                {open && <div className={styles.next}>
                    <div className={styles.totalAmount}><span className={styles.itogo}>Итого:</span> {totalAmount} ₽</div>
                    <button onClick={async () => {
                        if (where === "Самовывоз") {
                            buy();
                            scrollToTop();
                        }
                        if (where === "Доставка") {
                            buy2();
                            scrollToTop();
                        }
                    }}
                        disabled={isChecking}
                        className={styles.but}>
                        {isChecking ? "Проверка товаров..." : "Оформить заказ"}
                    </button>
                </div>}
                <Image className={styles.img} src={basketImg} alt="" />
            </div>
            {open ? <Delivery
                setModalChange={setModalChange}
                name={name}
                address={address}
                phone={phone}
                setEntrance={setEntrance}
                setFloor={setFloor}
                setApartment={setApartment}
                setComment={setComment}
                setWhere={setWhere}
                setAdress={setAdress}
                show={show}
                setShow={setShow}
            /> : <></>}
            <Toaster />
        </div>


    )
}