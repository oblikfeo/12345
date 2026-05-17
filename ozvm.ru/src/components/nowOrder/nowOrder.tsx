"use client"
import styles from "./nowOrder.module.css"
import { useEffect, useState } from "react"
import { axiosInstance } from "@/api/__API__"
import Orders from "../orders/orders"

export default function NowOrder() {

    const [order, setOrder] = useState([])

    useEffect(() => {
        axiosInstance.get('/api/v1/user/orders', {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            setOrder(response.data)
        }).catch(() => {
            console.log("ошибка")
        })
    }, [])

    console.log(order)

    return (
        <>
            <div className={styles.wrapperLoading}>
                {order?.map((item) => (
                    <>
                        <Orders item={item} />
                    </>
                ))}

            </div>
        </>

    )
}