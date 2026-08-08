import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSubjects } from '../hooks/useSubjects.js'

export function DashboardPage() {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const { subjects, isLoading, error } = useSubjects();

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
                <div className="w-full flex flex-col items-stretch text-left gap-3 my-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Subjects</h2>

                    {isLoading ? (
                        <p className="text-slate-500 text-sm italic text-center">Loading...</p>
                    ) : error ? (
                        <p className='text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center'>{error}</p>
                    ) : subjects.length === 0 ? (
                        <p className='text-slate-500 text-sm italic text-center'>No subjects yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {subjects.map((subject) => (
                                <li key={subject.id} className="bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-sm flex justify-between items-center">
                                    <span className="font-medium text-slate-200">{subject.name}</span>
                                    {subject.grade && (
                                        <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-semibold">
                                            {subject.grade}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    );
}