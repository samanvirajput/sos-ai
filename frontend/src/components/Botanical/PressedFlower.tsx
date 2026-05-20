interface Props {
  size?: number
  color?: string
  opacity?: number
  className?: string
}

export default function PressedFlower({ size = 140, color = 'var(--dusty-rose)', opacity = 0.15, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      stroke={color}
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      {/* Layered abstract petals — pressed/flat look */}
      <ellipse cx="70" cy="70" rx="18" ry="32" />
      <ellipse cx="70" cy="70" rx="18" ry="32" transform="rotate(40 70 70)" />
      <ellipse cx="70" cy="70" rx="18" ry="32" transform="rotate(80 70 70)" />
      <ellipse cx="70" cy="70" rx="18" ry="32" transform="rotate(120 70 70)" />
      <ellipse cx="70" cy="70" rx="18" ry="32" transform="rotate(160 70 70)" />

      {/* Outer delicate petals */}
      <ellipse cx="70" cy="70" rx="10" ry="42" strokeOpacity="0.5" />
      <ellipse cx="70" cy="70" rx="10" ry="42" transform="rotate(60 70 70)" strokeOpacity="0.5" />
      <ellipse cx="70" cy="70" rx="10" ry="42" transform="rotate(120 70 70)" strokeOpacity="0.5" />

      {/* Center */}
      <circle cx="70" cy="70" r="8" />
      <circle cx="70" cy="70" r="4" strokeOpacity="0.4" />

      {/* Veins */}
      <path d="M70 62 Q72 70 70 78" strokeOpacity="0.3" />
      <path d="M62 66 Q70 70 78 74" strokeOpacity="0.3" />

      {/* Stems */}
      <path d="M70 102 C68 112 66 120 64 130" strokeOpacity="0.4" />
      <path d="M70 110 C62 115 56 118 50 124" strokeOpacity="0.3" />
    </svg>
  )
}
