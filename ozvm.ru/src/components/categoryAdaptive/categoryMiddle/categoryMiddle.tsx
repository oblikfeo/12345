import styles from "./categoryMiddle.module.css"
import Image from "next/image"
import icon from "../../../../img/expandmore2.svg"
import { useState } from "react"
import CategoryMiniAdaptive from "../categoryMain/categoryMain"

export default function CategoryMiddle({ name, slug, child, setSlug, selectedCategory, setSelectedCategory, clearSearch }) {

    const [open, setOpen] = useState(true)

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!open);
    }

    const selectCategory = () => {
        if (clearSearch) clearSearch();
        setSlug(slug);
        setSelectedCategory(slug);
    }

    const isSelected = selectedCategory === slug;

    return (
        <>
            <div className={styles.flex}>
                <span 
                    onClick={selectCategory} 
                    className={`${styles.middleText} ${isSelected ? styles.selected : ''}`}
                >
                    {name}
                </span>
                <div onClick={toggleOpen} className={styles.arrowButton}>
                    <Image className={open ? styles.icon : styles.iconClosed} src={icon} alt="" />
                </div>
            </div>
            <div className={open ? styles.categoryLowFalse : styles.categoryLowTrue}>
                <div className={styles.lowText}>
                    {child.map((item) => (
                        <CategoryMiniAdaptive 
                            key={item.id} 
                            item={item} 
                            setSlug={setSlug}
                            clearSearch={clearSearch}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}