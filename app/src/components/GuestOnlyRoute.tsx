import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

interface GuestOnlyRouteProps {
    children: ReactNode;
}

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}