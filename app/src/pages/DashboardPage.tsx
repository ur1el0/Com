import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export function DashboardPage() {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <main>
            <h1>Dashboard</h1>
            {user && <p>Welcome, {user.email}!</p>}
            <button onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
        </main>
    );
}