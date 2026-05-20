import api from './api'
import type { User } from '../types'

interface LoginPayload   { email: string; password: string }
interface RegisterPayload { email: string; password: string; name?: string }
interface TokenResponse  { access_token: string; user_id: string; name: string | null }

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload)
    const user: User = { id: data.user_id, name: data.name, email: payload.email }
    return { token: data.access_token, user }
  },

  async register(payload: RegisterPayload): Promise<{ token: string; user: User }> {
    const { data } = await api.post<TokenResponse>('/auth/register', payload)
    const user: User = { id: data.user_id, name: data.name ?? null, email: payload.email }
    return { token: data.access_token, user }
  },
}
