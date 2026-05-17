import { useEffect, useRef, useState } from "react"
import styles from "./category.module.css"
import { Toaster } from "@/components/Toaster/toaster"
import CategoryMiddle from "./categoryMiddle/categoryMiddle"
import { axiosInstance } from "@/api/__API__"
import { useSearchParams } from "next/navigation"

export default function CategoryMobile({ setCatalogButtonIpad, setSlug, setSortBy, clearSearch, resetAllFilters }) {

    const [close, setClose] = useState(false)
    const [category, setCategory] = useState([])
    const [sortPrice, setSortPrice] = useState(false)
    const [sortName, setSortName] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const searchParams = useSearchParams()

    const overflowRef = useRef(null)

    useEffect(() => {
        axiosInstance.get(`/api/v1/shop/categories`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            setCategory(response.data)
        }).catch((error) => console.error(error))
    }, [])

    // Синхронизация selectedCategory с URL параметром slug
    useEffect(() => {
        const urlSlug = searchParams.get('slug')
        if (urlSlug) {
            setSelectedCategory(urlSlug)
        } else {
            setSelectedCategory(null)
        }
    }, [searchParams])

    return (
        <div className={styles.wrapper}>

            <div className={styles.head}>
                <span onClick={() => {
                    setClose(!close)
                    setSelectedCategory(null)
                    setSortPrice(false)
                    setSortName(false)
                    overflowRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                    if (resetAllFilters) {
                        resetAllFilters()
                    } else {
                        // Fallback для обратной совместимости
                        setSlug()
                        setSortBy()
                        if (clearSearch) clearSearch()
                    }
                }} className={styles.reset}>Сбросить</span>
                <span onClick={() => {
                    setCatalogButtonIpad(true)
                    setSortName(false)
                    setSortPrice(false)
                }}>{svg}</span>
            </div>

            <div className={styles.content}>
                <h1 className={styles.h1}>Категории</h1>
                <div className={styles.hidden}>
                    <div ref={overflowRef} className={styles.overflow}>
                        {!close && category.map((item) => (
                            <CategoryMiddle 
                                key={item.id} 
                                name={item.title}
                                slug={item.slug}
                                child={item.child} 
                                setSlug={setSlug}
                                clearSearch={clearSearch}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                            />
                        ))}
                        {close && category.map((item) => (
                            <CategoryMiddle 
                                key={item.id} 
                                name={item.title}
                                slug={item.slug}
                                child={item.child} 
                                setSlug={setSlug}
                                clearSearch={clearSearch}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                            />
                        ))}
                    </div>

                </div>
                <div className={styles.sortMain}>
                    <h1>Сортировка</h1>
                    <div onClick={() => {
                        setSortPrice(!sortPrice)
                        setSortName(false)
                        setSortBy('price')
                    }} className={styles.sort}>{!sortPrice ? radioOff : radioOn} По цене</div>
                    <div onClick={() => {
                        setSortName(!sortName)
                        setSortBy('title')
                    }} className={styles.sort}>{!sortName ? radioOff : radioOn} По алфавиту</div>
                </div>
            </div>
            <Toaster />
        </div>
    )
}

const svg = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M19 6.4L17.6 5L12 10.6L6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4Z" fill="#264794" />
</svg>

const radioOff = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20Z" fill="#ECF5FF" />
</svg>

const radioOn = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 5C7.2 5 5 7.2 5 10C5 12.8 7.2 15 10 15C12.8 15 15 12.8 15 10C15 7.2 12.8 5 10 5ZM10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18Z" fill="#E21E25" />
</svg>

