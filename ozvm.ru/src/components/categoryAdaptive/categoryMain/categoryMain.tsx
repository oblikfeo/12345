import styles from "./categoryMain.module.css"

export default function CategoryMiniAdaptive({ item, setSlug, selectedCategory, setSelectedCategory, clearSearch }) {
    const shows = () => {
        if (clearSearch) clearSearch()
        setSlug(item.slug)
        setSelectedCategory(item.slug)
    }

    const isSelected = selectedCategory === item.slug

    return (
        <>
            <span key={item.id} className={`${styles.hover} ${isSelected ? styles.selected : ''}`}>
                <span onClick={shows} key={item.id}>
                    {item.title}
                </span>
            </span>
        </>
    )
}