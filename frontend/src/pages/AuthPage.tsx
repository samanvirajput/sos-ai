import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Login from '../components/Auth/Login'
import Register from '../components/Auth/Register'
import PressedFlower from '../components/Botanical/PressedFlower'
import WildflowerSprig from '../components/Botanical/WildflowerSprig'

export default function AuthPage() {
  const { isAuthenticated } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (isAuthenticated) return <Navigate to="/chat" replace />

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <div style={{ position: 'absolute', bottom: -30, left: -20, pointerEvents: 'none' }}>
        <PressedFlower size={220} color="var(--sage)" opacity={0.1} />
      </div>
      <div style={{ position: 'absolute', top: 40, right: 60, pointerEvents: 'none' }}>
        <WildflowerSprig size={100} color="var(--terracotta-light)" opacity={0.35} />
      </div>

      <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
        {mode === 'login'
          ? <Login    onSwitch={() => setMode('register')} />
          : <Register onSwitch={() => setMode('login')}    />
        }
      </div>
    </div>
  )
}
