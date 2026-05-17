import { useEffect, useRef, useState } from "react"
import styles from "./category.module.css"
import CategoryMiddle from "./categoryMiddle/categoryMiddle"
import { axiosInstance } from "@/api/__API__"
import { useSearchParams } from "next/navigation"

export default function Category({ setSlug, clearSearch, resetAllFilters }) {

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
        <div className={`${styles.wrapper} ${styles.categoryWrapper}`}>

            <div className={styles.head}>
                <span onClick={handleReset}
                    className={styles.reset}>Сбросить</span>
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
        </div>
    )
}
