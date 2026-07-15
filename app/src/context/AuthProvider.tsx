import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.js';
import { AuthContext } from './AuthContext.js';

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Authentication termination fault:', error.message);
    };

    const user = session?.user ?? null;
    const isAuthenticated = !!session;

    return (
        <AuthContext.Provider 
            value={{ 
                session, 
                loading, 
                user, 
                isAuthenticated, 
                signOut: handleSignOut 
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
