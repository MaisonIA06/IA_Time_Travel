/**
 * DiscoveryMode — slideshow animateur (plein écran).
 * Implémentation fidèle à design_handoff_mia_retro_futurist §2.
 */

import { useEffect } from 'react'
import type { QuizItem } from '../types'
import { Button } from './ui'
import { FlipYear, Stamp } from './instrument'
import './DiscoveryMode.css'

interface DiscoveryModeProps {
  event: QuizItem
  year: number | undefined
  index: number
  total: number
  chapterName: string
  onNext: () => void
  onPrev: () => void
  isLast: boolean
}

function toneFor(eventId: number): 'terra' | 'blue' | 'green' | 'ink' {
  const tones = ['terra', 'blue', 'green', 'ink'] as const
  return tones[eventId % tones.length]
}

export function DiscoveryMode({
  event,
  year,
  index,
  total,
  chapterName,
  onNext,
  onPrev,
  isLast,
}: DiscoveryModeProps) {
  // Navigation clavier
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') onNext()
      if (ev.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onNext, onPrev])

  const lat = (45.24 + index * 0.7).toFixed(2)
  const long = (event.event_id * 3.12).toFixed(2)
  const tone = toneFor(event.event_id)

  return (
    <div className="discovery" key={event.event_id}>
      {/* ==================== LEFT — Archive card ==================== */}
      <section className="discovery__left fade-in-up">
        {year !== undefined && (
          <div aria-hidden className="discovery__watermark">{year}</div>
        )}

        <header className="discovery__header">
          <div>
            <span className="label">Chapitre · {chapterName}</span>
            <span className="label label--accent">
              Dossier {String(event.event_id).padStart(3, '0')}
            </span>
          </div>
          <span className="label">
            [ {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} ]
          </span>
        </header>

        <div className="discovery__year">
          {year !== undefined && <FlipYear value={year} size={72} />}
        </div>

        <h2 className="discovery__title">{event.prompt}</h2>

        {event.explanation && (
          <p className="discovery__subtitle">« {event.explanation.split('.')[0]}. »</p>
        )}

        <p className="discovery__short">{event.description_short}</p>

        <aside className="discovery__did-you-know">
          <span className="label">Le savais-tu ?</span>
          <p>{event.explanation ?? "Cet événement a marqué l'histoire de l'IA en montrant ce que les machines peuvent accomplir !"}</p>
        </aside>

        <div className="discovery__spacer" />

        <footer className="discovery__footer">
          <span className="label discovery__hint">◀  →  Utilisez les flèches</span>
          <div className="discovery__actions">
            <Button variant="outline" onClick={onPrev} disabled={index === 0}>
              ← Précédent
            </Button>
            {isLast ? (
              <Button variant="secondary" onClick={onNext}>
                Lancer le quiz →
              </Button>
            ) : (
              <Button variant="primary" onClick={onNext}>
                Suivant →
              </Button>
            )}
          </div>
        </footer>
      </section>

      {/* ==================== RIGHT — Visual specimen ==================== */}
      <section className="discovery__right">
        <header className="discovery__specimen-header">
          <span className="label discovery__specimen-label">Spécimen Chronologique</span>
          <span className="discovery__coords">
            LAT {lat}° N · LONG {long}° E
          </span>
        </header>

        <div className="discovery__media">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.prompt}
              className="discovery__image"
              draggable={false}
            />
          ) : (
            <div
              className={`discovery__placeholder discovery__placeholder--${tone}`}
              aria-label={`Placeholder pour ${event.prompt}`}
            >
              <span className="discovery__placeholder-label">[ ARCHIVE ]</span>
              <span className="discovery__placeholder-title">
                {event.prompt.toUpperCase()} — {year ?? ''}
              </span>
              <span className="discovery__placeholder-inner" />
            </div>
          )}

          <span className="discovery__scanlines" aria-hidden />
          <span className="discovery__crosshair discovery__crosshair--tl" aria-hidden />
          <span className="discovery__crosshair discovery__crosshair--tr" aria-hidden />
          <span className="discovery__crosshair discovery__crosshair--bl" aria-hidden />
          <span className="discovery__crosshair discovery__crosshair--br" aria-hidden />

          <div className="discovery__stamp">
            <Stamp color="green" rotate={-4}>Archivé</Stamp>
          </div>
        </div>

        <div className="discovery__meta">
          <div className="discovery__meta-cell">
            <span className="discovery__meta-k">Période</span>
            <span className="discovery__meta-v">{chapterName}</span>
          </div>
          <div className="discovery__meta-cell">
            <span className="discovery__meta-k">Année</span>
            <span className="discovery__meta-v">{year ?? '—'}</span>
          </div>
          <div className="discovery__meta-cell">
            <span className="discovery__meta-k">Difficulté</span>
            <span className="discovery__meta-v">
              {event.difficulty === 1 ? 'Facile' : event.difficulty === 2 ? 'Moyen' : 'Difficile'}
            </span>
          </div>
        </div>

        <div className="discovery__progress" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`discovery__progress-seg ${i <= index ? 'is-on' : ''}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
