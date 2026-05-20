interface Props {
  size?: number
  color?: string
  opacity?: number
  className?: string
}

// Fixed constellation — 7 dots with thin connecting lines
const DOTS = [
  { x: 20, y: 30 },
  { x: 50, y: 15 },
  { x: 80, y: 35 },
  { x: 65, y: 65 },
  { x: 35, y: 75 },
  { x: 10, y: 60 },
  { x: 90, y: 55 },
]
const LINES = [
  [0, 1], [1, 2], [2, 6], [2, 3], [3, 4], [4, 5], [5, 0],
]

export default function ConstellationCluster({
  size = 100,
  color = 'var(--constellation)',
  opacity = 1,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 90"
      fill="none"
      stroke={color}
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      {LINES.map(([a, b], i) => (
        <line
          key={i}
          x1={DOTS[a].x} y1={DOTS[a].y}
          x2={DOTS[b].x} y2={DOTS[b].y}
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />
      ))}
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={i === 1 ? 2 : 1.2} fill={color} stroke="none" />
      ))}
    </svg>
  )
}
