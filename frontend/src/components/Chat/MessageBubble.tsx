import type { Message } from '../../types'

const EMOTION_COLORS: Record<string, string> = {
  joy:      'var(--terracotta)',
  sadness:  'var(--sage)',
  fear:     'var(--dusty-rose)',
  anger:    '#B5604A',
  disgust:  'var(--sage)',
  surprise: 'var(--constellation)',
  neutral:  'var(--text-hint)',
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

interface Props {
  message: Message
  streamText?: string  // passed when this is the actively streaming assistant message
}

export default function MessageBubble({ message, streamText }: Props) {
  const isUser      = message.role === 'user'
  const emotion     = message.sentiment?.emotion ?? 'neutral'
  const emotionColor = EMOTION_COLORS[emotion] ?? 'var(--text-hint)'
  const content     = streamText !== undefined ? streamText : message.content

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ maxWidth: '60%', textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '0.95rem',
              color: 'var(--text-soft)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {content}
          </p>
          <time
            style={{
              display: 'block',
              marginTop: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              color: 'var(--text-hint)',
              fontWeight: 300,
            }}
          >
            {formatTime(message.created_at)}
          </time>
        </div>
      </div>
    )
  }

  // Assistant message — journal entry style
  return (
    <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      {/* Emotion accent line */}
      <div
        style={{
          width: '2px',
          minHeight: '100%',
          alignSelf: 'stretch',
          background: emotionColor,
          opacity: 0.5,
          flexShrink: 0,
          marginTop: '4px',
        }}
      />

      <div style={{ flex: 1 }}>
        {/* Emotion annotation */}
        {emotion && emotion !== 'neutral' && (
          <div
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: '0.85rem',
              color: 'var(--text-hint)',
              marginBottom: '6px',
            }}
          >
            → feeling: {emotion}
          </div>
        )}

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '1.05rem',
            lineHeight: 1.9,
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
          {streamText !== undefined && (
            <span
              style={{
                display: 'inline-block',
                width: '1px',
                height: '1em',
                background: 'var(--terracotta)',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-start infinite',
              }}
            />
          )}
        </p>

        <time
          style={{
            display: 'block',
            marginTop: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            color: 'var(--text-hint)',
            fontWeight: 300,
          }}
        >
          {formatTime(message.created_at)}
        </time>
      </div>
    </div>
  )
}
