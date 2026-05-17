"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider, type ColorModeProviderProps, } from "./color-mode"
import {useAppDispatch} from "@/redux/hook";
import {useEffect} from "react";
import {loadCartState} from "@/redux/thunks/cartThunks";

export function ProviderChak(props: ColorModeProviderProps) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(loadCartState());
    }, []);
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider enableSystem={false} {...props} />
    </ChakraProvider>
  )
}
