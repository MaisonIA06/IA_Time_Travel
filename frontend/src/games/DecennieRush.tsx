/**
 * DecennieRush — identifier tous les événements d'une décennie donnée.
 *
 * Design brutaliste MIA cohérent avec Duel des dates (§ handoff §4b).
 * Layout : header + timer bar + grid 6 cartes + footer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stamp } from '../components/instrument'
import type { QuizItem } from '../types'
import './DecennieRush.css'

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

interface DecennieRushProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip?: () => void
}

interface RoundSetup {
  decade: number
  cards: QuizItem[]
}

function buildRound(items: QuizItem[]): RoundSetup | null {
  if (items.length < CARD_COUNT) return null
  const byDecade = new Map<number, QuizItem[]>()
  for (const item of items) {
    const d = yearToDecade(item.year_correct)
    const bucket = byDecade.get(d) ?? []
    bucket.push(item)
    byDecade.set(d, bucket)
  }
  const eligible = [...byDecade.entries()].filter(([, l]) => l.length >= MIN_IN_DECADE)
  if (eligible.length === 0) return null
  const [decade, insiders] = eligible[Math.floor(Math.random() * eligible.length)]

  const maxInsiders = Math.min(MAX_IN_DECADE, insiders.length)
  const target = Math.min(
    maxInsiders,
    Math.max(
      MIN_IN_DECADE,
      Math.floor(Math.random() * (maxInsiders - MIN_IN_DECADE + 1)) + MIN_IN_DECADE
    )
  )
  const outsiders = items.filter((i) => yearToDecade(i.year_correct) !== decade)
  const needed = CARD_COUNT - target
  if (outsiders.length < needed) {
    const fbInsiders = Math.min(insiders.length, CARD_COUNT)
    const fbOutsiders = CARD_COUNT - fbInsiders
    if (fbOutsiders > outsiders.length) return null
    return {
      decade,
      cards: shuffle([
        ...shuffle(insiders).slice(0, fbInsiders),
        ...shuffle(outsiders).slice(0, fbOutsiders),
      ]),
    }
  }
  return {
    decade,
    cards: shuffle([
      ...shuffle(insiders).slice(0, target),
      ...shuffle(outsiders).slice(0, needed),
    ]),
  }
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
      const s = resolveStatus(card, round.decade, selected)
      statuses.set(card.event_id, s)
      if (s === 'good') corrects++
      else if (s === 'wrong') errors++
      else if (s === 'missed') missed++
    }
    const net = corrects - errors
    const bonus = Math.min(SCORE_MAX, Math.max(SCORE_MIN, net * POINTS_PER_NET))
    setSummary({ corrects, errors, missed, bonus, statuses })
  }, [round, selected, summary])

  useEffect(() => {
    if (timeLeft <= 0 && !summary && round) handleValidate()
  }, [timeLeft, summary, round, handleValidate])

  useEffect(() => {
    if (!summary || completedRef.current) return
    completedRef.current = true
    const id = window.setTimeout(() => onComplete(summary.bonus), 2600)
    return () => window.clearTimeout(id)
  }, [summary, onComplete])

  const toggleCard = useCallback(
    (id: number) => {
      if (isFinished) return
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [isFinished]
  )

  if (!round) {
    return (
      <div className="dr dr--empty">
        <h2>Mini-jeu indisponible</h2>
        <p>Pas assez d'événements dans une même décennie pour cette manche.</p>
        {onSkip && (
          <button type="button" className="btn btn-primary" onClick={onSkip}>
            Continuer
          </button>
        )}
      </div>
    )
  }

  const timerPercent = Math.max(0, (timeLeft / TIMER_SECONDS) * 100)
  const timerLow = timeLeft <= 10
  const insiderCount = round.cards.filter(
    (c) => yearToDecade(c.year_correct) === round.decade
  ).length

  return (
    <div className="dr">
      <header className="dr__header">
        <div>
          <span className="label label--accent">Décennie Rush</span>
          <h2 className="dr__title">
            Les années <em>{round.decade}</em>
          </h2>
          <p className="dr__instruction">
            Sélectionne tous les événements qui se sont produits dans cette décennie.
          </p>
        </div>
        <div className="dr__stats">
          <span className="dr__stat">
            {selected.size}/{insiderCount} sélectionnés
          </span>
          <span className={`dr__stat dr__timer ${timerLow ? 'is-low' : ''}`}>
            ⏱ {Math.max(0, timeLeft)}s
          </span>
        </div>
      </header>

      <div className="dr__timer-bar">
        <div
          className={`dr__timer-fill ${timerLow ? 'is-low' : ''}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      <main className="dr__grid" role="group" aria-label="Cartes d'événements">
        {round.cards.map((card) => {
          const isSelected = selected.has(card.event_id)
          const status = summary?.statuses.get(card.event_id)
          const classes = ['dr__card']
          if (status === 'good') classes.push('dr__card--good')
          else if (status === 'wrong') classes.push('dr__card--wrong')
          else if (status === 'missed') classes.push('dr__card--missed')
          else if (isSelected) classes.push('dr__card--selected')

          return (
            <button
              key={card.event_id}
              type="button"
              className={classes.join(' ')}
              onClick={() => toggleCard(card.event_id)}
              disabled={isFinished}
              aria-pressed={isSelected}
            >
              <span className="label">Archive n° {card.event_id}</span>
              <span className="dr__card-title">{card.prompt}</span>
              {status && (
                <span className="dr__card-marker">
                  {status === 'good' && '✓'}
                  {status === 'wrong' && '✗'}
                  {status === 'missed' && '△'}
                </span>
              )}
              <span className="dr__card-year">
                {isFinished ? card.year_correct : '?'}
              </span>
            </button>
          )
        })}
      </main>

      {summary ? (
        <div className="dr__summary" role="status">
          <div className="dr__summary-stats">
            <span className="dr__stat-chip dr__stat-chip--good">
              ✓ {summary.corrects} bons
            </span>
            <span className="dr__stat-chip dr__stat-chip--wrong">
              ✗ {summary.errors} erreurs
            </span>
            <span className="dr__stat-chip dr__stat-chip--miss">
              △ {summary.missed} oubliés
            </span>
          </div>
          <Stamp color={summary.bonus > 0 ? 'ink' : 'red'} rotate={-3}>
            +{summary.bonus} pts
          </Stamp>
        </div>
      ) : (
        <footer className="dr__footer">
          <span>
            Cliquez les événements de cette décennie — +{POINTS_PER_NET} pts par bonne
            réponse, malus par erreur
          </span>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleValidate}>
            Valider ({selected.size})
          </button>
        </footer>
      )}
    </div>
  )
}
