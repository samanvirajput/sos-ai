import api from './api'
import type { ChatResponse, Conversation, MemoryItem, Message } from '../types'

export const chatService = {
  async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>('/chat', {
      message,
      conversation_id: conversationId ?? null,
    })
    return data
  },

  async getConversations(): Promise<Conversation[]> {
    const { data } = await api.get<{ conversations: Conversation[] }>('/chat/conversations')
    return data.conversations
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data } = await api.get<{ messages: Message[] }>(
      `/chat/conversations/${conversationId}/messages`
    )
    return data.messages
  },

  streamMessage(
    message: string,
    conversationId: string | undefined,
    onToken: (token: string) => void,
    onDone: (meta: { conversation_id: string; emotion: unknown; safety_level: string }) => void,
    onError: (err: Error) => void
  ): () => void {
    const token = localStorage.getItem('sos_token')
    const body = JSON.stringify({ message, conversation_id: conversationId ?? null })

    const controller = new AbortController()

    fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
      signal: controller.signal,
    })
      .then(async (res) => {
        const reader = res.body?.getReader()
        if (!reader) return
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value)
          const lines = text.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'token') onToken(parsed.text)
              if (parsed.type === 'done') onDone(parsed)
            } catch {
              // partial line — skip
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err)
      })

    return () => controller.abort()
  },

  async getMemories(query: string, topK = 10): Promise<MemoryItem[]> {
    const { data } = await api.get<{ memories: MemoryItem[] }>('/memory', {
      params: { query, top_k: topK },
    })
    return data.memories
  },

  async deleteMemory(id: string): Promise<void> {
    await api.delete(`/memory/${id}`)
  },
}
