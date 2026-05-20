import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

interface Props { onSwitch: () => void }

export default function Login({ onSwitch }: Props) {
  const { login, loading, error } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid var(--constellation)',
    outline: 'none',
    padding: '8px 0',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: '1rem',
    color: 'var(--text)',
    background: 'transparent',
    marginBottom: '28px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-hand)',
    fontSize: '0.9rem',
    color: 'var(--text-soft)',
    display: 'block',
    marginBottom: '4px',
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: '40px',
        }}
      >
        welcome back.
      </h1>

      <div>
        <label style={labelStyle}>email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </div>

      {error && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.82rem',
            color: '#B5604A',
            marginBottom: '16px',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: 'var(--terracotta)',
          color: '#fff',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 400,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: '20px',
          letterSpacing: '0.02em',
        }}
      >
        {loading ? 'signing in...' : 'continue →'}
      </button>

      <button
        type="button"
        onClick={onSwitch}
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: '0.9rem',
          color: 'var(--text-hint)',
          textDecoration: 'underline',
        }}
      >
        new here? create an account
      </button>
    </form>
  )
}
