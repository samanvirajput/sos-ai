import { create } from 'zustand'
import type { User } from '../types'

interface AuthStore {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

const storedToken = localStorage.getItem('sos_token')
const storedUser  = localStorage.getItem('sos_user')

export const useAuthStore = create<AuthStore>((set) => ({
  token:           storedToken,
  user:            storedUser ? (JSON.parse(storedUser) as User) : null,
  isAuthenticated: !!storedToken,

  setAuth: (token, user) => {
    localStorage.setItem('sos_token', token)
    localStorage.setItem('sos_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('sos_token')
    localStorage.removeItem('sos_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
