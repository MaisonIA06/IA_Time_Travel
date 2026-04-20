/**
 * Mini-jeu AvantApres - Situer un événement par rapport à une date de référence
 *
 * Format rapide "tinder" : on voit un événement (titre + image, sans l'année),
 * et une année de référence bien connue. L'élève choisit AVANT ou APRÈS.
 * Feedback d'1 seconde qui révèle la vraie année. 8 manches au total.
 */

import { useState, useEffect, useCallback, useMemo, useRef, type TouchEvent as ReactTouchEvent } from 'react'
import { Button, Card, Badge } from '../components/ui'
import { CheckIcon, CrossIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './AvantApres.css'

interface AvantApresProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
}

// Repères historiques parlants pour les élèves.
const REFERENCE_YEARS = [1950, 1980, 1995, 2000, 2010, 2015, 2020]

const TOTAL_ROUNDS = 8

// 30 × 8 = 240, plafonné à 250.
const POINTS_PER_CORRECT = 30
const MAX_SCORE = 250

const FEEDBACK_DURATION_MS = 1000
const SWIPE_THRESHOLD_PX = 60

interface Round {
  item: QuizItem
  reference: number
  // true = la bonne réponse est "avant", false = "après"
  answerIsBefore: boolean
}

type Answer = 'before' | 'after'

const POSITIVE_FEEDBACKS = ['Bien vu !', 'Nickel !', 'Pile-poil !', 'Bravo !']
const NEGATIVE_FEEDBACKS = ['Presque !', 'Pas tout à fait...', 'Raté !', 'Oups !']

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Construit la liste des manches à partir des événements du quiz.
 * On choisit pour chaque item une année de référence qui n'est pas
 * égale à l'année de l'événement (sinon la question n'aurait pas de sens).
 */
function buildRounds(items: QuizItem[]): Round[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  const rounds: Round[] = []

  for (const item of shuffled) {
    if (rounds.length >= TOTAL_ROUNDS) break

    // Choisir une année de référence différente de l'année de l'événement.
    const candidates = REFERENCE_YEARS.filter(y => y !== item.year_correct)
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
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    userAnswer: Answer
    message: string
  } | null>(null)

  // Garde-fou pour éviter les doubles réponses pendant le feedback.
  const lockRef = useRef(false)
  const touchStartXRef = useRef<number | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentRound = rounds[currentIndex]
  const isFinished = currentIndex >= rounds.length

  useEffect(() => {
    if (!isFinished) return
    const bonusPoints = Math.min(correctCount * POINTS_PER_CORRECT, MAX_SCORE)
    const timer = setTimeout(() => onComplete(bonusPoints), 400)
    return () => clearTimeout(timer)
  }, [isFinished, correctCount, onComplete])

  // Nettoyer un timer de feedback en cours si le composant se démonte.
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  const handleAnswer = useCallback((answer: Answer) => {
    if (lockRef.current || !currentRound) return
    lockRef.current = true

    const userSaysBefore = answer === 'before'
    const isCorrect = userSaysBefore === currentRound.answerIsBefore

    setFeedback({
      isCorrect,
      userAnswer: answer,
      message: isCorrect ? pickRandom(POSITIVE_FEEDBACKS) : pickRandom(NEGATIVE_FEEDBACKS),
    })
    if (isCorrect) setCorrectCount(c => c + 1)

    feedbackTimerRef.current = setTimeout(() => {
      feedbackTimerRef.current = null
      setFeedback(null)
      setCurrentIndex(i => i + 1)
      lockRef.current = false
    }, FEEDBACK_DURATION_MS)
  }, [currentRound])

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

  // Swipe tactile : gauche = AVANT, droite = APRÈS.
  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: ReactTouchEvent) => {
    const start = touchStartXRef.current
    touchStartXRef.current = null
    if (start === null) return
    const delta = e.changedTouches[0].clientX - start
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    handleAnswer(delta < 0 ? 'before' : 'after')
  }, [handleAnswer])

  if (!currentRound) {
    return (
      <Card variant="glass" padding="lg" className="aa-game">
        <div className="aa-final">
          <h2>{correctCount} / {rounds.length}</h2>
          <p>
            {correctCount === rounds.length
              ? 'Sans-faute !'
              : correctCount >= rounds.length * 0.6
                ? 'Bien joué !'
                : 'Tu fais mieux la prochaine fois.'}
          </p>
        </div>
      </Card>
    )
  }

  const showingFeedback = feedback !== null

  return (
    <Card variant="glass" padding="lg" className="aa-game">
      <header className="aa-header">
        <Badge variant="purple" size="lg" glow>
          Avant ou Après ?
        </Badge>
        <div className="aa-progress">
          <span className="aa-progress-text">
            {currentIndex + 1} / {rounds.length}
          </span>
          <div className="aa-progress-bar">
            <div
              className="aa-progress-fill"
              style={{ width: `${((currentIndex + 1) / rounds.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div
        className={`aa-card ${showingFeedback ? (feedback.isCorrect ? 'is-correct' : 'is-wrong') : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentRound.item.image_url && (
          <div className="aa-image">
            <img
              src={currentRound.item.image_url}
              alt=""
              loading="lazy"
            />
          </div>
        )}
        <h2 className="aa-title">{currentRound.item.prompt}</h2>

        {showingFeedback && (
          <div className={`aa-feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
            <div className="aa-feedback-icon">
              {feedback.isCorrect
                ? <CheckIcon size={28} color="var(--aa-success)" />
                : <CrossIcon size={28} color="var(--aa-error)" />}
            </div>
            <p className="aa-feedback-message">{feedback.message}</p>
            <p className="aa-feedback-year">
              Vraie année : <strong>{currentRound.item.year_correct}</strong>
            </p>
          </div>
        )}
      </div>

      <p className="aa-reference">
        Référence : <strong>{currentRound.reference}</strong>
      </p>

      <div className="aa-choices" role="group" aria-label="Choisir avant ou après">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => handleAnswer('before')}
          disabled={showingFeedback}
          className={`aa-choice aa-choice-before ${
            showingFeedback && currentRound.answerIsBefore ? 'aa-choice-right' : ''
          } ${
            showingFeedback && feedback?.userAnswer === 'before' && !feedback.isCorrect
              ? 'aa-choice-wrong'
              : ''
          }`}
          aria-label={`Avant ${currentRound.reference}`}
        >
          <span className="aa-choice-arrow" aria-hidden="true">&larr;</span>
          <span className="aa-choice-label">AVANT {currentRound.reference}</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => handleAnswer('after')}
          disabled={showingFeedback}
          className={`aa-choice aa-choice-after ${
            showingFeedback && !currentRound.answerIsBefore ? 'aa-choice-right' : ''
          } ${
            showingFeedback && feedback?.userAnswer === 'after' && !feedback.isCorrect
              ? 'aa-choice-wrong'
              : ''
          }`}
          aria-label={`Après ${currentRound.reference}`}
        >
          <span className="aa-choice-label">APRÈS {currentRound.reference}</span>
          <span className="aa-choice-arrow" aria-hidden="true">&rarr;</span>
        </Button>
      </div>

      <p className="aa-hint">
        Flèches <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> ou swipe pour répondre.
      </p>

      <div className="aa-score">
        Score : {correctCount} / {rounds.length}
      </div>
    </Card>
  )
}
