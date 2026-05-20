import { useEffect, useState } from 'react'

export default function TypingIndicator() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ paddingLeft: '2px', marginBottom: '48px' }}>
      <span
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: '1.05rem',
          fontStyle: 'italic',
          color: 'var(--text-hint)',
          opacity: visible ? 1 : 0.3,
          transition: 'opacity 0.6s ease',
        }}
      >
        thinking...
      </span>
    </div>
  )
}
