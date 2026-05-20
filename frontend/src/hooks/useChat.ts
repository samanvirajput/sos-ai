import { useCallback, useEffect, useRef, useState } from 'react'
import { chatService } from '../services/chatService'
import type { Conversation, Emotion, Message } from '../types'

interface StreamingState {
  isStreaming: boolean
  streamText: string
}

export function useChat(conversationId?: string) {
  const [messages, setMessages]       = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [streaming, setStreaming]     = useState<StreamingState>({ isStreaming: false, streamText: '' })
  const [lastEmotion, setLastEmotion] = useState<Emotion | null>(null)
  const [lastSafetyLevel, setLastSafetyLevel] = useState<string>('safe')
  const abortRef = useRef<(() => void) | null>(null)

  // Load conversation list
  const loadConversations = useCallback(async () => {
    try {
      const convs = await chatService.getConversations()
      setConversations(convs)
    } catch { /* silently fail */ }
  }, [])

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true)
    setError(null)
    try {
      const msgs = await chatService.getMessages(convId)
      setMessages(msgs)
    } catch {
      setError('could not load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (conversationId) loadMessages(conversationId)
  }, [conversationId, loadMessages])

  const sendMessage = useCallback(
    async (
      content: string,
      activeConversationId: string | undefined,
      onConversationCreated?: (id: string) => void
    ) => {
      if (!content.trim() || streaming.isStreaming) return

      // Optimistic user message
      const optimisticUser: Message = {
        id: `opt-${Date.now()}`,
        role: 'user',
        content,
        sentiment: {},
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticUser])
      setStreaming({ isStreaming: true, streamText: '' })
      setError(null)

      abortRef.current = chatService.streamMessage(
        content,
        activeConversationId,
        (token) => {
          setStreaming((s) => ({ ...s, streamText: s.streamText + token }))
        },
        (meta) => {
          const finalMsg: Message = {
            id: `stream-${Date.now()}`,
            role: 'assistant',
            content: '',   // will be filled by streamed text in component
            sentiment: {},
            created_at: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, finalMsg])
          setStreaming({ isStreaming: false, streamText: '' })
          setLastEmotion((meta.emotion as Emotion) ?? null)
          setLastSafetyLevel(meta.safety_level)
          if (meta.conversation_id && !activeConversationId) {
            onConversationCreated?.(meta.conversation_id)
          }
          loadConversations()
        },
        (err) => {
          setError(err.message)
          setStreaming({ isStreaming: false, streamText: '' })
        }
      )
    },
    [streaming.isStreaming, loadConversations]
  )

  const abort = () => {
    abortRef.current?.()
    setStreaming({ isStreaming: false, streamText: '' })
  }

  return {
    messages,
    conversations,
    loading,
    error,
    streaming,
    lastEmotion,
    lastSafetyLevel,
    sendMessage,
    abort,
    loadMessages,
    loadConversations,
    setMessages,
  }
}
