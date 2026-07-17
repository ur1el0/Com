import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import type { RegisterCredentials } from '../context/AuthContext.js';

export function RegisterPage() {
    const [formData, setFormData] = useState<RegisterCredentials>({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData((currentFormData: RegisterCredentials) => ({
            ...currentFormData,
            [name]: value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await register(formData);
            navigate('/login', {
                replace: true,
                state: { successMessage: 'Account created successfully. Please log in.' },
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to connect to the server.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800/80 rounded-lg p-6 shadow-xl">
                <h1 className="text-xl font-bold mb-5 text-white">Register</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {errorMessage && (
                        <p role="alert" className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="username" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                        <input
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            autoComplete="new-password"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50 text-sm mt-2 cursor-pointer"
                    >
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </main>
    );
}