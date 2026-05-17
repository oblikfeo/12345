import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface IUser {
    id?: number,
    name?: string,
    email?: string,
    phone?: string,
    address?: string,
    token?: string
}

type UserType = {
    user: IUser
}
const initialState: UserType = {
    user: {}
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData(state, action: PayloadAction<IUser>) {
            state.user = action.payload
        },
        clearData(state) {
            state.user = initialState.user
        }
    },
});

export const { setUserData, clearData } = userSlice.actions;

export const getUserData = (state: RootState) => state?.user?.user;

export default userSlice.reducer;