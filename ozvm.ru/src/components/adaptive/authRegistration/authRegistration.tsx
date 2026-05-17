import styles from './authRegistration.module.css'
import Image from "next/image";
import logo from "../../../../img/logo300.svg"
import mark from "../../../../img/mark.png"
import { useEffect, useRef, useState } from 'react';
import { Toaster, toaster } from "@/components/Toaster/toaster"
import { axiosInstance } from '@/api/__API__';
import IMask from 'imask';

interface Props {
    setCurrentComponent: (value: string) => void;
}

export default function AuthRegistration({ setCurrentComponent }: Props) {

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const phoneInputRef = useRef(null);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit()
        }
    };

    useEffect(() => {
        if (phoneInputRef.current) {
            const maskOptions = {
                mask: '+{7} (000) 000-00-00',
            };
            IMask(phoneInputRef.current, maskOptions);
        }
    }, []);

    const handleSubmit = async () => {
        console.log(phone.length)
        if (phone.length === 18) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await axiosInstance.post('/api/v1/user/registration', { name, email, phone })
                setName('')
                setPhone('')
                setEmail('')
                toaster.create({
                    title: "Письмо успешно отправлено",
                    description: "Ожидайте, с вами свяжется менеджер",
                    type: "success",
                    duration: 5000,
                })
            } catch (error) {
                toaster.create({
                    title: `${error.response.data.message}`,
                    description: "",
                    type: "warning",
                    duration: 5000,
                })
            }
        } else {
            toaster.create({
                title: "Некорректный номер телефона",
                description: "",
                type: "warning",
                duration: 3000,
            })
        }
    };


    return (
        <>
            <div className={styles.authorization}>
                <h1 className={styles.h1}>Регистрация</h1>
                <form className={styles.form}>
                    <div className={styles.inputContainer}>
                        {names}
                        <input className={styles.input} type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} onKeyPress={handleKeyPress} required />
                    </div>
                    <div className={styles.inputContainer}>
                        {tel}
                        <input className={styles.input} ref={phoneInputRef} type="text" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyPress={handleKeyPress} required />
                    </div>
                    <div className={styles.inputContainer}>
                        {mail}
                        <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} required />
                    </div>
                </form>
                <div className={styles.buttons}>
                    <button onClick={
                        handleSubmit
                    } className={styles.enter}>Зарегистрироваться</button>
                    <button
                        className={styles.registration}
                        onClick={() => setCurrentComponent('authorization')}
                    >У меня уже есть аккаунт</button>
                </div>
                <div className={styles.textContainer}>
                    <h2>Добро пожаловать</h2>
                    <span className={styles.text}>На сайт магазина<br />«ЗооВетМир»</span>
                    <span className={styles.subText}>Мы осознаем ценность жизни<br />ваших питомцев</span>
                </div>
            </div>
            <Image className={styles.logo} src={logo} alt="" />
            <Image className={styles.mark} src={mark} alt="" />
            <Toaster />
        </>
    );
}

const tel = <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.51348 -0.000260924C2.98112 0.0113335 2.75082 0.17637 2.43241 0.540274L0.540535 2.70241C0.1451 3.15434 0 3.85904 0 4.59429C0 7.04911 1.84676 11.0349 5.40535 14.5942C8.9646 18.1528 12.9504 19.9995 15.4052 19.9995C16.1405 19.9995 16.8452 19.8544 17.2971 19.459L19.4593 17.5671C19.8231 17.2487 19.9882 17.0184 19.9998 16.486C20.0083 16.094 19.7759 15.7217 19.4593 15.405L16.4863 12.432C16.1527 12.0984 15.8659 11.8915 15.4052 11.8915C14.9261 11.8915 14.6194 12.1368 14.3242 12.432L13.2431 13.5131C12.7479 13.9901 12.378 14.0265 11.8918 13.7834L6.21615 8.10776C5.97307 7.62152 6.00943 7.25166 6.48642 6.75642L7.56749 5.67535C7.86273 5.38011 8.10802 5.07344 8.10802 4.59429C8.10802 4.13357 7.90115 3.84688 7.56749 3.51322L4.59455 0.540274C4.27788 0.22361 3.90551 -0.00879056 3.51348 -0.000260924Z" fill="#264794" fillOpacity="0.3" />
</svg>

