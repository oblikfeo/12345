'use client'
import styles from "./page.module.css"
import Login from "@/components/login/login";
import { useState, useRef } from "react";
import { Toaster } from "@/components/Toaster/toaster"
import Paw1 from "@/components/UI kit/paws1/paws"
import Paw2 from "@/components/UI kit/paws2/paws"
import Paw3 from "@/components/UI kit/paws3/paws"
import Paw4 from "@/components/UI kit/paws4/paws"
import Paw5 from "@/components/UI kit/paws5/paws"
import CatalogContent from './CatalogContent'

export default function CatalogClient() {
    const [slug, setSlug] = useState<string>('')
    const clearSearchRef = useRef<(() => void) | null>(null)
    const resetAllFiltersRef = useRef<(() => void) | null>(null)

    return (
        <div className={styles.flexContainer}>
            <Login setSlug={setSlug} clearSearchRef={clearSearchRef} resetAllFiltersRef={resetAllFiltersRef} />
            <div className={styles.flex}>
                <Paw1 />
                <Paw2 />
                <Paw3 />
                <Paw4 />
                <Paw5 />
                <CatalogContent setSlug={setSlug} slug={slug} clearSearchRef={clearSearchRef} resetAllFiltersRef={resetAllFiltersRef} />
            </div>
            <Toaster />
        </div>
    );
}

