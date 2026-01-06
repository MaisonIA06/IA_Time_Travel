/**
 * TimeVortex - Effet de tunnel temporel / wormhole en arrière-plan
 *
 * Crée un effet de voyage dans le temps avec des anneaux concentriques
 * qui tournent et s'éloignent vers l'infini.
 */

import { useMemo } from 'react'
import './TimeVortex.css'

interface TimeVortexProps {
  ringCount?: number
  intensity?: 'low' | 'medium' | 'high'
}

export function TimeVortex({ ringCount = 15, intensity = 'medium' }: TimeVortexProps) {
  const rings = useMemo(() => {
    return Array.from({ length: ringCount }, (_, i) => ({
      id: i,
      delay: i * 1.5,
      size: 100 + i * 150,
      duration: 15 + Math.random() * 10
    }))
  }, [ringCount])

  return (
    <div className={`time-vortex time-vortex--${intensity}`} aria-hidden="true">
      <div className="vortex-core" />
      {rings.map(ring => (
        <div
          key={ring.id}
          className="vortex-ring"
          style={{
            width: `${ring.size}px`,
            height: `${ring.size}px`,
            animationDelay: `${-ring.delay}s`,
            animationDuration: `${ring.duration}s`
          }}
        />
      ))}
      <div className="vortex-glow" />
    </div>
  )
}

