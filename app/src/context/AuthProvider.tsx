import React, { useEffect, useState } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.js';
import { AuthContext, type AuthContextType, type LoginCredentials, type RegisterCredentials } from './AuthContext.js';

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
            setSession(currentSession);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (credentials: LoginCredentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
        return data;
    };

    const handleRegister = async (credentials: RegisterCredentials) => {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    username: credentials.username,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const user = session?.user ?? null;
    const isAuthenticated = !!session;

    const contextValue: AuthContextType = {
        session,
        isLoading,
        user,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        signOut: handleSignOut,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
