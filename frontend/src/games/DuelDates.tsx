/**
 * Mini-jeu DuelDates - Deviner l'antériorité entre deux événements
 *
 * Pédagogie : apprendre les dates de l'histoire de l'IA par comparaison.
 * 5 duels : on choisit l'événement le plus ancien, l'année est révélée,
 * et un bonus proportionnel aux bonnes réponses (0-250) est attribué.
 */

import { useState, useMemo, useCallback } from 'react'
import { Card, Badge } from '../components/ui'
import { CheckIcon, CrossIcon, TimeIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './DuelDates.css'

const TOTAL_DUELS = 5
const MAX_BONUS = 250
const FEEDBACK_DELAY_MS = 1000
const NEXT_DELAY_MS = 600

interface DuelDatesProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
}

interface Duel {
  left: QuizItem
  right: QuizItem
}

/**
 * Construit jusqu'à `count` duels distincts à partir de la liste fournie.
 * Chaque duel évite que `left` et `right` partagent la même année (sinon
 * la question d'antériorité n'a pas de bonne réponse).
 */
function buildDuels(items: QuizItem[], count: number): Duel[] {
  const usable = items.filter((item) => Number.isFinite(item.year_correct))
  if (usable.length < 2) return []

  const duels: Duel[] = []
  const seenPairs = new Set<string>()
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
    if (seenPairs.has(key)) continue

    seenPairs.add(key)
    duels.push({ left, right })
  }

  return duels
}

type Side = 'left' | 'right'

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
  const isCorrect = picked !== null && picked === olderSide

  const finish = useCallback(
    (finalCorrect: number) => {
      const ratio = duels.length > 0 ? finalCorrect / duels.length : 0
      const bonus = Math.round(ratio * MAX_BONUS)
      onComplete(bonus)
    },
    [duels.length, onComplete]
  )

  const handlePick = useCallback(
    (side: Side) => {
      if (!currentDuel || picked || !olderSide) return

      const nextCorrectCount = correctCount + (side === olderSide ? 1 : 0)

      setPicked(side)
      setCorrectCount(nextCorrectCount)

      window.setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= duels.length) {
          // Petit délai pour que le joueur voie le dernier feedback.
          window.setTimeout(() => finish(nextCorrectCount), NEXT_DELAY_MS)
          setCurrentIndex(nextIndex)
        } else {
          setCurrentIndex(nextIndex)
          setPicked(null)
        }
      }, FEEDBACK_DELAY_MS)
    },
    [currentDuel, picked, olderSide, correctCount, currentIndex, duels.length, finish]
  )

  // Pas assez d'événements pour former un duel : on termine sans bonus.
  if (duels.length === 0) {
    return (
      <Card variant="glass" padding="lg" className="duel-dates duel-dates--empty">
        <h2>Duel des dates</h2>
        <p>Pas assez d'événements pour ce mini-jeu.</p>
      </Card>
    )
  }

  if (isFinished || !currentDuel) {
    return (
      <Card variant="glass" padding="lg" className="duel-dates duel-dates--result">
        <div className="duel-result">
          <div className="duel-result-icon">
            <TimeIcon size={56} color="var(--aa-accent)" />
          </div>
          <h2>{correctCount}/{duels.length} bons duels</h2>
          <p>
            {correctCount === duels.length
              ? 'Sans-faute ! Tu maîtrises la chronologie de l\'IA.'
              : correctCount >= Math.ceil(duels.length * 0.6)
                ? 'Bien joué ! Tu situes les grandes étapes de l\'IA.'
                : 'Continue, tu vas vite t\'améliorer !'}
          </p>
        </div>
      </Card>
    )
  }

  const renderSide = (side: Side, item: QuizItem) => {
    const isPicked = picked === side
    const isWinner = picked !== null && side === olderSide
    const isLoser = picked !== null && side !== olderSide

    const className = [
      'duel-card',
      isPicked ? 'duel-card--picked' : '',
      isWinner ? 'duel-card--winner' : '',
      isLoser ? 'duel-card--loser' : ''
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        type="button"
        className={className}
        onClick={() => handlePick(side)}
        disabled={picked !== null}
        aria-label={`Choisir : ${item.prompt}`}
      >
        {item.image_url && (
          <div className="duel-card-image">
            <img src={item.image_url} alt="" loading="lazy" />
          </div>
        )}
        <h3 className="duel-card-title">{item.prompt}</h3>
        {item.description_short && (
          <p className="duel-card-description">{item.description_short}</p>
        )}
        {picked !== null && (
          <div className="duel-card-year">
            <Badge variant={isWinner ? 'accent' : 'default'} size="lg" glow={isWinner}>
              {item.year_correct}
            </Badge>
          </div>
        )}
      </button>
    )
  }

  return (
    <Card variant="glass" padding="lg" className="duel-dates">
      <div className="duel-header">
        <Badge variant="purple" size="lg" glow>
          Duel des dates
        </Badge>
        <h2>Lequel est le plus ancien&nbsp;?</h2>
        <p className="duel-subtitle">
          Duel {Math.min(currentIndex + 1, duels.length)} / {duels.length}
        </p>
        <div className="duel-progress">
          <div
            className="duel-progress-fill"
            style={{ width: `${((currentIndex + (picked ? 1 : 0)) / duels.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="duel-arena">
        {renderSide('left', currentDuel.left)}
        <div className="duel-vs" aria-hidden="true">VS</div>
        {renderSide('right', currentDuel.right)}
      </div>

      {picked !== null && (
        <div className={`duel-feedback ${isCorrect ? 'duel-feedback--correct' : 'duel-feedback--wrong'}`}>
          {isCorrect ? (
            <>
              <CheckIcon size={24} color="var(--aa-success)" /> Bien vu&nbsp;!
            </>
          ) : (
            <>
              <CrossIcon size={24} color="var(--aa-error)" /> Raté&nbsp;!
            </>
          )}
        </div>
      )}

      <div className="duel-score" aria-live="polite">
        Score&nbsp;: {correctCount} / {duels.length}
      </div>
    </Card>
  )
}
