import { createContext } from 'react'

export const AuthContext = createContext({
    session: null,
    loading: true,
    user: null,
    isAuthenticated: false,
    signOut: async () => {}
});