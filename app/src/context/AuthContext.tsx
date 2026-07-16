import { createContext } from 'react';

import type { Session, User } from '@supabase/supabase-js';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export interface AuthContextType {
    session: Session | null;
    isLoading: boolean;
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<any>;
    register: (credentials: RegisterCredentials) => Promise<any>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);