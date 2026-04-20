/**
 * Mini-jeu DecennieRush - Identifier tous les événements d'une décennie donnée
 *
 * Pédagogie : permet d'associer chaque événement à la période (décennie) à
 * laquelle il appartient. Le joueur doit sélectionner tous et seulement les
 * événements qui appartiennent à la décennie affichée, en moins de 30 secondes.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Button, Card, Badge } from '../components/ui'
import { CheckIcon, CrossIcon, ValidateIcon, TimeIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './DecennieRush.css'

interface DecennieRushProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip?: () => void
}

type CardStatus = 'good' | 'wrong' | 'missed' | 'ignored'

const TIMER_SECONDS = 30
const CARD_COUNT = 6
const MIN_IN_DECADE = 3
const MAX_IN_DECADE = 4
const POINTS_PER_NET = 30
const SCORE_MIN = 0
const SCORE_MAX = 250

const yearToDecade = (year: number): number => Math.floor(year / 10) * 10

const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5)

interface RoundSetup {
  decade: number
  cards: QuizItem[]
}

/**
 * Construit une manche : choisit une décennie comptant au moins MIN_IN_DECADE
 * événements, puis assemble 6 cartes (3-4 de cette décennie + le reste
 * d'autres décennies). Retourne null si le pool est insuffisant.
 */
function buildRound(items: QuizItem[]): RoundSetup | null {
  if (items.length < CARD_COUNT) return null

  const byDecade = new Map<number, QuizItem[]>()
  for (const item of items) {
    const decade = yearToDecade(item.year_correct)
    const bucket = byDecade.get(decade) ?? []
    bucket.push(item)
    byDecade.set(decade, bucket)
  }

  const eligibleDecades = [...byDecade.entries()].filter(
    ([, list]) => list.length >= MIN_IN_DECADE
  )
  if (eligibleDecades.length === 0) return null

  const [decade, insiders] = eligibleDecades[
    Math.floor(Math.random() * eligibleDecades.length)
  ]

  const maxInsiders = Math.min(MAX_IN_DECADE, insiders.length)
  const targetInsiders = Math.min(
    maxInsiders,
    Math.max(MIN_IN_DECADE, Math.floor(Math.random() * (maxInsiders - MIN_IN_DECADE + 1)) + MIN_IN_DECADE)
  )

  const outsiders = items.filter((i) => yearToDecade(i.year_correct) !== decade)
  const neededOutsiders = CARD_COUNT - targetInsiders
  if (outsiders.length < neededOutsiders) {
    // Pas assez d'outsiders : on remplit avec plus d'insiders si possible.
    const fallbackInsiders = Math.min(insiders.length, CARD_COUNT)
    const fallbackOutsiders = CARD_COUNT - fallbackInsiders
    if (fallbackOutsiders > outsiders.length) return null
    const picked = [
      ...shuffle(insiders).slice(0, fallbackInsiders),
      ...shuffle(outsiders).slice(0, fallbackOutsiders)
    ]
    return { decade, cards: shuffle(picked) }
  }

  const picked = [
    ...shuffle(insiders).slice(0, targetInsiders),
    ...shuffle(outsiders).slice(0, neededOutsiders)
  ]
  return { decade, cards: shuffle(picked) }
}

function resolveStatus(item: QuizItem, decade: number, selected: Set<number>): CardStatus {
  const belongs = yearToDecade(item.year_correct) === decade
  const picked = selected.has(item.event_id)
  if (belongs && picked) return 'good'
  if (!belongs && picked) return 'wrong'
  if (belongs && !picked) return 'missed'
  return 'ignored'
}

