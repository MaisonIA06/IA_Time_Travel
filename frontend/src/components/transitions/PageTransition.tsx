/**
 * PageTransition - Animations de transition entre pages
 *
 * Effet de "warp" temporel lors des changements de page.
 */

import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exit' | 'enter'>('idle')
  const previousPath = useRef(location.pathname)
  const isAnimating = useRef(false)

  useEffect(() => {
    // Si le chemin a changé et qu'on n'est pas en train d'animer
    if (previousPath.current !== location.pathname && !isAnimating.current) {
      isAnimating.current = true

      // Phase de sortie rapide
      setTransitionPhase('exit')

      // Phase d'entrée
      const enterTimer = setTimeout(() => {
        setTransitionPhase('enter')
        previousPath.current = location.pathname
      }, 300)

      // Retour à l'état normal
      const idleTimer = setTimeout(() => {
        setTransitionPhase('idle')
        isAnimating.current = false
      }, 600)

      return () => {
        clearTimeout(enterTimer)
        clearTimeout(idleTimer)
      }
    }
  }, [location.pathname])

  const isTransitioning = transitionPhase !== 'idle'

  return (
    <div className={`page-transition ${isTransitioning ? 'transitioning' : ''}`}>
      {/* Voile de transition doux (charte MIA) */}
      {isTransitioning && (
        <div className={`transition-overlay transition-overlay--${transitionPhase}`} />
      )}

      {/* Contenu de la page - toujours afficher children directement */}
      <div className={`page-content page-content--${transitionPhase}`}>
        {children}
      </div>
    </div>
  )
}

