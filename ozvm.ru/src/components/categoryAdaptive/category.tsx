import { useEffect, useRef, useState } from "react"
import styles from "./category.module.css"
import CategoryMiddle from "./categoryMiddle/categoryMiddle"
import { Toaster } from "@/components/Toaster/toaster"
import { axiosInstance } from "@/api/__API__"
import { useSearchParams } from "next/navigation"

export default function CategoryAdaptive({ setCatalogButtonIpad, setSlug, clearSearch, resetAllFilters }) {

    const [category, setCategory] = useState([])
    const [render, setRender] = useState(false)
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

    const handleReset = () => {
        setRender(!render)
        setSelectedCategory(null)
        overflowRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        if (resetAllFilters) {
            resetAllFilters()
        } else {
            // Fallback для обратной совместимости
            setSlug()
            if (clearSearch) clearSearch()
        }
    }

    return (
        <div className={styles.wrapper}>

            <div className={styles.head}>
                <span onClick={handleReset} className={styles.reset}>Сбросить</span>
                <span onClick={() => setCatalogButtonIpad(true)}>{svg}</span>
            </div>

            <div className={styles.content}>
                <h1 className={styles.h1}>Категории</h1>
                <div className={styles.hidden}>
                    <div ref={overflowRef} className={styles.overflow}>
                        {render && category.map((item) => (
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
                        {!render && category.map((item) => (
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
            </div>
            <Toaster />
        </div>
    )
}

const svg = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M19 6.4L17.6 5L12 10.6L6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4Z" fill="#264794" />
</svg>

