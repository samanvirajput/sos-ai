interface Props {
  size?: number
  color?: string
  opacity?: number
  className?: string
}

export default function LotusFlower({ size = 80, color = 'var(--terracotta)', opacity = 1, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      stroke={color}
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      {/* Center petal */}
      <path d="M40 55 C40 45 34 36 40 28 C46 36 40 45 40 55Z" />
      {/* Left inner */}
      <path d="M40 55 C35 46 26 41 24 33 C32 33 38 42 40 55Z" />
      {/* Right inner */}
      <path d="M40 55 C45 46 54 41 56 33 C48 33 42 42 40 55Z" />
      {/* Far left */}
      <path d="M40 55 C30 48 18 46 14 38 C22 36 34 44 40 55Z" />
      {/* Far right */}
      <path d="M40 55 C50 48 62 46 66 38 C58 36 46 44 40 55Z" />
      {/* Bottom left leaf */}
      <path d="M40 58 C34 56 26 60 22 66 C28 64 36 60 40 58Z" />
      {/* Bottom right leaf */}
      <path d="M40 58 C46 56 54 60 58 66 C52 64 44 60 40 58Z" />
      {/* Stem */}
      <line x1="40" y1="58" x2="40" y2="72" />
      {/* Water line */}
      <path d="M26 70 Q40 66 54 70" />
    </svg>
  )
}
