'use client'
import styles from './welcome.module.css'
import Image from 'next/image';
import logo from '../../../img/miniLogo.svg'
import img from '../../../img/GirlDog.png'
import img2 from '../../../img/girlMobile.png'
import wa from '../../../img/whatsapp.png'
import { useEffect, useState } from 'react';
import AuthAdaptive from '../adaptive/authAdaptive/authAdaptive';
import AuthRegistration from '../adaptive/authRegistration/authRegistration';
import AuthForgot from '../adaptive/authForgot/authForgot';

interface Props {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    handleSubmit: () => void;
    setCurrentComponent: (value: string) => void;
    currentComponent: string
}


export default function Welcome({ email, setEmail, password, setPassword, handleSubmit, setCurrentComponent, currentComponent }: Props) {

    const [toggle, setToggle] = useState(true)

    useEffect(() => {
        const handleResize = () => {
            setToggle(window.innerWidth >= 1441);
        };

        // Установка начального состояния
        handleResize();

        // Добавление слушателя события
        window.addEventListener('resize', handleResize);

        // Очистка слушателя при размонтировании компонента
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    return (
        <div className={styles.welcomeContainer}>
            <Image className={styles.logo} src={logo} alt='' />
            <div className={styles.header}>
                <div className={styles.contacts}>

                    <a className={styles.link} href="https://t.me/zoovetmir" target="_blank">
                        {tg}
                        <span className={styles.font}>Мы в Telegram</span>
                    </a>

                    <a className={styles.link} href="https://wa.me/79048299202" target="_blank">
                        <Image src={wa} alt='' width={24} height={24} />
                        <span className={styles.font}>Перейти в чат</span>
                    </a>

                    <a className={styles.link} href="tel:+79048299202">
                        {tel}
                        <span className={styles.font}>+7 904 829‑92‑02</span>
                    </a>

                    <a className={styles.link} href="mailto:info@ozvm.ru">
                        {mail}
                        <span className={styles.font}>info@ozvm.ru</span>
                    </a>

                </div>
            </div>

            <div className={styles.contentContainer}>
                {toggle && <Image className={styles.girl} src={img} alt='' />}
                {toggle && <Image className={styles.girl2} src={img2} alt='' />}
                <div className={styles.container}>
                    <div className={styles.sideA}></div>
                    <div className={toggle ? styles.sideB : styles.sideB2}></div>
                    <div className={toggle ? styles.sideC : styles.sideC2}></div>
                </div>
                <div className={toggle ? styles.sideD : styles.sideD2}>
                    {toggle && <div onClick={() => setToggle(!toggle)} className={styles.toggle}>{toggleMenu}</div>}
                    {!toggle && <div onClick={() => setToggle(!toggle)} className={styles.closeMobile}>
                        {white}
                        <div className={styles.whiteClose}></div>
                    </div>}
                    {!toggle && currentComponent == "authorization" && <AuthAdaptive
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        handleSubmit={handleSubmit}
                        setCurrentComponent={setCurrentComponent}
                    />}
                    {!toggle && currentComponent == "registration" && <AuthRegistration setCurrentComponent={setCurrentComponent} />}
                    {!toggle && currentComponent == "forgotPassword" && <AuthForgot setCurrentComponent={setCurrentComponent} />}
                    {toggle && <div className={styles.textContainer}>
                        <h2>Добро пожаловать</h2>
                        <span className={styles.text}>На сайт магазина<br />«ЗооВетМир»</span>
                        <span className={styles.subText}>Мы осознаем ценность жизни<br />ваших питомцев</span>
                    </div>}
                </div>
            </div>

            <div className={styles.footer}>
                <span className={styles.redline}>ЗооВетМир</span>
                <div className={styles.red2}></div>
                <span className={styles.footerText}>ветеринарные препараты для всех видов животных</span>
            </div>
        </div>
    );
}

const tel = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.51348 2.00023C4.98112 2.01182 4.75082 2.17686 4.43241 2.54076L2.54053 4.7029C2.1451 5.15483 2 5.85953 2 6.59477C2 9.0496 3.84676 13.0354 7.40535 16.5947C10.9646 20.1533 14.9504 22 17.4052 22C18.1405 22 18.8452 21.8549 19.2971 21.4595L21.4593 19.5676C21.8231 19.2492 21.9882 19.0189 21.9998 18.4865C22.0083 18.0945 21.7759 17.7221 21.4593 17.4055L18.4863 14.4325C18.1527 14.0989 17.8659 13.892 17.4052 13.892C16.9261 13.892 16.6194 14.1373 16.3242 14.4325L15.2431 15.5136C14.7479 15.9906 14.378 16.0269 13.8918 15.7839L8.21615 10.1083C7.97307 9.62201 8.00943 9.25215 8.48642 8.75691L9.56749 7.67584C9.86273 7.3806 10.108 7.07393 10.108 6.59477C10.108 6.13406 9.90115 5.84737 9.56749 5.5137L6.59455 2.54076C6.27788 2.2241 5.90551 1.9917 5.51348 2.00023Z" fill="#C51A1A" />
</svg>

const mail = <svg className={styles.adaptive} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.84653 5.43662C3.21707 5.15536 3.67243 5 4.14296 5H19.8572C20.3278 5 20.7831 5.15536 21.1537 5.43662L12.0001 11.2947L2.84653 5.43662ZM21.9375 6.63038C21.9786 6.79734 22 6.96878 22 7.14288V17.1429C22 17.7116 21.7741 18.2563 21.3723 18.6581C20.9705 19.0598 20.4259 19.2857 19.8571 19.2857H4.14286C3.5741 19.2857 3.02946 19.0598 2.62768 18.6581C2.2259 18.2563 2 17.7116 2 17.1429V7.14288C2 6.96877 2.02143 6.79735 2.0625 6.63038L11.6152 12.7447C11.85 12.8947 12.15 12.8947 12.3848 12.7447L21.9375 6.63038Z" fill="#C51A1A" />
</svg>

const white = <svg className={styles.whiteSvg} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V36C0 38.2091 1.79086 40 4 40H36C38.2091 40 40 38.2091 40 36V4C40 1.79086 38.2091 0 36 0H4Z" fill="#4D6887" />
    <path fillRule="evenodd" clipRule="evenodd" d="M27 14.4L25.6 13L20 18.6L14.4 13L13 14.4L18.6 20L13 25.6L14.4 27L20 21.4L25.6 27L27 25.6L21.4 20L27 14.4Z" fill="white" />
</svg>

const toggleMenu = <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 0C1.79086 0 0 1.79086 0 4V36C0 38.2091 1.79086 40 4 40H36C38.2091 40 40 38.2091 40 36V4C40 1.79086 38.2091 0 36 0H4Z" fill="#4D6887" />
    <path fillRule="evenodd" clipRule="evenodd" d="M11 26H29V24H11V26ZM11 21H29V19H11V21ZM11 14V16H29V14H11Z" fill="white" />
</svg>

const tg = <svg className={styles.tg} width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="120" fill="#1D93D2" />
    <path d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,30.255-29.492l31.525-60.89L81.737,118.6Z" fill="#C8DAEA" />
    <path d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763" fill="#A9C6D8" />
    <path d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z" fill="#FFF" />
</svg>


