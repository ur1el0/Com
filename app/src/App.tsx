import { Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { RequireAuth } from './components/RequireAuth.js'
import { GuestOnlyRoute } from './components/GuestOnlyRoute.js'
import { useAuth } from './hooks/useAuth.js'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        } 
      />
      <Route 
        path="/login" 
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        } 
      />
    </Routes>
  )
}

export default App