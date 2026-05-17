import styles from "./authForgot.module.css";
import Image from "next/image";
import logo from "../../../../img/logo300.svg"
import mark from "../../../../img/mark.png"
import { useState } from "react";
import { toaster } from "@/components/Toaster/toaster";
import { axiosInstance } from "@/api/__API__";

interface Props {
    setCurrentComponent: (value: string) => void;
}

export default function AuthForgot({ setCurrentComponent }: Props) {

    const [email, setEmail] = useState<string>("")
    const [send, setSend] = useState(true)

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit()
        }
    };

    const handleSubmit = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axiosInstance.post('/api/v1/user/reset-password', { email })
            setSend(false)
            toaster.create({
                title: "Письмо успешно отправлено",
                description: "Проверьте входящие сообщения",
                type: "success",
                duration: 5000,
            })
        } catch (error) {
            setEmail('')
            toaster.create({
                title: "Попробуйте еще раз",
                description: `${error?.response?.data?.message}`,
                type: "error",
                duration: 5000,
            })
        }
    };

    return (
        <>
            <div className={styles.authorization}>
                <h1 className={styles.h1}>Восстановление пароля</h1>
                {send && <div className={styles.text}>
                    Введите ваш адрес электронной почты и мы вышлем на него новый пароль
                </div>}
                {!send && <div className={styles.text}>
                    Ваш новый пароль отправлен по указанному адресу электронной почты <span className={styles.redEmail}>{email}</span>
                </div>}
                {!send && <div className={styles.text}>
                    Проверьте входящие сообщения.
                </div>}
                {send && <form className={styles.form}>
                    <div className={styles.inputContainer}>
                        {mail}
                        <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} required />
                    </div>
                </form>}

                {send && <div className={styles.buttons}>
                    <button onClick={handleSubmit} className={styles.enter}>Отправить</button>
                    <div
                        className={styles.back}
                        onClick={() => setCurrentComponent('authorization')}
                    >
                        {back}
                        Вернуться к авторизации/регистрации
                    </div>
                </div>}
                <div className={styles.textContainer}>
                    <h2>Добро пожаловать</h2>
                    <span className={styles.text}>На сайт магазина<br />«ЗооВетМир»</span>
                    <span className={styles.subText}>Мы осознаем ценность жизни<br />ваших питомцев</span>
                </div>
            </div>
            <Image className={styles.logo} src={logo} alt="" />
            <Image className={styles.mark} src={mark} alt="" />
        </>
    );
}

const mail = <svg className={styles.inputIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.84653 5.43662C3.21707 5.15536 3.67243 5 4.14296 5H19.8572C20.3278 5 20.7831 5.15536 21.1537 5.43662L12.0001 11.2947L2.84653 5.43662ZM21.9375 6.63038C21.9786 6.79734 22 6.96878 22 7.14288V17.1429C22 17.7116 21.7741 18.2563 21.3723 18.6581C20.9705 19.0598 20.4259 19.2857 19.8571 19.2857H4.14286C3.5741 19.2857 3.02946 19.0598 2.62768 18.6581C2.2259 18.2563 2 17.7116 2 17.1429V7.14288C2 6.96877 2.02143 6.79735 2.0625 6.63038L11.6152 12.7447C11.85 12.8947 12.15 12.8947 12.3848 12.7447L21.9375 6.63038Z" fill="#264794" fillOpacity="0.3" />
</svg>

const back = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.4 5.4L12 4L6 10L12 16L13.4 14.6L8.8 10L13.4 5.4Z" fill="white" />
</svg>
