/**
 * InteractiveDots - Canvas avec grille de points réactifs au curseur
 *
 * Les points se repoussent doucement à l'approche de la souris
 * et reviennent à leur position d'origine.
 */

import { useEffect, useRef, useCallback } from 'react'
import './InteractiveDots.css'

interface Dot {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
}

export function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const animationRef = useRef<number>()

  // Configuration
  const DOT_SPACING = 40
  const DOT_SIZE = 2
  const MOUSE_RADIUS = 120
  const REPULSION_FORCE = 0.8
  const RETURN_SPEED = 0.05
  const FRICTION = 0.9

  const initDots = useCallback((width: number, height: number) => {
    const dots: Dot[] = []
    const cols = Math.ceil(width / DOT_SPACING) + 1
    const rows = Math.ceil(height / DOT_SPACING) + 1

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING
        const y = j * DOT_SPACING
        dots.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0
        })
      }
    }
    dotsRef.current = dots
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const mouse = mouseRef.current
    const dots = dotsRef.current

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Update and draw dots
    dots.forEach(dot => {
      // Calculate distance from mouse
      const dx = mouse.x - dot.x
      const dy = mouse.y - dot.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Repulsion from mouse
      if (distance < MOUSE_RADIUS && distance > 0) {
        const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS
        const angle = Math.atan2(dy, dx)
        dot.vx -= Math.cos(angle) * force * REPULSION_FORCE
        dot.vy -= Math.sin(angle) * force * REPULSION_FORCE
      }

      // Return to origin
      const returnDx = dot.originX - dot.x
      const returnDy = dot.originY - dot.y
      dot.vx += returnDx * RETURN_SPEED
      dot.vy += returnDy * RETURN_SPEED

      // Apply friction
      dot.vx *= FRICTION
      dot.vy *= FRICTION

      // Update position
      dot.x += dot.vx
      dot.y += dot.vy

      // Calculate color based on displacement
      const displacement = Math.sqrt(
        Math.pow(dot.x - dot.originX, 2) +
        Math.pow(dot.y - dot.originY, 2)
      )
      const intensity = Math.min(displacement / 30, 1)

      // Interpolate between base color and accent color
      const r = Math.floor(42 + intensity * (0 - 42))
      const g = Math.floor(42 + intensity * (212 - 42))
      const b = Math.floor(64 + intensity * (255 - 64))
      const alpha = 0.4 + intensity * 0.6

      // Draw dot
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, DOT_SIZE + intensity * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
      ctx.fill()
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initDots(canvas.width, canvas.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        }
      }
    }

    const handleTouchEnd = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    // Initialize
    handleResize()

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [initDots, animate])

  return (
    <canvas
      ref={canvasRef}
      className="interactive-dots"
      aria-hidden="true"
    />
  )
}

