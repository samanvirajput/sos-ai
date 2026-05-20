import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChat } from '../hooks/useChat'
import Sidebar from '../components/Layout/Sidebar'
import ChatWindow from '../components/Chat/ChatWindow'
import InputBar from '../components/Chat/InputBar'
import MemoryPanel from '../components/Memory/MemoryPanel'

export default function ChatPage() {
  const { isAuthenticated } = useAuthStore()
  const { conversationId }  = useParams<{ conversationId?: string }>()
  const navigate            = useNavigate()
  const [showMemory, setShowMemory] = useState(false)

  const {
    messages,
    conversations,
    streaming,
    sendMessage,
    setMessages,
  } = useChat(conversationId)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const handleSend = (content: string) => {
    sendMessage(content, conversationId, (newId) => {
      navigate(`/chat/${newId}`, { replace: true })
    })
  }

  const handleNewChat = () => {
    setMessages([])
    navigate('/chat', { replace: true })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar conversations={conversations} onNewChat={handleNewChat} />

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Memory toggle */}
        <button
          onClick={() => setShowMemory((v) => !v)}
          style={{
            position: 'absolute',
            top: '20px',
            right: showMemory ? '296px' : '20px',
            fontFamily: 'var(--font-hand)',
            fontSize: '0.8rem',
            color: 'var(--text-hint)',
            zIndex: 20,
            transition: 'right 0.25s ease',
          }}
        >
          {showMemory ? '← hide memories' : 'memories →'}
        </button>

        <ChatWindow
          messages={messages}
          streamText={streaming.streamText}
          isStreaming={streaming.isStreaming}
        />
        <InputBar onSend={handleSend} isStreaming={streaming.isStreaming} />
      </div>

      {/* Memory panel (slide in) */}
      {showMemory && (
        <div
          style={{
            height: '100vh',
            background: 'var(--bg)',
            borderLeft: '1px solid var(--cream)',
            overflow: 'hidden',
          }}
        >
          <MemoryPanel />
        </div>
      )}
    </div>
  )
}
