import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Header from '../components/Layout/Header'
import LotusFlower from '../components/Botanical/LotusFlower'
import ConstellationCluster from '../components/Botanical/ConstellationCluster'
import PressedFlower from '../components/Botanical/PressedFlower'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleStart = () => navigate(isAuthenticated ? '/chat' : '/auth')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Header onSignIn={() => navigate('/auth')} />

      {/* Top-left pressed flower — decorative */}
      <div style={{ position: 'absolute', top: -20, left: -20, pointerEvents: 'none' }}>
        <PressedFlower size={200} color="var(--dusty-rose)" opacity={0.12} />
      </div>

      {/* Bottom-right constellation */}
      <div style={{ position: 'absolute', bottom: 40, right: 48, pointerEvents: 'none' }}>
        <ConstellationCluster size={120} opacity={0.22} />
      </div>

      {/* Center content */}
      <div style={{ textAlign: 'center', maxWidth: '560px', padding: '0 32px' }}>
        {/* Floating lotus — slightly off-center */}
        <div
          style={{
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '24px',    // subtle offset
          }}
        >
          <LotusFlower size={72} color="var(--terracotta)" opacity={0.75} />
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
            color: 'var(--text)',
            lineHeight: 1.2,
            marginBottom: '20px',
            letterSpacing: '-0.01em',
          }}
        >
          a space to think out loud.
        </h1>

        {/* Caveat annotation */}
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1.1rem',
            color: 'var(--text-hint)',
            marginBottom: '48px',
            letterSpacing: '0.01em',
          }}
        >
          → you don't have to explain yourself here
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 400,
            color: 'var(--terracotta)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.03em',
            textDecoration: 'none',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
            ;(e.currentTarget as HTMLButtonElement).style.textDecorationColor = 'var(--terracotta-light)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
          }}
        >
          start talking →
        </button>
      </div>
    </div>
  )
}
