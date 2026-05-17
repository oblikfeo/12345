'use client'
import {Provider as ReduxProvider} from 'react-redux'
import { ProviderChak } from "@/components/Toaster/provider";
import { store } from '../redux/store';


export const Provider = ({ children }: { children: React.ReactNode })=> {
    return (
        <ReduxProvider store={store}>

            <ProviderChak>{children}</ProviderChak>

        </ReduxProvider>
    )
}

