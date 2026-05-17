import { axiosInstance } from "@/api/__API__"
import styles from "./change.module.css"
import { useState } from "react"
import { useSelector } from "react-redux";
import { getUserData } from "@/redux/slices/userSlice";
import { toaster, Toaster } from "@/components/Toaster/toaster"

export default function Change() {

    const userStore = useSelector(getUserData)

    const [email, setEmail] = useState<string>(userStore?.email)
    const [address, setAddress] = useState<string>(userStore?.address);
    const [name, setName] = useState<string>(userStore?.name);
    const [phone, setPhone] = useState<string>(userStore?.phone);

    const [currentPassword, setCurrentPassword] = useState<string>()
    const [password, setPassword] = useState<string>()
    const [repeatPassword, setRepeatPassword] = useState<string>()



    const handleSubmit = async () => {
        try {
            await axiosInstance.post('/api/v1/user/edit', {
                email: email,
                address: address,
                name: name,
                phone: phone,
                password_old: currentPassword,
                password_confirmation: password,
                password: repeatPassword
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
            });
            toaster.create({
                title: "Данные успешно изменены",
                description: "Обновите страницу",
                type: "success",
                duration: 4000,
            });
        } catch (error) {
            console.log(error.response.data.message)
            toaster.create({
                title: "Ошибка при смене данных",
                description: `${error.response.data.message}`,
                type: "error",
                duration: 5000,
            })
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.left}>
                <h1>Изменение личных данных</h1>
                <div className={styles.position}><input type="text" placeholder="Введите имя" value={name ?? undefined} onChange={(e) => setName(e.target.value)} />
                    <div onClick={() => setName("")}>{img}</div>
                </div>
                <div className={styles.position}><input type="text" placeholder="Введите адрес" value={address ?? undefined} onChange={(e) => setAddress(e.target.value)} />
                    <div onClick={() => setAddress("")}>{img}</div>
                </div>
                <div className={styles.position}><input type="text" placeholder="Введите номер телефона" value={phone ?? undefined} onChange={(e) => setPhone(e.target.value)} />
                    <div onClick={() => setPhone("")}>{img}</div>
                </div>
                <div className={styles.position}><input type="text" placeholder="Введите Email" value={email ?? undefined} onChange={(e) => setEmail(e.target.value)} />
                    <div onClick={() => setEmail("")}>{img}</div>
                </div>
            </div>
            <div className={styles.right}>
                <h1>Изменение пароля</h1>
                <div className={styles.position}><input type="password" placeholder="Текущий пароль" onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                <div className={styles.position}><input type="password" placeholder="Новый пароль" onChange={(e) => setPassword(e.target.value)} /></div>
                <div className={styles.position}><input type="password" placeholder="Повторить пароль" onChange={(e) => setRepeatPassword(e.target.value)} /></div>
                <div className={styles.buttons}>
                    <button className={styles.save} onClick={handleSubmit}>Сохранить изменения</button>
                    <button className={styles.delete}>Отмена</button>
                </div>
            </div>
            <Toaster />
        </div>
    )
}

const img = <svg className={styles.absolute} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M14 1.4L12.6 0L7 5.6L1.4 0L0 1.4L5.6 7L0 12.6L1.4 14L7 8.4L12.6 14L14 12.6L8.4 7L14 1.4Z" fill="#C51A1A" />
</svg>
