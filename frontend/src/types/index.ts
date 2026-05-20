export interface User {
  id: string
  name: string | null
  email: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export interface Emotion {
  emotion: string
  confidence: number
  intensity: number
  all_scores: Record<string, number>
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sentiment: Partial<Emotion>
  created_at: string
}

export interface Conversation {
  id: string
  started_at: string
  message_count: number
  last_message_preview: string | null
}

export interface ChatResponse {
  response: string
  conversation_id: string
  emotion: Emotion
  safety_level: 'safe' | 'warning' | 'crisis'
  memories_used: number
}

export interface MemoryItem {
  id: string
  content: string
  role: string
  sentiment: Partial<Emotion>
  created_at: string
  similarity: number
}

export type SafetyLevel = 'safe' | 'warning' | 'crisis'
