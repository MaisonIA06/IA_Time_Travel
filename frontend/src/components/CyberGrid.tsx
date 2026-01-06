/**
 * CyberGrid - Grille infinie style Tron/Synthwave
 *
 * Crée une grille de perspective qui avance infiniment,
 * donnant l'impression de voyager dans un espace cybernétique.
 */

import './CyberGrid.css'

interface CyberGridProps {
  color?: 'cyan' | 'purple' | 'mixed'
  speed?: 'slow' | 'normal' | 'fast'
  opacity?: number
}

export function CyberGrid({
  color = 'cyan',
  speed = 'normal',
  opacity = 0.4
}: CyberGridProps) {
  return (
    <div
      className={`cyber-grid cyber-grid--${color} cyber-grid--${speed}`}
      style={{ '--grid-opacity': opacity } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="cyber-grid__horizon" />
      <div className="cyber-grid__floor" />
      <div className="cyber-grid__glow" />
    </div>
  )
}

