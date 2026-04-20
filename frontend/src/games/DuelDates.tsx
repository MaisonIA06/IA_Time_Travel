/**
 * DuelDates — "Duel des dates" (§ screen-minigames.jsx / DuelGame).
 *
 * Layout : header + arena 3 colonnes (carte A | bandeau VS | carte B) + footer.
 * Le joueur clique la carte qui lui semble la plus ancienne. Les années sont
 * masquées jusqu'au pick. +50 pts par bonne réponse. 5 duels, bonus total 250.
 */

import { useCallback, useMemo, useState } from 'react'
import { FlipYear, Stamp } from '../components/instrument'
import type { QuizItem } from '../types'
import './DuelDates.css'

const TOTAL_DUELS = 5
const MAX_BONUS = 250
const FEEDBACK_DELAY_MS = 1400

interface DuelDatesProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip?: () => void
}

interface Duel {
  left: QuizItem
  right: QuizItem
}

type Side = 'left' | 'right'

function buildDuels(items: QuizItem[], count: number): Duel[] {
  const usable = items.filter((item) => Number.isFinite(item.year_correct))
  if (usable.length < 2) return []

  const duels: Duel[] = []
  const seen = new Set<string>()
  let safety = 0

  while (duels.length < count && safety < count * 50) {
    safety++
    const shuffled = [...usable].sort(() => Math.random() - 0.5)
    const left = shuffled[0]
    const right = shuffled.find(
      (it) => it.event_id !== left.event_id && it.year_correct !== left.year_correct
    )
    if (!right) continue

    const key = [left.event_id, right.event_id].sort((a, b) => a - b).join('-')
    if (seen.has(key)) continue
    seen.add(key)
    duels.push({ left, right })
  }

  return duels
}

function toneFor(eventId: number): 'terra' | 'blue' | 'green' {
  const tones = ['terra', 'blue', 'green'] as const
  return tones[eventId % tones.length]
}

export function DuelDates({ items, onComplete }: DuelDatesProps) {
  const duels = useMemo(() => buildDuels(items, TOTAL_DUELS), [items])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<Side | null>(null)

  const currentDuel = duels[currentIndex]
  const isFinished = duels.length > 0 && currentIndex >= duels.length
  const olderSide: Side | null = currentDuel
    ? currentDuel.left.year_correct < currentDuel.right.year_correct
      ? 'left'
      : 'right'
    : null

  const handlePick = useCallback(
    (side: Side) => {
      if (!currentDuel || picked || !olderSide) return

      const nextCorrect = correctCount + (side === olderSide ? 1 : 0)
      setPicked(side)
      setCorrectCount(nextCorrect)

      window.setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= duels.length) {
          const ratio = nextCorrect / duels.length
          const bonus = Math.round(ratio * MAX_BONUS)
          onComplete(bonus)
          setCurrentIndex(nextIndex)
        } else {
          setCurrentIndex(nextIndex)
          setPicked(null)
        }
      }, FEEDBACK_DELAY_MS)
    },
    [currentDuel, picked, olderSide, correctCount, currentIndex, duels.length, onComplete]
  )

  if (duels.length === 0) {
    return (
      <div className="duel duel--empty">
        <h2>Duel des dates</h2>
        <p>Pas assez d'événements pour lancer le duel.</p>
      </div>
    )
  }

  if (isFinished || !currentDuel) {
    return (
      <div className="duel duel--empty">
        <h2>{correctCount} / {duels.length} bonnes réponses</h2>
        <p>+{Math.round((correctCount / duels.length) * MAX_BONUS)} pts</p>
      </div>
    )
  }

  const score = correctCount * 50

  const renderCard = (side: Side, item: QuizItem, label: string) => {
    const isPicked = picked === side
    const show = picked !== null
    const isCorrect = show && side === olderSide
    const tone = toneFor(item.event_id)

    const classes = ['duel__card']
    if (show && isCorrect) classes.push('duel__card--correct')
    else if (show && isPicked && !isCorrect) classes.push('duel__card--wrong')
    else if (show) classes.push('duel__card--muted')

    return (
      <button
        type="button"
        onClick={() => handlePick(side)}
        disabled={show}
        className={classes.join(' ')}
        aria-label={`Choisir : ${item.prompt}`}
      >
        <span className="label">{label}</span>
        <h3 className="duel__card-title">{item.prompt}</h3>
        {item.description_short && (
          <p className="duel__card-subtitle">{item.description_short.split('.')[0]}.</p>
        )}

        <div className="duel__card-media">
          {item.image_url ? (
            <img src={item.image_url} alt={item.prompt} draggable={false} />
          ) : (
            <div className={`duel__placeholder duel__placeholder--${tone}`}>
              <span className="label">[ Archive ]</span>
              <span>{item.prompt}</span>
            </div>
          )}
        </div>

        {show ? (
          <div className="duel__card-reveal">
            <FlipYear value={item.year_correct} size={40} />
            {isCorrect && <Stamp color="ink" rotate={-3}>Plus ancien</Stamp>}
          </div>
        ) : (
          <span className="duel__card-masked">Date masquée</span>
        )}
      </button>
    )
  }

  return (
    <div className="duel">
      <header className="duel__header">
        <div>
          <span className="label label--accent">Duel des dates</span>
          <h2 className="duel__title">
            Lequel est le <em>plus ancien</em> ?
          </h2>
        </div>
        <div className="duel__stats">
          <span className="duel__stat">Manche {currentIndex + 1}</span>
          <span className="duel__stat duel__stat--pts">{score} pts</span>
        </div>
      </header>

      <main className="duel__arena">
        {renderCard('left', currentDuel.left, `Archive n° ${currentDuel.left.event_id}`)}
        <div className="duel__vs" aria-hidden>VS</div>
        {renderCard('right', currentDuel.right, `Archive n° ${currentDuel.right.event_id}`)}
      </main>

      <footer className="duel__footer">
        Cliquez sur la carte qui vous semble la plus ancienne — +50 pts par bonne réponse
      </footer>
    </div>
  )
}
