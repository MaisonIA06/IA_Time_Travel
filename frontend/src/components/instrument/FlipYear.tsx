/**
 * FlipYear — split-flap style digits pour afficher une année.
 * Ref : design_handoff_mia_retro_futurist — "FlipYear".
 */

import './FlipYear.css'

interface FlipYearProps {
  value: number
  size?: number
  className?: string
  'aria-label'?: string
}

export function FlipYear({ value, size = 36, className = '', ...rest }: FlipYearProps) {
  const digits = String(value).split('')
  return (
    <span
      className={`flip-year ${className}`}
      style={{ fontSize: `${size}px` }}
      aria-label={rest['aria-label'] ?? `Année ${value}`}
    >
      {digits.map((d, i) => (
        <span key={i} className="flip-digit" aria-hidden="true">{d}</span>
      ))}
    </span>
  )
}
