import styles from './noProducts.module.css'

export default function NoProducts() {
    return (
        <div className={styles.noProducts}>
            <h1>Ошибка</h1>
            <h2>Товары не найдены</h2>
        </div>
    )
}

