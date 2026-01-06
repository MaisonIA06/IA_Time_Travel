/**
 * AnswerFeedback - Effets visuels pour les réponses
 *
 * Affiche des animations spectaculaires selon le résultat :
 * - Bonne réponse : explosion de particules vertes, onde positive
 * - Mauvaise réponse : effet de glitch, secousse, flash rouge
 */

import { useEffect, useState } from 'react'
import { CheckIcon, CrossIcon } from '../icons'
import './AnswerFeedback.css'

interface AnswerFeedbackProps {
  isCorrect: boolean | null
  isVisible: boolean
  message?: string
  onAnimationEnd?: () => void
}

export function AnswerFeedback({
  isCorrect,
  isVisible,
  message,
  onAnimationEnd
}: AnswerFeedbackProps) {
  const [phase, setPhase] = useState<'hidden' | 'show' | 'particles' | 'fade'>('hidden')

  useEffect(() => {
    if (isVisible && isCorrect !== null) {
      setPhase('show')

      // Lancer les particules
      const particleTimer = setTimeout(() => setPhase('particles'), 100)

      // Commencer le fade out
      const fadeTimer = setTimeout(() => {
        setPhase('fade')
        onAnimationEnd?.()
      }, 2000)

      // Reset
      const resetTimer = setTimeout(() => setPhase('hidden'), 2500)

      return () => {
        clearTimeout(particleTimer)
        clearTimeout(fadeTimer)
        clearTimeout(resetTimer)
      }
    } else {
      setPhase('hidden')
    }
  }, [isVisible, isCorrect, onAnimationEnd])

  if (phase === 'hidden' || isCorrect === null) return null

  return (
    <div className={`answer-feedback answer-feedback--${isCorrect ? 'correct' : 'incorrect'} answer-feedback--${phase}`}>
      {/* Overlay de fond */}
      <div className="feedback-overlay" />

      {/* Cercles d'onde */}
      <div className="feedback-waves">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="feedback-wave"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Particules */}
      {phase === 'particles' && (
        <div className="feedback-particles">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="feedback-particle"
              style={{
                '--angle': `${(i / 24) * 360}deg`,
                '--distance': `${80 + Math.random() * 60}px`,
                '--size': `${4 + Math.random() * 8}px`,
                '--delay': `${Math.random() * 0.2}s`,
                '--duration': `${0.6 + Math.random() * 0.4}s`
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Icône centrale */}
      <div className="feedback-icon">
        {isCorrect ? (
          <CheckIcon size={64} color="var(--aa-success)" className="feedback-icon-svg" />
        ) : (
          <CrossIcon size={64} color="var(--aa-error)" className="feedback-icon-svg" />
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="feedback-message">
          {message}
        </div>
      )}

      {/* Effet glitch pour erreur */}
      {!isCorrect && (
        <div className="feedback-glitch">
          <div className="glitch-line glitch-line--1" />
          <div className="glitch-line glitch-line--2" />
          <div className="glitch-line glitch-line--3" />
        </div>
      )}
    </div>
  )
}

// Composant léger pour feedback inline (dans les cartes)
interface InlineFeedbackProps {
  isCorrect: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function InlineFeedback({ isCorrect, size = 'md' }: InlineFeedbackProps) {
  const sizes = { sm: 16, md: 24, lg: 32 }

  return (
    <span className={`inline-feedback inline-feedback--${isCorrect ? 'correct' : 'incorrect'} inline-feedback--${size}`}>
      {isCorrect ? (
        <CheckIcon size={sizes[size]} color="var(--aa-success)" />
      ) : (
        <CrossIcon size={sizes[size]} color="var(--aa-error)" />
      )}
    </span>
  )
}

