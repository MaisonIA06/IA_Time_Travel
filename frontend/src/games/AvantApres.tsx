/**
 * AvantApres — situer un événement par rapport à une année pivot.
 *
 * Design brutaliste MIA (§ handoff §4c / screen-minigames.jsx BeforeAfterGame).
 * Layout : header + main (événement | pivot + boutons) + footer.
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { FlipYear } from '../components/instrument'
import type { QuizItem } from '../types'
import './AvantApres.css'

interface AvantApresProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip?: () => void
}

const REFERENCE_YEARS = [1950, 1980, 1995, 2000, 2010, 2015, 2020]
const TOTAL_ROUNDS = 8
const POINTS_PER_CORRECT = 30
const MAX_SCORE = 250
const FEEDBACK_DURATION_MS = 1500
const SWIPE_THRESHOLD_PX = 60

interface Round {
  item: QuizItem
  reference: number
  answerIsBefore: boolean
}

type Answer = 'before' | 'after'

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildRounds(items: QuizItem[]): Round[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  const rounds: Round[] = []
  for (const item of shuffled) {
    if (rounds.length >= TOTAL_ROUNDS) break
    const candidates = REFERENCE_YEARS.filter((y) => y !== item.year_correct)
    if (candidates.length === 0) continue
    const reference = pickRandom(candidates)
    rounds.push({
      item,
      reference,
      answerIsBefore: item.year_correct < reference,
    })
  }
  return rounds
}

export function AvantApres({ items, onComplete }: AvantApresProps) {
  const rounds = useMemo(() => buildRounds(items), [items])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<Answer | null>(null)

  const lockRef = useRef(false)
  const touchStartXRef = useRef<number | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentRound = rounds[currentIndex]
  const isFinished = currentIndex >= rounds.length
  const score = correctCount * POINTS_PER_CORRECT

  useEffect(() => {
    if (!isFinished) return
    const bonus = Math.min(correctCount * POINTS_PER_CORRECT, MAX_SCORE)
    const t = setTimeout(() => onComplete(bonus), 400)
    return () => clearTimeout(t)
  }, [isFinished, correctCount, onComplete])

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    },
    []
  )

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (lockRef.current || !currentRound) return
      lockRef.current = true

      const isCorrect =
        (answer === 'before') === currentRound.answerIsBefore
      setPicked(answer)
      if (isCorrect) setCorrectCount((c) => c + 1)

      feedbackTimerRef.current = setTimeout(() => {
        feedbackTimerRef.current = null
        setPicked(null)
        setCurrentIndex((i) => i + 1)
        lockRef.current = false
      }, FEEDBACK_DURATION_MS)
    },
    [currentRound]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleAnswer('before')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleAnswer('after')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleAnswer])

  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: ReactTouchEvent) => {
      const start = touchStartXRef.current
      touchStartXRef.current = null
      if (start === null) return
      const delta = e.changedTouches[0].clientX - start
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
      handleAnswer(delta < 0 ? 'before' : 'after')
    },
    [handleAnswer]
  )

  if (!currentRound) {
    return (
      <div className="ba ba--empty">
        <h2>{correctCount} / {rounds.length}</h2>
        <p>+{Math.min(correctCount * POINTS_PER_CORRECT, MAX_SCORE)} pts</p>
      </div>
    )
  }

  const showFeedback = picked !== null
  const correctAnswer: Answer = currentRound.answerIsBefore ? 'before' : 'after'

  const renderChoice = (value: Answer, arrow: string, label: string) => {
    const isPicked = picked === value
    const isCorrect = showFeedback && value === correctAnswer
    const isWrong = showFeedback && isPicked && !isCorrect

    const classes = ['ba__choice']
    if (isCorrect) classes.push('ba__choice--correct')
    else if (isWrong) classes.push('ba__choice--wrong')

    return (
      <button
        type="button"
        className={classes.join(' ')}
        onClick={() => handleAnswer(value)}
        disabled={showFeedback}
        aria-label={`${label} ${currentRound.reference}`}
      >
        {value === 'before' ? (
          <>
            <span className="ba__choice-arrow" aria-hidden>{arrow}</span>
            <span>Avant</span>
          </>
        ) : (
          <>
            <span>Après</span>
            <span className="ba__choice-arrow" aria-hidden>{arrow}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="ba" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="ba__header">
        <div>
          <span className="label label--accent">Avant ou Après ?</span>
          <h2 className="ba__title">Situer un événement par rapport à une année pivot</h2>
        </div>
        <div className="ba__stats">
          <span className="ba__stat">
            {currentIndex + 1} / {rounds.length}
          </span>
          <span className="ba__stat ba__stat--pts">{score} pts</span>
        </div>
      </header>

      <main className="ba__main">
        <section className="ba__event">
          <span className="label">Événement</span>
          <h3 className="ba__event-title">{currentRound.item.prompt}</h3>
          <p className="ba__event-short">{currentRound.item.description_short}</p>
          <div className="ba__event-year">
            {showFeedback && <FlipYear value={currentRound.item.year_correct} size={52} />}
          </div>
        </section>

        <section className="ba__pivot">
          <div>
            <span className="label ba__pivot-label">Année pivot</span>
            <div className="ba__pivot-year">
              <FlipYear value={currentRound.reference} size={64} />
            </div>
          </div>
          <div className="ba__choices">
            {renderChoice('before', '←', 'Avant')}
            {renderChoice('after', '→', 'Après')}
          </div>
        </section>
      </main>

      <footer className="ba__footer">
        +{POINTS_PER_CORRECT} pts par bonne réponse — l'année de l'événement reste masquée
        jusqu'à votre choix (← / → ou swipe)
      </footer>
    </div>
  )
}
