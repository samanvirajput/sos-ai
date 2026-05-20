interface Props {
  size?: number
  color?: string
  opacity?: number
  className?: string
}

export default function WildflowerSprig({ size = 100, color = 'var(--sage)', opacity = 1, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      {/* Main stem */}
      <path d="M50 110 C50 90 48 70 50 50" />
      {/* Left branch */}
      <path d="M50 80 C42 75 32 72 28 65" />
      {/* Right branch */}
      <path d="M50 70 C58 65 66 60 70 52" />

      {/* Left flower — 5 petals */}
      <circle cx="28" cy="65" r="1.5" fill={color} />
      <path d="M28 65 C28 60 24 57 22 53 C26 55 28 60 28 65Z" />
      <path d="M28 65 C23 65 20 61 16 60 C19 64 24 65 28 65Z" />
      <path d="M28 65 C24 68 22 73 19 75 C23 73 26 69 28 65Z" />
      <path d="M28 65 C32 68 35 72 38 73 C35 70 31 67 28 65Z" />
      <path d="M28 65 C33 63 35 58 38 55 C34 58 30 62 28 65Z" />

      {/* Right flower */}
      <circle cx="70" cy="52" r="1.5" fill={color} />
      <path d="M70 52 C70 47 66 44 64 40 C68 42 70 47 70 52Z" />
      <path d="M70 52 C65 52 62 48 58 47 C61 51 66 52 70 52Z" />
      <path d="M70 52 C66 55 64 60 61 62 C65 60 68 56 70 52Z" />
      <path d="M70 52 C74 55 77 59 80 60 C77 57 73 54 70 52Z" />
      <path d="M70 52 C75 50 77 45 80 42 C76 45 72 49 70 52Z" />

      {/* Top bud */}
      <circle cx="50" cy="50" r="1.5" fill={color} />
      <path d="M50 50 C50 45 46 42 44 38 C48 40 50 45 50 50Z" />
      <path d="M50 50 C45 50 42 46 38 45 C41 49 46 50 50 50Z" />
      <path d="M50 50 C54 50 57 46 61 45 C58 49 53 50 50 50Z" />
      <path d="M50 50 C50 45 54 42 56 38 C52 40 50 45 50 50Z" />

      {/* Small leaf on main stem */}
      <path d="M50 90 C44 86 40 80 42 76 C46 80 50 86 50 90Z" />
    </svg>
  )
}
