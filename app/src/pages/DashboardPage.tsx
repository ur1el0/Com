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
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-lg p-6 shadow-xl flex flex-col items-center gap-5 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                {user && (
                    <p className="text-slate-350 text-sm">
                        Welcome, <span className="font-semibold text-slate-100">{user.email}</span>!
                    </p>
                )}
                <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer"
                >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </div>
        </main>
    );
}