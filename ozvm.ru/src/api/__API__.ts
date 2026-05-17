import axios from 'axios';


export const baseURL = 'https://api.ozvm.ru';

export const axiosInstance = axios.create({
    baseURL: baseURL
});