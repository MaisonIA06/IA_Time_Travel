/**
 * useMuseumEgg — déverrouille la page secrète /museum.
 *
 * Deux déclencheurs possibles :
 *   1. Clavier : taper la séquence M-U-S-E-E en moins de 2 secondes.
 *   2. Clics  : 5 clics rapides consécutifs (chaque clic à moins de 400 ms
 *      du précédent) sur un élément « trigger » — le logo MIA de la Home.
 *
 * Une fois la condition remplie, le hook active une petite modale ludique
 * (« Une porte secrète s'entrouvre vers le musée… ») puis navigue vers
 * /museum après 1,2 s.
 *
 * Usage dans un composant :
 *
 *   const { triggerProps, overlay } = useMuseumEgg()
 *   return (
 *     <>
 *       {overlay}
 *       <div {...triggerProps}>Logo</div>
 *     </>
 *   )
 */

import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'

const TARGET_SEQUENCE = ['m', 'u', 's', 'e', 'e']
const SEQUENCE_MAX_MS = 2000
const CLICK_GAP_MS = 400
const CLICK_TARGET = 5
const TRANSITION_MS = 1200

interface TriggerProps {
  onClick: (e: React.MouseEvent<HTMLElement>) => void
}

export interface UseMuseumEggResult {
  triggerProps: TriggerProps
  overlay: JSX.Element | null
  isOpening: boolean
}

export function useMuseumEgg(): UseMuseumEggResult {
  const navigate = useNavigate()
  const [isOpening, setIsOpening] = useState(false)
  const openedRef = useRef(false)

  const keyBufferRef = useRef<string[]>([])
  const keyTimestampsRef = useRef<number[]>([])

  const clickCountRef = useRef(0)
  const lastClickAtRef = useRef(0)

  const openMuseum = useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true
    setIsOpening(true)
    window.setTimeout(() => {
      navigate('/museum')
    }, TRANSITION_MS)
  }, [navigate])

  // Clavier : séquence M-U-S-E-E
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (openedRef.current) return
      if (e.key.length !== 1) return
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
          return
        }
      }

      const char = e.key.toLowerCase()
      // Tolérer la ligature « é » tapée sur claviers français : on l'accepte
      // comme « e » car les élèves écriront probablement « musée ».
      const normalized = char === 'é' || char === 'è' || char === 'ê' ? 'e' : char

      if (!/^[a-z]$/.test(normalized)) return

      const now = Date.now()
      keyBufferRef.current.push(normalized)
      keyTimestampsRef.current.push(now)

      // Ne garder que les N dernières touches
      const maxLen = TARGET_SEQUENCE.length
      if (keyBufferRef.current.length > maxLen) {
        keyBufferRef.current = keyBufferRef.current.slice(-maxLen)
        keyTimestampsRef.current = keyTimestampsRef.current.slice(-maxLen)
      }

      if (keyBufferRef.current.length === maxLen) {
        const withinWindow =
          keyTimestampsRef.current[maxLen - 1] - keyTimestampsRef.current[0] <= SEQUENCE_MAX_MS
        const matches = keyBufferRef.current.every((c, i) => c === TARGET_SEQUENCE[i])
        if (withinWindow && matches) {
          keyBufferRef.current = []
          keyTimestampsRef.current = []
          openMuseum()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [openMuseum])

  const handleTriggerClick = useCallback(() => {
    if (openedRef.current) return
    const now = Date.now()
    if (now - lastClickAtRef.current <= CLICK_GAP_MS) {
      clickCountRef.current += 1
    } else {
      clickCountRef.current = 1
    }
    lastClickAtRef.current = now
    if (clickCountRef.current >= CLICK_TARGET) {
      clickCountRef.current = 0
      openMuseum()
    }
  }, [openMuseum])

  const triggerProps: TriggerProps = {
    onClick: handleTriggerClick,
  }

  const overlay = isOpening ? <MuseumEggOverlay /> : null

  return { triggerProps, overlay, isOpening }
}

// Modale éphémère annonçant l'accès au musée.
function MuseumEggOverlay() {
  return (
    <div className="museum-egg-overlay" role="dialog" aria-live="assertive">
      <div className="museum-egg-overlay__card">
        <p className="museum-egg-overlay__emoji" aria-hidden="true">
          🚪
        </p>
        <p className="museum-egg-overlay__text">
          Une porte secrète s'entrouvre vers le musée…
        </p>
      </div>
      <style>{MUSEUM_EGG_STYLES}</style>
    </div>
  )
}

const MUSEUM_EGG_STYLES = `
.museum-egg-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 52, 88, 0.72);
  backdrop-filter: blur(6px);
  animation: museum-egg-fade 200ms ease-out;
}
.museum-egg-overlay__card {
  background: var(--mai-bg, #ffffff);
  color: var(--mai-text, #163458);
  font-family: var(--mai-font-body, system-ui, sans-serif);
  padding: 1.75rem 2rem;
  border-radius: var(--mai-radius-lg, 16px);
  border: 2px solid var(--mai-accent, #994845);
  box-shadow: var(--mai-shadow-lg, 0 12px 32px rgba(22, 52, 88, 0.18));
  text-align: center;
  max-width: 360px;
  animation: museum-egg-pop 500ms cubic-bezier(0.2, 0.8, 0.2, 1.2);
}
.museum-egg-overlay__emoji {
  font-size: 3rem;
  margin: 0 0 0.5rem 0;
  animation: museum-egg-wiggle 900ms ease-in-out infinite;
}
.museum-egg-overlay__text {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.4;
  font-style: italic;
}
@keyframes museum-egg-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes museum-egg-pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes museum-egg-wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(8deg); }
}
`
