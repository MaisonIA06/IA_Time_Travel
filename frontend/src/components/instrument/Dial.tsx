/**
 * Dial — cadran analogique CSS pur.
 * Aiguille pivote de -140° à +140° selon `value` (0 → 1).
 * Ref : design_handoff §5.
 */

import './Dial.css'

interface DialProps {
  value: number
  label: string
  color?: string
  size?: number
}

export function Dial({ value, label, color = 'var(--mai-red-lovelace)', size = 90 }: DialProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const angle = -140 + clamped * 280

  return (
    <div className="dial" style={{ width: size }}>
      <div className="dial__face" style={{ width: size, height: size }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <span
            key={i}
            className="dial__tick"
            style={{ transform: `rotate(${-140 + i * 28}deg)` }}
            aria-hidden
          />
        ))}
        <span
          className="dial__needle"
          style={{ transform: `rotate(${angle}deg)`, background: color }}
          aria-hidden
        />
        <span className="dial__center" style={{ background: color }} aria-hidden />
      </div>
      <span className="dial__label">{label}</span>
    </div>
  )
}
