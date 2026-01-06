/**
 * Timeline - Frise chronologique interactive
 *
 * Affiche les décennies de 1800 à aujourd'hui avec les événements placés.
 */

import { useMemo } from 'react'
import type { AnsweredEvent } from '../types'
import './Timeline.css'

interface TimelineProps {
  answeredEvents: AnsweredEvent[]
  highlightYear?: number
  showLabels?: boolean
  compact?: boolean
}

// Génère les décennies de 1800 à 2030
const DECADES = Array.from({ length: 24 }, (_, i) => 1800 + i * 10)

export function Timeline({
  answeredEvents,
  highlightYear,
  showLabels = true,
  compact = false
}: TimelineProps) {
  // Grouper les événements par décennie
  const eventsByDecade = useMemo(() => {
    const map = new Map<number, AnsweredEvent[]>()

    answeredEvents.forEach(ae => {
      const decade = Math.floor(ae.event.year_correct / 10) * 10
      const existing = map.get(decade) || []
      map.set(decade, [...existing, ae])
    })

    return map
  }, [answeredEvents])

  // Décennie mise en évidence
  const highlightDecade = highlightYear
    ? Math.floor(highlightYear / 10) * 10
    : null

  return (
    <div className={`timeline ${compact ? 'timeline-compact' : ''}`}>
      <div className="timeline-track">
        {DECADES.map(decade => {
          const events = eventsByDecade.get(decade) || []
          const isHighlighted = decade === highlightDecade
          const hasEvents = events.length > 0

          return (
            <div
              key={decade}
              className={`timeline-decade ${isHighlighted ? 'highlighted' : ''} ${hasEvents ? 'has-events' : ''}`}
            >
              <div className="decade-marker">
                <div className="decade-dot" />
                {showLabels && (
                  <span className="decade-label">{decade}</span>
                )}
              </div>

              {hasEvents && (
                <div className="decade-events">
                  {events.map((ae, idx) => (
                    <div
                      key={idx}
                      className={`timeline-event ${ae.isCorrect ? 'correct' : 'incorrect'}`}
                      title={`${ae.event.year_correct} - ${ae.event.prompt}`}
                    >
                      <span className="event-year">{ae.event.year_correct}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ligne de la frise */}
      <div className="timeline-line" />
    </div>
  )
}

// Version mini pour les zones de drop
interface TimelineDropZonesProps {
  onDropDecade: (decade: number) => void
  activeDecade: number | null
}

export function TimelineDropZones({ onDropDecade, activeDecade }: TimelineDropZonesProps) {
  // Décennies pertinentes pour l'IA (1840-2030)
  const relevantDecades = DECADES.filter(d => d >= 1840)

  return (
    <div className="timeline-drop-zones">
      {relevantDecades.map(decade => (
        <button
          key={decade}
          className={`drop-zone ${activeDecade === decade ? 'active' : ''}`}
          onClick={() => onDropDecade(decade)}
        >
          <span className="drop-zone-label">{decade}s</span>
        </button>
      ))}
    </div>
  )
}

