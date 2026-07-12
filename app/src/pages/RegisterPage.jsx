import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
    const [ formData, setFormData ] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    })

    const [ errorMessage, setErrorMessage ] = useState('')
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value} = event.target

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        try {
            await register(formData)
            navigate('/login', { 
                replace: true,
                state: { successMessage: 'Account created successfully. Please log in.' }
            })
        
        } catch(error) {
            setErrorMessage(error.message || 'Unable to connect to the server.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                {errorMessage && <p role="alert">{errorMessage}</p>}

                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="passwordConfirm">Confirm Password</label>
                <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </main>
    )
}