export function DecennieRush({ items, onComplete, onSkip }: DecennieRushProps) {
  const round = useMemo(() => buildRound(items), [items])

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [summary, setSummary] = useState<{
    corrects: number
    errors: number
    missed: number
    bonus: number
    statuses: Map<number, CardStatus>
  } | null>(null)
  const completedRef = useRef(false)
  const isFinished = summary !== null

  // Timer décroissant — se fige lorsque la manche est terminée.
  useEffect(() => {
    if (isFinished || !round) return
    const tick = window.setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => window.clearInterval(tick)
  }, [isFinished, round])

  const handleValidate = useCallback(() => {
    if (!round || summary) return
    let corrects = 0
    let errors = 0
    let missed = 0
    const statuses = new Map<number, CardStatus>()
    for (const card of round.cards) {
      const status = resolveStatus(card, round.decade, selected)
      statuses.set(card.event_id, status)
      if (status === 'good') corrects++
      else if (status === 'wrong') errors++
      else if (status === 'missed') missed++
    }
    const net = corrects - errors
    const bonus = Math.min(SCORE_MAX, Math.max(SCORE_MIN, net * POINTS_PER_NET))
    setSummary({ corrects, errors, missed, bonus, statuses })
  }, [round, selected, summary])

  // Fin automatique lorsque le timer atteint 0.
  useEffect(() => {
    if (timeLeft <= 0 && !summary && round) {
      handleValidate()
    }
  }, [timeLeft, summary, round, handleValidate])

  // Appel unique de onComplete après le feedback.
  useEffect(() => {
    if (!summary || completedRef.current) return
    completedRef.current = true
    const id = window.setTimeout(() => onComplete(summary.bonus), 2600)
    return () => window.clearTimeout(id)
  }, [summary, onComplete])

  const toggleCard = useCallback((id: number) => {
    if (isFinished) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [isFinished])

  if (!round) {
    return (
      <Card variant="glass" padding="lg" className="decennie-rush">
        <div className="dr-fallback">
          <h2>Mini-jeu indisponible</h2>
          <p>Pas assez d'événements dans une même décennie pour cette manche.</p>
          {onSkip && (
            <Button variant="primary" onClick={onSkip}>
              Continuer
            </Button>
          )}
        </div>
      </Card>
    )
  }

  const timerPercent = Math.max(0, (timeLeft / TIMER_SECONDS) * 100)
  const timerLow = timeLeft <= 10

  return (
    <Card variant="glass" padding="lg" className="decennie-rush">
      <div className="dr-header">
        <Badge variant="purple" size="lg" glow>
          Décennie Rush
        </Badge>
        <h2 className="dr-decade">Les années {round.decade}</h2>
        <p className="dr-instruction">
          Sélectionne tous les événements qui se sont produits dans cette décennie.
        </p>
      </div>

      <div className={`dr-timer ${timerLow ? 'low' : ''}`} aria-live="polite">
        <TimeIcon size={18} />
        <span className="dr-timer-value">{Math.max(0, timeLeft)}s</span>
        <div className="dr-timer-bar">
          <div
            className="dr-timer-fill"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      <div className="dr-grid" role="group" aria-label="Cartes d'événements">
        {round.cards.map((card) => {
          const isSelected = selected.has(card.event_id)
          const status = summary?.statuses.get(card.event_id)
          const stateClass = status ? `dr-${status}` : isSelected ? 'dr-selected' : ''
          return (
            <button
              key={card.event_id}
              type="button"
              className={`dr-card ${stateClass}`}
              onClick={() => toggleCard(card.event_id)}
              disabled={isFinished}
              aria-pressed={isSelected}
            >
              {card.image_url && (
                <div
                  className="dr-card-image"
                  style={{ backgroundImage: `url(${card.image_url})` }}
                  aria-hidden="true"
                />
              )}
              <div className="dr-card-body">
                <span className="dr-card-title">{card.prompt}</span>
                {status && (
                  <span className="dr-card-marker">
                    {status === 'good' && <CheckIcon size={18} color="var(--aa-success)" />}
                    {status === 'wrong' && <CrossIcon size={18} color="var(--aa-error)" />}
                    {status === 'missed' && (
                      <span className="dr-marker-missed" aria-label="Oublié">△</span>
                    )}
                  </span>
                )}
                {isFinished && (
                  <span className="dr-card-year">
                    {card.year_correct}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {summary ? (
        <div className="dr-summary" role="status" aria-live="polite">
          <div className="dr-summary-stats">
            <span className="dr-stat dr-stat-good">
              <CheckIcon size={16} color="var(--aa-success)" /> {summary.corrects} bons
            </span>
            <span className="dr-stat dr-stat-wrong">
              <CrossIcon size={16} color="var(--aa-error)" /> {summary.errors} erreurs
            </span>
            <span className="dr-stat dr-stat-miss">
              △ {summary.missed} oubliés
            </span>
          </div>
          <div className="dr-summary-bonus">
            <Badge variant="accent" size="lg" glow>
              +{summary.bonus} pts bonus
            </Badge>
          </div>
        </div>
      ) : (
        <div className="dr-actions">
          <Button variant="primary" size="lg" onClick={handleValidate}>
            <ValidateIcon size={20} /> Valider ({selected.size})
          </Button>
          {onSkip && (
            <Button variant="ghost" size="md" onClick={onSkip}>
              Passer
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
