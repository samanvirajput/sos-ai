import { useEffect, useRef } from 'react'
import type { Message } from '../../types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface Props {
  messages: Message[]
  streamText: string
  isStreaming: boolean
}

export default function ChatWindow({ messages, streamText, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  // Create a phantom streaming message to render at the bottom while streaming
  const streamingMsg: Message | null = isStreaming
    ? {
        id: 'streaming',
        role: 'assistant',
        content: '',
        sentiment: {},
        created_at: new Date().toISOString(),
      }
    : null

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '60px 48px 160px',
      }}
    >
      {messages.length === 0 && !isStreaming && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            paddingBottom: '80px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: '1.1rem',
              color: 'var(--text-hint)',
              fontStyle: 'italic',
            }}
          >
            → say something. i'm listening.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {streamingMsg && (
        <MessageBubble message={streamingMsg} streamText={streamText || ' '} />
      )}

      {isStreaming && !streamText && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}
