export interface Product {
    id: number;
    name: string;
    price: number;
    subPrice: number;
    optPrice: number;
    purchasingPrice: number;
    title: string;
    quantity: number;
    manufacturer: string;
    country: string;
    category: string;
    minforbuy: string;
    form: string;
    forage: string;
    peculiarities: string;
    age: string;
    productcode: string;
    purpose: string;
    application: string;
    volume: string;
    compound: string;
    PriceForContrAgent1: number;
    PriceForContrAgent2: number;
    PriceForContrAgent3: number;
    PriceForContrAgent4: number;
    images: string;
    /** остаток с витрины / API каталога */
    rests?: number;
}