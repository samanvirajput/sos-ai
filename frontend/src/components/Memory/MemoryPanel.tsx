import { useState } from 'react'
import { useMemory } from '../../hooks/useMemory'
import type { MemoryItem } from '../../types'

export default function MemoryPanel() {
  const { memories, loading, search, remove } = useMemory()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <div
      style={{
        padding: '24px',
        borderLeft: '1px solid var(--cream)',
        height: '100%',
        overflowY: 'auto',
        width: '280px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--text)',
          marginBottom: '16px',
        }}
      >
        memories
      </h3>

      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search your memories..."
          style={{
            width: '100%',
            border: 'none',
            borderBottom: '1px solid var(--constellation)',
            outline: 'none',
            padding: '6px 0',
            fontFamily: 'var(--font-hand)',
            fontSize: '0.9rem',
            color: 'var(--text)',
            background: 'transparent',
          }}
        />
      </form>

      {loading && (
        <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--text-hint)', fontStyle: 'italic', fontSize: '0.85rem' }}>
          searching...
        </p>
      )}

      {memories.length === 0 && !loading && query && (
        <p style={{ fontFamily: 'var(--font-hand)', color: 'var(--text-hint)', fontStyle: 'italic', fontSize: '0.85rem' }}>
          → nothing found
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {memories.map((m: MemoryItem) => (
          <div
            key={m.id}
            style={{
              borderLeft: '2px solid var(--terracotta-light)',
              paddingLeft: '12px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                color: 'var(--text-soft)',
                fontWeight: 300,
                lineHeight: 1.6,
                marginBottom: '6px',
              }}
            >
              {m.content.slice(0, 160)}{m.content.length > 160 ? '...' : ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: '0.72rem',
                  color: 'var(--text-hint)',
                }}
              >
                {(m.similarity * 100).toFixed(0)}% match
              </span>
              <button
                onClick={() => remove(m.id)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  color: 'var(--text-hint)',
                  textDecoration: 'underline',
                  fontWeight: 300,
                }}
              >
                forget
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
