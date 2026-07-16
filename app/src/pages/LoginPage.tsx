import React, { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import type { LoginCredentials } from '../context/AuthContext.js';

export function LoginPage() {
    const [formData, setFormData] = useState<LoginCredentials>({ 
        email: '', 
        password: '' 
    });
    
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData((current: LoginCredentials) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await login(formData); 
            navigate('/', { replace: true });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unable to connect to the server.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                {errorMessage && <p role="alert">{errorMessage}</p>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </main>
    );
}