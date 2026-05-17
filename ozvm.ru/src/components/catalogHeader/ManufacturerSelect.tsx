import { useEffect, useRef, useState } from 'react'
import styles from '../select/customSelect.module.css'

interface ManufacturerSelectProps {
    manufacturers: string[];
    selected: string;
    setSelected: (value: string) => void;
}

export default function ManufacturerSelect({ manufacturers, selected, setSelected }: ManufacturerSelectProps) {
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
    };

    const handleSelect = (manufacturer: string) => {
        setSelected(manufacturer === selected ? '' : manufacturer);
        setActive(false);
    };

    return (
        <div ref={selectorRef} onClick={open} className={styles.selectContainer}>
            <div className={styles.select}>
                <span className={selected ? styles.selected : ''}>{selected || 'Все производители'}</span>
                <svg className={active ? styles.icon : styles.none} width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.6 0.599976L6 5.19998L1.4 0.599976L0 1.99998L6 7.99998L12 1.99998L10.6 0.599976Z" fill="#C51A1A" />
                </svg>
            </div>
            <div className={active ? styles.selectOptionsTrue : styles.selectOptionsFalse}>
                <span className={styles.option1}>
                    <div onClick={() => handleSelect('')} className={styles.border}>
                        <span className={`${styles.hover} ${!selected ? styles.selected : ''}`}>Все производители</span>
                    </div>
                </span>
                {manufacturers.map((manufacturer, index) => (
                    <span key={index} className={styles.option2}>
                        <div onClick={() => handleSelect(manufacturer)} className={styles.border}>
                            <span className={`${styles.hover} ${selected === manufacturer ? styles.selected : ''}`}>{manufacturer}</span>
                        </div>
                    </span>
                ))}
            </div>
        </div>
    )
}




