import { createContext } from 'react'

import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    user: User | null;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
}


export const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true,
    user: null,
    isAuthenticated: false,
    signOut: async () => {}
});