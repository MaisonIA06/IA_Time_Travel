/**
 * HolographicCard - Carte avec effet holographique 3D
 *
 * La carte réagit aux mouvements de la souris avec une rotation 3D
 * et un effet de reflet holographique dynamique.
 */

import { useRef, useState, useCallback } from 'react'
import './HolographicCard.css'

interface HolographicCardProps {
  children: React.ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  glowColor?: 'cyan' | 'purple' | 'mixed'
  onClick?: () => void
}

export function HolographicCard({
  children,
  className = '',
  intensity = 'medium',
  glowColor = 'cyan',
  onClick
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glare, setGlare] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const intensityMap = {
    low: 15,
    medium: 25,
    high: 40
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const maxRotation = intensityMap[intensity]
    const rotateX = (y - 0.5) * -maxRotation
    const rotateY = (x - 0.5) * maxRotation

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    )
    setGlare({ x: x * 100, y: y * 100 })
  }, [intensity])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)')
    setGlare({ x: 50, y: 50 })
  }, [])

  return (
    <div
      ref={cardRef}
      className={`holographic-card holographic-card--${glowColor} ${isHovered ? 'holographic-card--hovered' : ''} ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Holographic gradient overlay */}
      <div className="holographic-gradient" />

      {/* Dynamic glare */}
      <div
        className="holographic-glare"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25), transparent 50%)`
        }}
      />

      {/* Border glow */}
      <div className="holographic-border" />

      {/* Content */}
      <div className="holographic-content">
        {children}
      </div>

      {/* Corner accents */}
      <div className="holographic-corner holographic-corner--tl" />
      <div className="holographic-corner holographic-corner--tr" />
      <div className="holographic-corner holographic-corner--bl" />
      <div className="holographic-corner holographic-corner--br" />
    </div>
  )
}

