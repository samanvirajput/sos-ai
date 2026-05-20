import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await authService.login({ email, password })
      setAuth(token, user)
      navigate('/chat')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await authService.register({ email, password, name })
      setAuth(token, user)
      navigate('/chat')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearAuth()
    navigate('/')
  }

  return { login, register, logout, loading, error, isAuthenticated, user }
}
