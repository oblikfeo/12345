import { useSelector } from "react-redux"
import styles from "./lkAbout.module.css"
import { getUserData } from "@/redux/slices/userSlice"

export default function LkAbout({ setOpen, open }) {

    const userStore = useSelector(getUserData)

    return (
        <div className={styles.wrapper}>
            <div className={styles.center}>
                <div className={styles.left}>
                    <span>Имя:</span>
                    <span>Адрес:</span>
                    <span>Телефон:</span>
                    <span>Email:</span>
                </div>
                <div className={styles.right}>
                    <span>{userStore?.name ? userStore?.name : "отсутствует"}</span>
                    <span>{userStore?.address ? userStore?.address : "отсутствует"}</span>
                    <span>{userStore?.phone ? userStore?.phone : "отсутствует"}</span>
                    <span>{userStore?.email ? userStore?.email : "отсутствует"}</span>
                </div>
            </div>
            <div onClick={() => setOpen(!open)} className={styles.change}>
                Изменить контактную информацию
            </div>
        </div>
    )
}