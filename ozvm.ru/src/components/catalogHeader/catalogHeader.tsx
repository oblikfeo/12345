'use client'
import styles from './catalogHeader.module.css'
import Image from 'next/image';
import logo from '../../../img/miniLogo.svg'
import CustomSelect from '../select/customSelect'
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectTotalQuantity } from '@/redux/slices/cartSlice';
import CategoryAdaptive from '../categoryAdaptive/category';
import { useMediaPredicate } from 'react-media-hook'
import CategoryMobile from '../categoryMobile/category';
import wa from '../../../img/whatsapp.png'
import { axiosInstance } from '@/api/__API__';
import ManufacturerSelect from './ManufacturerSelect';


interface Props {
    setView: (value: string) => void;
    setProductsFetch: (value: []) => void;
    setSortBy: (value: string) => void;
    setFind: (value: string) => void;
    setSlug: (value: string) => void;
    setManufacturer?: (value: string) => void;
    resetAllFilters?: () => void;
    // Очистка строки поиска при выборе категории
    // (может быть реализована через setFind('') в родителе)
    initialFind?: string;
    initialSortBy?: string;
    initialSlug?: string;
    initialView?: string;
    initialManufacturer?: string;
}


function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

export default function CatalogHeader({
    setView,
    setSortBy,
    setFind,
    setSlug,
    setManufacturer,
    resetAllFilters,
    initialFind = '',
    initialSortBy = 'По умолчанию',
    initialView = 'list',
    initialManufacturer = ''
}: Props) {
    const totalQuantity = useSelector(selectTotalQuantity)

    const [borderList, setBorderList] = useState(initialView === 'list')
    const [borderSquare, setBorderSquare] = useState(initialView === 'square')
    const [catalogButtonIpad, setCatalogButtonIpad] = useState(true)
    const [inputText, setInputText] = useState(initialFind)
    const [select, setSelect] = useState(initialSortBy)
    const [manufacturerSelect, setManufacturerSelect] = useState(initialManufacturer)
    const [manufacturers, setManufacturers] = useState<string[]>([])
    const [manufacturerModalOpen, setManufacturerModalOpen] = useState(false)

    // Загрузка списка производителей
    useEffect(() => {
        axiosInstance.get('/api/v1/shop/manufacturers', {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            setManufacturers(response.data || []);
        }).catch((error) => console.error(error));
    }, []);

    // Инициализация значений из пропсов
    useEffect(() => {
        setInputText(initialFind || '');
        // Правильно определяем текст для селекта сортировки
        const sortByText = initialSortBy === 'price' ? 'По цене' : initialSortBy === 'title' ? 'По алфавиту' : 'По умолчанию';
        setSelect(sortByText);
        setManufacturerSelect(initialManufacturer || '');
        const view = initialView || 'list';
        setView(view);
        setBorderList(view === 'list');
        setBorderSquare(view === 'square');
    }, [initialFind, initialSortBy, initialView, initialManufacturer, setView])

    const onResize = () => {
        if (window.screen.width < 800) {
            setView('square')
            setBorderList(false)
            setBorderSquare(true)
        }
    }

    useEffect(() => {
        if (window.screen.width < 700) {
            setView('square')
            setBorderList(false)
            setBorderSquare(true)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    const isSmallScreen = useMediaPredicate("(max-width: 700px)")
    const isLargeScreen = useMediaPredicate("(min-width: 700px)")

    const debouncedFetchByText = useCallback(
        debounce((text) => {
            setFind(text || '');
        }, 500),
        []
    );

    useEffect(() => {
        debouncedFetchByText(inputText);
    }, [inputText, debouncedFetchByText]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputText(value);
    };

    // Очистка поиска локально и в родителе
    // Вызываем setFind сразу, без debounce, чтобы очистка была мгновенной
    const clearSearch = useCallback(() => {
        setInputText('');
        setFind(''); // Сразу очищаем без debounce
    }, [setFind]);

    let text = ""

    if (isSmallScreen) {
        text = "Каталог"
    } else if (isLargeScreen) {
        text = "Добро пожаловать в каталог"
    }

    const selectList = () => {
        if (!borderList) {
            setBorderList(!borderList)
            setBorderSquare(!borderSquare)
        }
    }

    const selectSquare = () => {
        if (!borderSquare) {
            setBorderList(!borderList)
            setBorderSquare(!borderSquare)
        }
    }

    return (
        <div className={styles.welcomeContainer}>
            <Link href="/catalog">
                <Image className={styles.logo} src={logo} alt='' />
            </Link>
            <div className={styles.header}>

                <div className={styles.contacts}>
                    <div className={totalQuantity === 0 ? "" : styles.totalQuantity}>
                        <span>{totalQuantity === 0 ? "" : totalQuantity}</span>
                    </div>
                    <a className={styles.link1} href="https://t.me/zoovetmir" target="_blank">
                        {tg}
                        <div className={styles.font2}>Мы в Telegram</div>
                    </a>
                    <a className={styles.link1} href="https://wa.me/79048299202" target="_blank">
                        <Image src={wa} alt='' width={24} height={24} />
                        <span className={styles.font2}>Перейти в чат</span>
                    </a>
                    <a className={styles.link1} href="tel:+79048299202">
                        {tel}
                        <span className={styles.font}>+7 904 829‑92‑02</span>
                    </a>
                    <Link className={styles.lkimg} href="/lk">
                        {lkImg}
                    </Link>
                    <Link className={styles.lkimg} href="/basket">
                        {basketImg}{totalQuantity === 0 ? "" : basketImg2}
                    </Link>
                    <a className={styles.link2} href="mailto:info@ozvm.ru">
                        {mail}
                        <span className={styles.font}>info@ozvm.ru</span>
                    </a>
                </div>
            </div>
            <div className={styles.hello}>
                <div className={styles.container}>
                    <div className={styles.sideA}></div>
                    <div className={styles.sideB}></div>
                    <div className={styles.text}><span>{text}</span></div>
                </div>
                <div className={styles.menu}>
                    <div className={styles.search}>
                        <input
                            onChange={handleSearchChange}
                            className={styles.input}
                            type="text"
                            placeholder='Поиск'
                            value={inputText}
                        />
                        <svg className={styles.searchImg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.00059 8.99975C2.00059 5.13465 5.13467 2.00057 8.99977 2.00057C12.8658 2.00057 15.9999 5.13465 15.9999 8.99975C15.9999 10.8831 15.2555 12.5932 14.0462 13.8512C14.0106 13.8784 13.9759 13.9084 13.9431 13.9412C13.9103 13.974 13.8803 14.0087 13.8531 14.0443C12.595 15.2556 10.8841 15.9999 8.9997 15.9999C5.1346 15.9999 2.00059 12.8658 2.00059 8.99975ZM14.619 16.0308C13.0787 17.2627 11.1259 17.9995 8.99977 17.9995C4.02926 17.9995 0 13.9703 0 8.99977C0 4.02926 4.02926 0 8.99977 0C13.9703 0 17.9995 4.02926 17.9995 8.99977C17.9995 11.1241 17.2636 13.0768 16.0327 14.6161L19.7075 18.2909C20.0975 18.6818 20.0975 19.3146 19.7075 19.7055C19.3166 20.0955 18.6838 20.0955 18.2929 19.7055L14.619 16.0308Z" fill="#C51A1A" />
                        </svg>
                    </div>

                    <CustomSelect
                        select={select}
                        setSelect={setSelect}
                        setSortBy={setSortBy}
                    />

                    <ManufacturerSelect
                        manufacturers={manufacturers}
                        selected={manufacturerSelect}
                        setSelected={(value) => {
                            setManufacturerSelect(value);
                            if (setManufacturer) {
                                setManufacturer(value);
                            }
                        }}
                    />

                    <button
                        className={styles.manufacturerButton}
                        onClick={() => { setManufacturerModalOpen(true) }}>
                        {newsort}
                    </button>
                    <button
                        onClick={() => { setCatalogButtonIpad(!catalogButtonIpad) }}>
                        {catalogButtonIpad ? disableCatalog : activeCatalog}
                    </button>
                    <button
                        className={`${styles.view} ${borderList ? styles.borderTrue : styles.borderFalse}`}
                        onClick={() => {
                            setView('list');
                            selectList();
                        }}>
                        {listImg}
                    </button>
                    <button
                        className={`${styles.view} ${borderSquare ? styles.borderTrue : styles.borderFalse}`}
                        onClick={() => {
                            setView('square')
                            selectSquare();
                        }}>
                        {squareImg}
                    </button>
                </div>
            </div>
            {!catalogButtonIpad && (
                <CategoryAdaptive
                    setCatalogButtonIpad={setCatalogButtonIpad}
                    setSlug={setSlug}
                    clearSearch={clearSearch}
                    resetAllFilters={resetAllFilters}
                />
            )}
            {!catalogButtonIpad && (
                <CategoryMobile
                    setCatalogButtonIpad={setCatalogButtonIpad}
                    setSlug={setSlug}
                    setSortBy={setSortBy}
                    clearSearch={clearSearch}
                    resetAllFilters={resetAllFilters}
                />
            )}
            {manufacturerModalOpen && (
                <div className={styles.manufacturerModalOverlay} onClick={() => setManufacturerModalOpen(false)}>
                    <div className={styles.manufacturerModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.manufacturerModalHeader}>
                            <h3>Выберите производителя</h3>
                            <button className={styles.manufacturerModalClose} onClick={() => setManufacturerModalOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="#C51A1A" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className={styles.manufacturerModalContent}>
                            <div 
                                className={`${styles.manufacturerModalOption} ${!manufacturerSelect ? styles.manufacturerModalOptionSelected : ''}`}
                                onClick={() => {
                                    setManufacturerSelect('');
                                    if (setManufacturer) {
                                        setManufacturer('');
                                    }
                                    setManufacturerModalOpen(false);
                                }}
                            >
                                Все производители
                            </div>
                            {manufacturers.map((manufacturer, index) => (
                                <div 
                                    key={index}
                                    className={`${styles.manufacturerModalOption} ${manufacturerSelect === manufacturer ? styles.manufacturerModalOptionSelected : ''}`}
                                    onClick={() => {
                                        setManufacturerSelect(manufacturer);
                                        if (setManufacturer) {
                                            setManufacturer(manufacturer);
                                        }
                                        setManufacturerModalOpen(false);
                                    }}
                                >
                                    {manufacturer}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const tel = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.51348 2.00023C4.98112 2.01182 4.75082 2.17686 4.43241 2.54076L2.54053 4.7029C2.1451 5.15483 2 5.85953 2 6.59477C2 9.0496 3.84676 13.0354 7.40535 16.5947C10.9646 20.1533 14.9504 22 17.4052 22C18.1405 22 18.8452 21.8549 19.2971 21.4595L21.4593 19.5676C21.8231 19.2492 21.9882 19.0189 21.9998 18.4865C22.0083 18.0945 21.7759 17.7221 21.4593 17.4055L18.4863 14.4325C18.1527 14.0989 17.8659 13.892 17.4052 13.892C16.9261 13.892 16.6194 14.1373 16.3242 14.4325L15.2431 15.5136C14.7479 15.9906 14.378 16.0269 13.8918 15.7839L8.21615 10.1083C7.97307 9.62201 8.00943 9.25215 8.48642 8.75691L9.56749 7.67584C9.86273 7.3806 10.108 7.07393 10.108 6.59477C10.108 6.13406 9.90115 5.84737 9.56749 5.5137L6.59455 2.54076C6.27788 2.2241 5.90551 1.9917 5.51348 2.00023Z" fill="#C51A1A" />
</svg>

const mail = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.84653 5.43662C3.21707 5.15536 3.67243 5 4.14296 5H19.8572C20.3278 5 20.7831 5.15536 21.1537 5.43662L12.0001 11.2947L2.84653 5.43662ZM21.9375 6.63038C21.9786 6.79734 22 6.96878 22 7.14288V17.1429C22 17.7116 21.7741 18.2563 21.3723 18.6581C20.9705 19.0598 20.4259 19.2857 19.8571 19.2857H4.14286C3.5741 19.2857 3.02946 19.0598 2.62768 18.6581C2.2259 18.2563 2 17.7116 2 17.1429V7.14288C2 6.96877 2.02143 6.79735 2.0625 6.63038L11.6152 12.7447C11.85 12.8947 12.15 12.8947 12.3848 12.7447L21.9375 6.63038Z" fill="#C51A1A" />
</svg>

const basketImg = <svg className={styles.basketImg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.2857 7.85695H15.3616L12.474 2.85694L12.4731 2.85962L10.8249 5.71494L12.0616 7.85691H7.93835L11.2366 2.14353C11.4268 1.81496 11.4777 1.42479 11.3804 1.05871C11.2822 0.692626 11.0429 0.381037 10.7143 0.191734C10.3857 0.00155577 9.99646 -0.0493403 9.63038 0.048877C9.2643 0.147092 8.95179 0.386386 8.76251 0.714958L4.63931 7.85691H0.714277C0.524993 7.85691 0.342848 7.93191 0.208928 8.06584C0.074999 8.19977 0 8.3819 0 8.57119V9.99976C0 10.189 0.074999 10.3712 0.208928 10.5051C0.342858 10.639 0.524997 10.714 0.714277 10.714H1.5375L2.86696 18.6882C2.92411 19.0329 3.22233 19.2855 3.57142 19.2855H16.4286C16.7777 19.2855 17.0759 19.0329 17.133 18.6882L18.4625 10.714H19.2857C19.475 10.714 19.6572 10.639 19.7911 10.5051C19.925 10.3712 20 10.189 20 9.99976V8.57119C20 8.3819 19.925 8.19976 19.7911 8.06584C19.6571 7.93191 19.475 7.85695 19.2857 7.85695ZM6.54649 16.4186C6.5072 16.4257 6.46792 16.4284 6.42774 16.4284C6.07864 16.4284 5.78131 16.1757 5.72417 15.8311L5.00989 11.5453C4.94471 11.1561 5.2081 10.7882 5.59738 10.7239C5.98666 10.6587 6.35453 10.9221 6.41882 11.3114L7.13311 15.5971C7.1974 15.9855 6.93488 16.3534 6.54649 16.4186ZM10.7143 15.7141C10.7143 16.1088 10.3946 16.4284 9.99998 16.4284C9.60532 16.4284 9.28569 16.1088 9.28569 15.7141V11.4284C9.28569 11.0337 9.60532 10.7141 9.99998 10.7141C10.3946 10.7141 10.7143 11.0337 10.7143 11.4284V15.7141ZM14.2759 15.8311C14.2187 16.1757 13.9214 16.4275 13.5723 16.4284C13.5321 16.4284 13.4928 16.4257 13.4535 16.4186C13.0652 16.3534 12.8026 15.9855 12.8669 15.5971L13.5812 11.3114C13.6455 10.9221 14.0134 10.6587 14.4027 10.7239C14.792 10.7882 15.0554 11.156 14.9902 11.5454L14.2759 15.8311Z" fill="#C51A1A" />
</svg>

const basketImg2 = <svg className={styles.basketImg2} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle opacity="0.2" cx="20" cy="20" r="14" fill="#C51A1A" />
    <circle opacity="0.2" cx="20" cy="20" r="20" fill="#C51A1A" />
</svg>

const lkImg = <svg className={styles.lkimg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99992 20C6.93302 20 4.19946 18.6224 2.3559 16.4444C2.28906 16.3776 2.24479 16.3333 2.20052 16.2665C0.822046 14.5555 0 12.3776 0 10C0 4.48868 4.48868 0 10 0C15.5114 0 20 4.48868 20 10C20 12.3776 19.178 14.5556 17.7778 16.2665C17.7336 16.3333 17.6893 16.4002 17.6224 16.4444C15.8004 18.6224 13.0668 20 9.99992 20ZM9.99992 11.5998C12.6224 11.5998 15.0884 12.5998 16.9557 14.4002C17.7552 13.1337 18.2222 11.6224 18.2222 9.99998C18.2222 5.46708 14.5329 1.77773 9.99996 1.77773C5.46706 1.77773 1.77772 5.46708 1.77772 9.99998C1.77772 11.6224 2.24474 13.1338 3.04421 14.4002C4.91139 12.5998 7.37747 11.5998 9.99992 11.5998ZM9.99992 9.99993C8.15529 9.99993 6.66658 8.51122 6.66658 6.66659C6.66658 4.82196 8.15529 3.33325 9.99992 3.33325C11.8445 3.33325 13.3333 4.82196 13.3333 6.66659C13.3333 8.51122 11.8445 9.99993 9.99992 9.99993Z" fill="#C51A1A" />
</svg>

const listImg = <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M0 12H18V10H0V12ZM0 7H18V5H0V7ZM0 0V2H18V0H0Z" fill="#264794" />
</svg>

const squareImg = <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M0 4H4V0H0V4ZM6 16H10V12H6V16ZM0 16H4V12H0V16ZM0 10H4V6H0V10ZM6 10H10V6H6V10ZM12 0V4H16V0H12ZM6 4H10V0H6V4ZM12 10H16V6H12V10ZM12 16H16V12H12V16Z" fill="#040D23" />
</svg>

const disableCatalog = <svg className={styles.catalogButton} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="4" fill="white" />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.4419 13.7469C10.7033 13.7469 10.1047 14.3456 10.1047 15.0841V28.1251C10.1047 28.8636 10.7033 29.4624 11.4419 29.4624H28.5581C29.2967 29.4624 29.8953 28.8636 29.8953 28.1251V19.4651C29.8953 18.7266 29.2967 18.1279 28.5581 18.1279H21.0849C20.1472 18.1279 19.2657 17.6809 18.7117 16.9246L16.7846 14.2939C16.5327 13.9501 16.132 13.7469 15.7058 13.7469H11.4419ZM8.5 15.0841C8.5 13.4594 9.81712 12.1423 11.4419 12.1423H15.7058C16.6435 12.1423 17.5249 12.5892 18.079 13.3456L20.0061 15.9763C20.258 16.3201 20.6587 16.5233 21.0849 16.5233H28.5581C30.1829 16.5233 31.5 17.8404 31.5 19.4651V28.1251C31.5 29.7499 30.1829 31.067 28.5581 31.067H11.4419C9.81712 31.067 8.5 29.7499 8.5 28.1251V15.0841Z" fill="#C51A1A" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.1047 9.73531C10.1047 9.2922 10.4639 8.93298 10.907 8.93298H17.3105C18.2481 8.93298 19.1296 9.37994 19.6837 10.1363L21.6107 12.767C21.8627 13.1108 22.2633 13.3139 22.6895 13.3139H30.1628C30.6059 13.3139 30.9651 13.6732 30.9651 14.1163C30.9651 14.5594 30.6059 14.9186 30.1628 14.9186H22.6895C21.7519 14.9186 20.8704 14.4716 20.3163 13.7153L18.3893 11.0846C18.1373 10.7408 17.7367 10.5376 17.3105 10.5376H10.907C10.4639 10.5376 10.1047 10.1784 10.1047 9.73531Z" fill="#C51A1A" />
</svg>

const activeCatalog = <svg className={styles.catalogButton} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="4" fill="#C51A1A" />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.4419 13.7471C10.7033 13.7471 10.1047 14.3457 10.1047 15.0843V28.1253C10.1047 28.8637 10.7033 29.4625 11.4419 29.4625H28.5581C29.2967 29.4625 29.8953 28.8637 29.8953 28.1253V19.4652C29.8953 18.7267 29.2967 18.128 28.5581 18.128H21.0849C20.1472 18.128 19.2657 17.6811 18.7117 16.9247L16.7846 14.294C16.5327 13.9502 16.132 13.7471 15.7058 13.7471H11.4419ZM8.5 15.0843C8.5 13.4595 9.81712 12.1424 11.4419 12.1424H15.7058C16.6435 12.1424 17.5249 12.5894 18.079 13.3458L20.0061 15.9764C20.258 16.3202 20.6587 16.5234 21.0849 16.5234H28.5581C30.1829 16.5234 31.5 17.8405 31.5 19.4652V28.1253C31.5 29.75 30.1829 31.0671 28.5581 31.0671H11.4419C9.81712 31.0671 8.5 29.75 8.5 28.1253V15.0843Z" fill="white" />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.1047 9.73543C10.1047 9.29232 10.4639 8.93311 10.907 8.93311H17.3105C18.2481 8.93311 19.1296 9.38007 19.6837 10.1365L21.6107 12.7671C21.8627 13.1109 22.2633 13.3141 22.6895 13.3141H30.1628C30.6059 13.3141 30.9651 13.6733 30.9651 14.1164C30.9651 14.5595 30.6059 14.9187 30.1628 14.9187H22.6895C21.7519 14.9187 20.8704 14.4718 20.3163 13.7154L18.3893 11.0847C18.1373 10.7409 17.7367 10.5378 17.3105 10.5378H10.907C10.4639 10.5378 10.1047 10.1785 10.1047 9.73543Z" fill="white" />
</svg>

const tg = <svg className={styles.tg} width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="120" fill="#1D93D2" />
    <path d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,30.255-29.492l31.525-60.89L81.737,118.6Z" fill="#C8DAEA" />
    <path d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763" fill="#A9C6D8" />
    <path d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z" fill="#FFF" />
</svg>

const newsort = <svg width="24px" height="24px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.5 1C3.29052 1 2.28165 1.85888 2.05001 3L3.21071e-06 3L3.167e-06 4H2.05001C2.28165 5.14112 3.29052 6 4.5 6C5.70948 6 6.71836 5.14112 6.94999 4L15 4V3L6.94999 3C6.71836 1.85888 5.70948 1 4.5 1Z" fill="#C51A1A"></path> <path d="M10.5 9C9.29053 9 8.28165 9.85888 8.05001 11H2.86102e-06L3.77099e-06 12H8.05001C8.28165 13.1411 9.29052 14 10.5 14C11.7095 14 12.7184 13.1411 12.95 12L15 12V11L12.95 11C12.7184 9.85888 11.7095 9 10.5 9Z" fill="#C51A1A"></path> </g></svg>