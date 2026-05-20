import { useEffect, useRef, useState } from 'react'

interface Props {
  onSend: (message: string) => void
  isStreaming: boolean
}

export default function InputBar({ onSend, isStreaming }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '240px',
        right: 0,
        borderTop: '1px solid var(--terracotta-light)',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        padding: '20px 48px',
        zIndex: 10,
      }}
    >
      {isStreaming && (
        <div
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '0.8rem',
            color: 'var(--text-hint)',
            marginBottom: '8px',
            fontStyle: 'italic',
          }}
        >
          sos ai is thinking...
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="what's on your mind..."
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
            fontWeight: 400,
            color: 'var(--text)',
            lineHeight: 1.6,
            overflow: 'hidden',
          }}
        />

        {/* Send arrow */}
        <button
          onClick={submit}
          disabled={isStreaming || !value.trim()}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.1rem',
            color: value.trim() && !isStreaming ? 'var(--terracotta)' : 'var(--text-hint)',
            transition: 'color 0.2s ease',
            padding: '4px',
            lineHeight: 1,
          }}
          aria-label="send message"
        >
          →
        </button>
      </div>

      {value.length > 2000 && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            color: value.length > 3800 ? '#B5604A' : 'var(--text-hint)',
            textAlign: 'right',
            marginTop: '4px',
          }}
        >
          {value.length} / 4000
        </div>
      )}
    </div>
  )
}
