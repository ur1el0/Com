import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '' 
    })
    
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const { login } = useAuth()
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        try {
            await login(formData)
            navigate('/', { replace: true })
        } catch(error) {
            setErrorMessage(error.message || 'Unable to connect to the server.')
        } finally {
            setIsSubmitting(false)
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
  )
}
