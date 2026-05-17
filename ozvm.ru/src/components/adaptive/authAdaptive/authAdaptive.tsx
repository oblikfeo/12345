import styles from "./authAdaptive.module.css";
import Image from "next/image";
import logo from "../../../../img/logo300.svg"
import mark from "../../../../img/mark.png"
import { useState } from "react";

interface Props {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    handleSubmit: () => void;
    setCurrentComponent: (value: string) => void;
}

export default function AuthAdaptive({ email, setEmail, password, setPassword, handleSubmit, setCurrentComponent }: Props) {

    const [showPassword, setShowPassword] = useState(false);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit()
        }
    };

    return (
        <>
            <div className={styles.authorization}>
                <h1 className={styles.h1}>Авторизация</h1>
                <form className={styles.form}>
                    <div className={styles.inputContainer}>
                        {mail}
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input} type="email"
                            placeholder="Email"
                            onKeyPress={handleKeyPress}
                            autoComplete="username"
                            name="username"
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        {pass}
                        {password.length !== 0 && <svg onClick={() => setShowPassword(!showPassword)} className={styles.eye} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>}
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Пароль"
                            onKeyPress={handleKeyPress}
                            autoComplete="current-password"
                            name="password"
                            required
                        />
                    </div>
                </form>
                <div className={styles.buttons}>
                    <button
                        onClick={handleSubmit}
                        className={styles.enter}>
                        Войти
                    </button>
                    <button
                        onClick={() => setCurrentComponent('registration')}
                        className={styles.registration}>
                        Регистрация
                    </button>
                </div>
                <div onClick={() => setCurrentComponent('forgotPassword')} className={styles.forgot}>Забыли пароль?</div>
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

const pass = <svg className={styles.inputIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 22H16.5C17.875 22 19 20.875 19 19.5V12C19 10.625 17.875 9.5 16.5 9.5V7C16.5 4.23752 14.2625 2 11.5 2C8.73752 2 6.5 4.23752 6.5 7V9.5C5.125 9.5 4 10.625 4 12V19.5C4 20.875 5.125 22 6.5 22ZM11.5 17.6248C10.4625 17.6248 9.625 16.7873 9.625 15.7498C9.625 14.7123 10.4625 13.8748 11.5 13.8748C12.5375 13.8748 13.375 14.7123 13.375 15.7498C13.375 16.7873 12.5375 17.6248 11.5 17.6248ZM9 7C9 5.625 10.125 4.5 11.5 4.5C12.875 4.5 14 5.625 14 7V9.5H9V7Z" fill="#264794" fillOpacity="0.3" />
</svg>