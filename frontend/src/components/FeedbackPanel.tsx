/**
 * FeedbackPanel - Panneau de feedback après réponse
 *
 * Affiche si la réponse est correcte/incorrecte avec des détails.
 */

import { useEffect, useState } from 'react'
import type { QuizItem } from '../types'
import { Button, Badge } from './ui'
import { CheckIcon, CrossIcon } from './icons'
import './FeedbackPanel.css'

interface FeedbackPanelProps {
  isCorrect: boolean
  event: QuizItem
  userAnswer: number
  pointsEarned: number
  bonusTime: number
  streakBonus: number
  streak: number
  onNext: () => void
}

export function FeedbackPanel({
  isCorrect,
  event,
  userAnswer,
  pointsEarned,
  bonusTime,
  streakBonus,
  streak,
  onNext
}: FeedbackPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`feedback-panel ${isVisible ? 'visible' : ''} ${isCorrect ? 'correct' : 'incorrect'}`}>
      {/* Header avec résultat */}
      <div className="feedback-header">
        <div className="feedback-icon">
          {isCorrect
            ? <CheckIcon size={48} color="var(--aa-success)" />
            : <CrossIcon size={48} color="var(--aa-error)" />}
        </div>
        <h2 className="feedback-title">
          {isCorrect ? 'Correct !' : 'Incorrect'}
        </h2>
      </div>

      {/* Points gagnés */}
      <div className="feedback-points">
        <div className="points-main">
          <span className="points-value">{pointsEarned > 0 ? '+' : ''}{pointsEarned}</span>
          <span className="points-label">points</span>
        </div>

        {isCorrect && (bonusTime > 0 || streakBonus > 0) && (
          <div className="points-bonus">
            {bonusTime > 0 && (
              <Badge variant="accent" size="sm" glow>
                +{bonusTime} rapidité
              </Badge>
            )}
            {streakBonus > 0 && (
              <Badge variant="purple" size="sm" glow>
                +{streakBonus} série ({streak})
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Correction si mauvaise réponse */}
      {!isCorrect && (
        <div className="feedback-correction">
          <p className="correction-text">
            Tu as répondu <span className="user-answer">{userAnswer}</span>,
            mais la bonne réponse était <span className="correct-answer">{event.year_correct}</span>.
          </p>
        </div>
      )}

      {/* En savoir plus */}
      <div className="feedback-learn-more">
        {/* Image de l'événement */}
        {event.image_url && (
          <div className="learn-more-image">
            <img
              src={event.image_url}
              alt={event.prompt}
              loading="lazy"
            />
          </div>
        )}

        <h3 className="learn-more-title">
          <Badge variant={isCorrect ? 'success' : 'error'} size="lg">
            {event.year_correct}
          </Badge>
          {event.prompt}
        </h3>

        <p className="learn-more-description">
          {event.description_short}
        </p>

        {event.explanation && (
          <div className="feedback-explanation">
            <p><strong>Le savais-tu ?</strong> {event.explanation}</p>
          </div>
        )}

        {event.people && event.people.length > 0 && (
          <div className="learn-more-people">
            <span className="people-label">Personnalités :</span>
            {event.people.map((person, idx) => (
              <Badge key={idx} variant="purple" size="sm">
                {person}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Bouton suivant */}
      <div className="feedback-actions">
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          rightIcon="→"
        >
          Question suivante
        </Button>
      </div>
    </div>
  )
}

// Version simplifiée pour affichage inline
interface FeedbackInlineProps {
  isCorrect: boolean
  correctYear: number
}

export function FeedbackInline({ isCorrect, correctYear }: FeedbackInlineProps) {
  return (
    <div className={`feedback-inline ${isCorrect ? 'correct' : 'incorrect'}`}>
      <span className="inline-icon">
        {isCorrect
          ? <CheckIcon size={20} color="var(--aa-success)" />
          : <CrossIcon size={20} color="var(--aa-error)" />}
      </span>
      <span className="inline-text">
        {isCorrect ? 'Bravo !' : `C'était ${correctYear}`}
      </span>
    </div>
  )
}

