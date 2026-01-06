/**
 * EventCard - Carte événement avec style glassmorphism
 */

import type { QuizItem } from '../types'
import { Badge } from './ui'
import { CheckIcon, CrossIcon } from './icons'
import './EventCard.css'

interface EventCardProps {
  event: QuizItem
  showYear?: boolean
  showDescription?: boolean
  isRevealed?: boolean
  isCorrect?: boolean | null
  onClick?: () => void
  draggable?: boolean
}

export function EventCard({
  event,
  showYear = false,
  showDescription = false,
  isRevealed = false,
  isCorrect = null,
  onClick,
  draggable = false
}: EventCardProps) {
  const cardClass = [
    'event-card',
    isRevealed ? 'revealed' : '',
    isCorrect === true ? 'correct' : '',
    isCorrect === false ? 'incorrect' : '',
    draggable ? 'draggable' : '',
    onClick ? 'clickable' : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cardClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Effet de lueur */}
      <div className="event-card-glow" />

      {/* Contenu */}
      <div className="event-card-content">
        {/* Année (si révélée) */}
        {(showYear || isRevealed) && (
          <div className="event-year-badge">
            <span className="year-value">{event.year_correct}</span>
          </div>
        )}

        {/* Titre */}
        <h3 className="event-title">{event.prompt}</h3>

        {/* Personnalités */}
        {event.people && event.people.length > 0 && (
          <div className="event-people">
            {event.people.slice(0, 2).map((person, idx) => (
              <Badge key={idx} variant="purple" size="sm">
                {person}
              </Badge>
            ))}
          </div>
        )}

        {/* Description (si activée) */}
        {(showDescription || isRevealed) && (
          <p className="event-description">{event.description_short}</p>
        )}

        {/* Indicateur de difficulté */}
        <div className="event-difficulty">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`difficulty-dot ${i < event.difficulty ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Indicateur de résultat */}
      {isRevealed && isCorrect !== null && (
        <div className={`event-result ${isCorrect ? 'success' : 'error'}`}>
          {isCorrect
            ? <CheckIcon size={24} color="var(--aa-success)" />
            : <CrossIcon size={24} color="var(--aa-error)" />}
        </div>
      )}
    </div>
  )
}

// Version compacte pour les listes
interface EventCardMiniProps {
  event: QuizItem
  isCorrect?: boolean
}

export function EventCardMini({ event, isCorrect }: EventCardMiniProps) {
  return (
    <div className={`event-card-mini ${isCorrect !== undefined ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
      <span className="mini-year">{event.year_correct}</span>
      <span className="mini-title">{event.prompt}</span>
    </div>
  )
}

