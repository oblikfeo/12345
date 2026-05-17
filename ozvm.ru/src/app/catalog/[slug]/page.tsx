'use client'
import { axiosInstance } from "@/api/__API__"
import styles from "./page.module.css"
import Login from "@/components/login/login"
import ProductHeader from "@/components/productHeader/productHeader"
import ProductUp from "@/components/productUp/productUp"
import Paw1 from "@/components/UI kit/paws1/paws"
import Paw2 from "@/components/UI kit/paws2/paws"
import Paw3 from "@/components/UI kit/paws3/paws"
import Paw4 from "@/components/UI kit/paws4/paws"
import Paw5 from "@/components/UI kit/paws5/paws"
import { setUserData } from "@/redux/slices/userSlice"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

export default function Product() {

    const dispatch = useDispatch()
    const [minOrder, setMinOrder] = useState(0)

    useEffect(() => {
        axiosInstance.get('/api/v1/user', {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            dispatch(setUserData(response.data))
            setMinOrder(response.data.min_order_amount)
        }).catch((error) => {
            if (error.status === 401) {
                redirect('/')
            }
        })
    }, [])

    return (
        <div className={styles.flexContainer}>
            <Login setSlug={undefined} showCatalog={false} />
            <div className={styles.wrapper}>
                <Paw1 />
                <Paw2 />
                <Paw3 />
                <Paw4 />
                <Paw5 />
                <ProductHeader />
                <ProductUp minOrder={minOrder} />
            </div>
        </div>
    )
}

