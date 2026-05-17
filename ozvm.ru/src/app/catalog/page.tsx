import { Suspense } from 'react';
import CatalogClient from './CatalogClient'

export const dynamic = 'force-dynamic'

export default function Catalog() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <CatalogClient />
        </Suspense>
    );
}
