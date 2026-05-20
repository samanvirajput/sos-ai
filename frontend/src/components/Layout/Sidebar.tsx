import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Conversation } from '../../types'

interface Props {
  conversations: Conversation[]
  onNewChat: () => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const today = new Date()
    const diff = today.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return d.toLocaleDateString([], { weekday: 'long' }).toLowerCase()
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }).toLowerCase()
  } catch {
    return ''
  }
}

export default function Sidebar({ conversations, onNewChat }: Props) {
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <aside
      style={{
        width: '240px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 24px',
        borderRight: 'none',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '24px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--text)',
          }}
        >
          sos ai
        </span>
      </div>

      {/* Terracotta rule */}
      <div
        style={{
          height: '1px',
          background: 'var(--terracotta)',
          opacity: 0.4,
          marginBottom: '24px',
        }}
      />

      {/* New chat */}
      <button
        onClick={onNewChat}
        style={{
          textAlign: 'left',
          fontFamily: 'var(--font-hand)',
          fontSize: '0.9rem',
          color: 'var(--terracotta)',
          marginBottom: '20px',
          padding: 0,
        }}
      >
        + new conversation
      </button>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/chat/${c.id}`)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 0',
              borderBottom: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: c.id === conversationId ? 400 : 300,
              fontSize: '0.82rem',
              color: c.id === conversationId ? 'var(--text)' : 'var(--text-soft)',
              textDecoration: c.id === conversationId ? 'underline' : 'none',
              textDecorationColor: 'var(--terracotta-light)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-hint)', marginBottom: '2px' }}>
              {formatDate(c.started_at)}
            </div>
            <div
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {c.last_message_preview || 'new conversation'}
            </div>
          </button>
        ))}
      </div>

      {/* User + logout */}
      <div style={{ marginTop: '24px', paddingTop: '16px' }}>
        <div
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1rem',
            color: 'var(--text-soft)',
          }}
        >
          {user?.name ?? user?.email ?? 'you'}
        </div>
        <button
          onClick={handleLogout}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: 'var(--text-hint)',
            fontWeight: 300,
            marginTop: '4px',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-hint)',
          }}
        >
          sign out
        </button>
      </div>
    </aside>
  )
}
