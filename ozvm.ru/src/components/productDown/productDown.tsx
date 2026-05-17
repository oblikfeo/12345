import styles from "./productDown.module.css"

export default function ProductDown({ fetch }) {

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.h2}>Описание</h2>
            <div className={styles.flex}>
                <span>{fetch?.text}</span>
            </div>
        </div>
    )
}