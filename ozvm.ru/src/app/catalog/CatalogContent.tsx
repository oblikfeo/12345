'use client'
import styles from "./page.module.css"
import CatalogHeader from "@/components/catalogHeader/catalogHeader";
import { useEffect, useState } from "react";
import ListCard from '../../components/listCard/listCard'
import SquareCard from '../../components/squareСard/squareCard'
import { toaster } from "@/components/Toaster/toaster"
import {axiosInstance, baseURL} from "../../api/__API__";
import { useDispatch } from "react-redux";
import { setUserData } from "@/redux/slices/userSlice";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import NoProducts from '@/components/noProducts/noProducts'

export default function CatalogContent({ slug, setSlug, clearSearchRef, resetAllFiltersRef }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const urlSlug = searchParams.get('slug');
        if (urlSlug) {
            setSlug(urlSlug);
        }
    }, [searchParams, setSlug]);

    const [productsFetch, setProductsFetch] = useState([])
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
    const [totalPage, setTotalPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [check, setCheck] = useState(false)

    const [find, setFind] = useState<string>(searchParams.get('query') || '')
    const [sortBy, setSortBy] = useState<string>(searchParams.get('order') || '')
    const [view, setView] = useState(searchParams.get('view') || 'list')
    const [manufacturer, setManufacturer] = useState<string>(searchParams.get('manufacturer') || '')

    const [isFirstRender, setIsFirstRender] = useState(true)

    const dispatch = useDispatch()

    // Функция полного сброса всех фильтров
    const resetAllFilters = () => {
        setSlug('');
        setFind('');
        setManufacturer('');
        setSortBy('');
        setCurrentPage(1);
        router.push('/catalog', { scroll: false });
    };

    // Сохраняем функцию сброса в ref для передачи в Login
    useEffect(() => {
        if (resetAllFiltersRef) {
            resetAllFiltersRef.current = resetAllFilters;
        }
    }, [resetAllFiltersRef, router])

    // Создаем clearSearch и сохраняем в ref для передачи в Login
    useEffect(() => {
        clearSearchRef.current = () => {
            setFind('');
        };
    }, [clearSearchRef, setFind])

    // При смене поиска, категории или производителя сбрасываем страницу
    useEffect(() => {
        setCurrentPage(1);
    }, [find, slug, manufacturer]);

    useEffect(() => {
        const params = new URLSearchParams();
        // Инвариант: активен либо query, либо slug
        if (find) {
            params.set('query', find);
        } else if (slug) {
            params.set('slug', slug);
        }
        if (sortBy) params.set('order', sortBy);
        if (view) params.set('view', view);
        if (manufacturer) params.set('manufacturer', manufacturer);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : '';
        router.push(`/catalog${newUrl}`, { scroll: false });
    }, [find, sortBy, slug, view, manufacturer, currentPage, router]);

    useEffect(() => {
        setCheck(true)
        axiosInstance.get('/api/v1/user', {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            dispatch(setUserData(response?.data))
        }).catch((error) => {
            if (error.status === 401) {
                localStorage.removeItem("USER_TOKEN")
                setCheck(false)
                redirect('/')
            }
        })
    }, [dispatch])

    useEffect(() => {
        setIsLoading(true)
        axiosInstance.get(getQueries(currentPage, find, sortBy, slug, manufacturer), {
            headers: { Authorization: `Bearer ${localStorage.getItem("USER_TOKEN")}` }
        }).then((response) => {
            setProductsFetch(response.data.data)
            setTotalPage(response.data.last_page)
        }).catch((error) => console.error(error))
            .finally(() => {
                setIsLoading(false)
                if (!isFirstRender) {
                    toaster.create({
                        title: "Каталог обновлен",
                        type: "success",
                        duration: 2000,
                    })
                }
                setIsFirstRender(false)
            })
    }, [currentPage, find, sortBy, slug, manufacturer, isFirstRender])

    useEffect(() => {
        if (productsFetch.length === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, productsFetch])

    const getQueries = (currentPage: number, find?: string, sortBy?: string, slug?: string, manufacturer?: string) => {
        let baseUrl = baseURL + `/api/v1/shop/products?`

        if (currentPage) {
            baseUrl += `page=${currentPage}`
        }
        if (find) {
            baseUrl += `&query=${find}`
        }
        if (sortBy) {
            baseUrl += `&order=${sortBy}`
        }
        // Если есть поисковая строка, категории не участвуют
        if (!find && slug) {
            baseUrl += `&slugs[]=${slug}`
        }
        if (manufacturer) {
            baseUrl += `&manufacturer=${encodeURIComponent(manufacturer)}`
        }
        return baseUrl
    }

    let viewCatalog;
    switch (view) {
        case "list":
            viewCatalog = (
                <ListCard productsFetch={productsFetch} currentPage={currentPage} totalPage={totalPage} setCurrentPage={setCurrentPage} />
            )
            break;

        case "square":
            viewCatalog = (
                <SquareCard productsFetch={productsFetch} currentPage={currentPage} totalPage={totalPage} setCurrentPage={setCurrentPage} />
            )
            break;
    }

    return (
        <>
            {check && <CatalogHeader
                setView={setView}
                setSortBy={setSortBy}
                setFind={setFind}
                setProductsFetch={setProductsFetch}
                setSlug={setSlug}
                setManufacturer={setManufacturer}
                initialFind={find}
                initialSortBy={sortBy}
                initialSlug={slug}
                initialView={view}
                initialManufacturer={manufacturer}
                resetAllFilters={resetAllFilters}
            />}
            {check && <div className={view === 'list' ? styles.list : styles.square}>
                {isLoading ? (
                    <span className={styles.load}>загрузка товаров...</span>
                ) : productsFetch.length === 0 ? (
                    <NoProducts />
                ) : (
                    viewCatalog
                )}
            </div>}
            {check && <div className={styles.footer}>
                <span className={styles.redline}>ЗооВетМир</span>
                <span className={styles.footerText}>ветеринарные препараты для всех видов животных</span>
            </div>}
        </>
    );
}

