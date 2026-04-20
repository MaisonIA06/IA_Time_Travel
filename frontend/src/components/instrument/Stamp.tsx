/**
 * Stamp — tampon rotation -4°, bord épais, deux cercles en ::before/::after.
 */

import './Stamp.css'

interface StampProps {
  children: React.ReactNode
  color?: 'red' | 'ink' | 'green'
  rotate?: number
  className?: string
}

export function Stamp({ children, color = 'red', rotate = -4, className = '' }: StampProps) {
  return (
    <span
      className={`stamp stamp--${color} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  )
}
