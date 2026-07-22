import React, { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase.js';
import { AuthContext, type AuthContextType, type LoginCredentials, type RegisterCredentials } from './AuthContext.js';
import type { Session, User } from '@supabase/supabase-js';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // 1. Fetch initial session on mount
        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error fetching initial session:', error);
            } finally {
                setIsLoading(false);
            }
        }

        getInitialSession();

        // 2. Listen to authentication state changes (login, logout, token refresh, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // 3. Clean up the listener when the component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function login(credentials: LoginCredentials) {
        const { error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
    }

    async function register(credentials: RegisterCredentials) {
        if (credentials.password !== credentials.passwordConfirm) {
            throw new Error("Passwords do not match");
        }
        const { error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    username: credentials.username,
                },
            },
        });
        if (error) throw error;
    }

    async function logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    const value: AuthContextType = {
        session,
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}