'use client'
import { useUser } from "@clerk/nextjs"
import { createContext, useContext } from 'react' // ✅ correct import

export const AppContext = createContext(); // ✅ fixed typo

export const useAppContext = () => {
    return useContext(AppContext);
}

export const AppContextProvider = ({ children }) => {
    const { user } = useUser();

    const value = {
        user
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
