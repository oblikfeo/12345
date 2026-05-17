import { useEffect, useRef, useState } from 'react'
import styles from './customSelect.module.css'

export default function CustomSelect({ select, setSelect, setSortBy }) {
    const [active, setActive] = useState(false)
    const selectorRef = useRef(null)

    const handleClickOutside = (event) => {
        if (selectorRef.current && !selectorRef.current.contains(event.target)) {
            setActive(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const open = () => {
        setActive(!active);
    }

    const isDefault = select === 'По умолчанию';
    const isPrice = select === 'По цене';
    const isTitle = select === 'По алфавиту';

    return (
        <div ref={selectorRef} onClick={open} className={styles.selectContainer}>
            <div className={styles.select}>
                <span className={!isDefault ? styles.selected : ''}>{select}</span>
                <svg className={active ? styles.icon : styles.none} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.6 0.599976L6 5.19998L1.4 0.599976L0 1.99998L6 7.99998L12 1.99998L10.6 0.599976Z" fill="#C51A1A" />
                </svg>
            </div>
            <div className={active ? styles.selectOptionsTrue : styles.selectOptionsFalse}>
                <span className={styles.option1}>
                    <div onClick={() => {
                        setSelect('По умолчанию')
                        setSortBy('')
                    }} className={styles.border}>
                        <span className={`${styles.hover} ${isDefault ? styles.selected : ''}`}>По умолчанию</span>
                    </div>
                </span>
                <span className={styles.option2}>
                    <div onClick={() => {
                        setSelect('По цене')
                        setSortBy('price')
                    }} className={styles.border}>
                        <span className={`${styles.hover} ${isPrice ? styles.selected : ''}`}>По цене</span>
                    </div>
                </span>
                <span className={styles.option2}>
                    <div onClick={() => {
                        setSelect('По алфавиту')
                        setSortBy('title')
                    }} className={styles.border}>
                        <span className={`${styles.hover} ${isTitle ? styles.selected : ''}`}>По алфавиту</span>
                    </div>
                </span>
            </div>
        </div>
    )
}