const names = <svg className={styles.inputIcon} width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.93331 0.445542C5.76439 0.698393 5.76439 1.05039 5.76439 1.75438C5.76439 2.45837 5.76439 2.81037 5.93331 3.06322C6.00649 3.17268 6.10043 3.26666 6.2099 3.33981C6.46283 3.50876 6.81481 3.50876 7.51877 3.50876H9.02252C9.72648 3.50876 10.0785 3.50876 10.3314 3.33981C10.4409 3.26666 10.5348 3.17268 10.608 3.06322C10.7769 2.81037 10.7769 2.45837 10.7769 1.75438C10.7769 1.05039 10.7769 0.698393 10.608 0.445542C10.5348 0.336079 10.4409 0.242094 10.3314 0.168952C10.0785 -1.49385e-08 9.72648 0 9.02252 0H7.51877C6.81481 0 6.46283 -1.49385e-08 6.2099 0.168952C6.10043 0.242094 6.00649 0.336079 5.93331 0.445542Z" fill="#264794" fillOpacity="0.3" />
    <path d="M8.27065 8.22047C7.57852 8.22047 7.01752 8.78157 7.01752 9.4736C7.01752 10.1657 7.57852 10.7267 8.27065 10.7267C8.96277 10.7267 9.52377 10.1657 9.52377 9.4736C9.52377 8.78157 8.96277 8.22047 8.27065 8.22047Z" fill="#264794" fillOpacity="0.3" />
    <path fillRule="evenodd" clipRule="evenodd" d="M4.70934 1.4724C4.70648 1.61415 4.70649 1.76493 4.70651 1.92197V1.98824C4.70648 2.31171 4.70645 2.6087 4.73149 2.8548C4.75866 3.12184 4.8214 3.41111 5.00218 3.68166C5.13017 3.87323 5.29465 4.0377 5.48621 4.1657C5.75676 4.34648 6.04599 4.40922 6.31306 4.43639C6.55917 4.46142 6.85611 4.4614 7.17962 4.46137H9.30623C9.62974 4.4614 9.92668 4.46142 10.1728 4.43639C10.4399 4.40922 10.7292 4.34648 10.9997 4.1657C11.1912 4.0377 11.3557 3.87323 11.4838 3.68166C11.6645 3.41111 11.7273 3.12185 11.7544 2.8548C11.7795 2.60867 11.7794 2.31171 11.7794 1.9882V1.92201C11.7794 1.76434 11.7794 1.61296 11.7765 1.47071C12.2977 1.48603 12.7627 1.51516 13.1747 1.57054C14.077 1.69186 14.8367 1.9514 15.4402 2.55483C16.0436 3.15825 16.3032 3.91802 16.4245 4.82038C16.5413 5.68951 16.5413 6.79458 16.5413 8.16555V13.2881C16.5413 14.6592 16.5413 15.7642 16.4245 16.6334C16.3032 17.5357 16.0436 18.2955 15.4402 18.8989C14.8367 19.5024 14.077 19.7619 13.1747 19.8832C12.3055 20.0001 11.2005 20.0001 9.82944 20H6.71185C5.34087 20.0001 4.23579 20.0001 3.36665 19.8832C2.46429 19.7619 1.70453 19.5024 1.1011 18.8989C0.497673 18.2955 0.238135 17.5357 0.116812 16.6334C-3.96466e-05 15.7642 -1.95248e-05 14.6592 5.25266e-07 13.2881V8.16565C-1.95248e-05 6.7946 -3.96466e-05 5.68952 0.116812 4.82038C0.238135 3.91802 0.497673 3.15825 1.1011 2.55483C1.70453 1.9514 2.46429 1.69186 3.36665 1.57054C3.76396 1.51713 4.21056 1.48814 4.70934 1.4724ZM5.51376 9.47372C5.51376 7.95112 6.74805 6.71687 8.27065 6.71687C9.79325 6.71687 11.0275 7.95112 11.0275 9.47372C11.0275 10.9963 9.79325 12.2306 8.27065 12.2306C6.74805 12.2306 5.51376 10.9963 5.51376 9.47372ZM6.92268 14.6508C6.0887 14.8891 5.51376 15.6513 5.51376 16.5187V16.9925C5.51376 17.4077 5.17713 17.7444 4.76189 17.7444C4.34664 17.7444 4.01001 17.4077 4.01001 16.9925V16.5187C4.01001 14.98 5.03006 13.6277 6.50955 13.2049C7.66062 12.8761 8.88067 12.8761 10.0317 13.2049C11.5112 13.6277 12.5313 14.98 12.5313 16.5187V16.9925C12.5313 17.4077 12.1946 17.7444 11.7794 17.7444C11.3642 17.7444 11.0275 17.4077 11.0275 16.9925V16.5187C11.0275 15.6513 10.4526 14.8891 9.61861 14.6508C8.73761 14.3991 7.80368 14.3991 6.92268 14.6508Z" fill="#264794" fillOpacity="0.3" />
</svg>

const mail = <svg className={styles.inputIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.84653 5.43662C3.21707 5.15536 3.67243 5 4.14296 5H19.8572C20.3278 5 20.7831 5.15536 21.1537 5.43662L12.0001 11.2947L2.84653 5.43662ZM21.9375 6.63038C21.9786 6.79734 22 6.96878 22 7.14288V17.1429C22 17.7116 21.7741 18.2563 21.3723 18.6581C20.9705 19.0598 20.4259 19.2857 19.8571 19.2857H4.14286C3.5741 19.2857 3.02946 19.0598 2.62768 18.6581C2.2259 18.2563 2 17.7116 2 17.1429V7.14288C2 6.96877 2.02143 6.79735 2.0625 6.63038L11.6152 12.7447C11.85 12.8947 12.15 12.8947 12.3848 12.7447L21.9375 6.63038Z" fill="#264794" fillOpacity="0.3" />
</svg>