// Minimal header — used only on non-chat pages
interface Props { onSignIn?: () => void }

export default function Header({ onSignIn }: Props) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 48px',
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--text)',
          letterSpacing: '0.02em',
        }}
      >
        sos ai
      </span>
      {onSignIn && (
        <button
          onClick={onSignIn}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            fontWeight: 300,
            color: 'var(--text-soft)',
          }}
        >
          sign in
        </button>
      )}
    </header>
  )
}
