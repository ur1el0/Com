import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
        <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
            {/* Header / Navbar */}
            <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 w-full py-4 px-6 md:px-12 flex justify-between items-center mb-8">
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Com</span>
                    <span className="text-slate-500 font-normal">/</span>
                    <span className="text-slate-300 text-sm font-medium">Student Dashboard</span>
                </h1>
                <div className="flex items-center gap-6">
                    {user && (
                        <p className="text-slate-400 text-sm hidden sm:block">
                            Welcome, <span className="font-semibold text-slate-100">{user.email}</span>
                        </p>
                    )}
                    <button 
                        onClick={handleLogout} 
                        disabled={isLoggingOut}
                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-medium py-1.5 px-4 rounded transition-all disabled:opacity-50 text-xs cursor-pointer"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </header>

            {/* Grid Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {children}
            </div>
        </main>
    );
}
