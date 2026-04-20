/**
 * Mini-jeu CourseContreTemps - Speed-quiz : 10 QCM années en 60 secondes.
 *
 * Pédagogique : mémoriser les dates par pratique rapide et répétée.
 * - Timer global 60s + timer par question (drame visuel).
 * - Score : 20 pts/bonne réponse + bonus vitesse (max 10 si < 2s).
 * - Bonus "finisher" de 50 pts si les 10 questions sont traitées avant la fin.
 * - Total maximum : 250 + 50 = 300 pts (plafonné par le scoring demandé).
 * - Accessibilité clavier : touches 1/2/3/4 pour répondre.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Badge } from '../components/ui'
import { CheckIcon, CrossIcon, TimeIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './CourseContreTemps.css'

interface CourseContreTempsProps {
  items: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip?: () => void
}

interface Question {
  item: QuizItem
  options: number[]
}

const TOTAL_QUESTIONS = 10
const GLOBAL_TIME_MS = 60_000
const QUESTION_TIME_MS = 8_000
const FEEDBACK_MS = 400
const POINTS_PER_CORRECT = 20
const SPEED_BONUS_MAX = 10
const SPEED_BONUS_THRESHOLD_MS = 2_000
const FINISHER_BONUS = 50

/** Génère 4 options d'années autour de la bonne réponse. */
function buildOptions(item: QuizItem): number[] {
  if (item.options_years && item.options_years.length >= 4) {
    return item.options_years.slice(0, 4)
  }
  const correct = item.year_correct
  const pool = new Set<number>([correct])
  const offsets = [-20, -10, -7, -5, -3, 3, 5, 7, 10, 20]
  while (pool.size < 4) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)]
    const candidate = correct + offset + Math.floor((Math.random() - 0.5) * 4)
    if (candidate !== correct) {
      pool.add(candidate)
    }
  }
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

type Phase = 'countdown' | 'playing' | 'finished'

export function CourseContreTemps({ items, onComplete, onSkip }: CourseContreTempsProps) {
  const questions = useMemo<Question[]>(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
    return shuffled.map(item => ({ item, options: buildOptions(item) }))
  }, [items])

  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [globalTimeLeft, setGlobalTimeLeft] = useState(GLOBAL_TIME_MS)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_MS)
  const [feedback, setFeedback] = useState<{ correct: boolean; year: number } | null>(null)
  const [finisherEarned, setFinisherEarned] = useState(false)

  const startRef = useRef<number | null>(null)
  const questionStartRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const scoreRef = useRef(0)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const completeTimeoutRef = useRef<number | null>(null)

  const finalize = useCallback(
    (finalScore: number, bonus: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setPhase('finished')
      setFinisherEarned(bonus)
      const total = finalScore + (bonus ? FINISHER_BONUS : 0)
      completeTimeoutRef.current = window.setTimeout(() => {
        onComplete(total)
      }, 1800)
    },
    [onComplete]
  )

  // Avance a la question suivante ou termine avec le bonus finisher.
  const advance = useCallback(
    (nextScore: number) => {
      setFeedback(null)
      setCurrentIndex(idx => {
        const next = idx + 1
        if (next >= questions.length) {
          finalize(nextScore, true)
          return idx
        }
        return next
      })
    },
    [questions.length, finalize]
  )

  // Compte à rebours initial ("3... 2... 1... GO !")
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      const now = Date.now()
      startRef.current = now
      questionStartRef.current = now
      setPhase('playing')
      return
    }
    const id = window.setTimeout(() => setCountdown(c => c - 1), 700)
    return () => window.clearTimeout(id)
  }, [phase, countdown])

  // Timer global 60s (tick toutes les 100ms)
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => {
      const elapsed = Date.now() - (startRef.current || Date.now())
      const remaining = Math.max(0, GLOBAL_TIME_MS - elapsed)
      setGlobalTimeLeft(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
        finalize(scoreRef.current, false)
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [phase, finalize])

  // Timer par question (tick toutes les 100ms)
  useEffect(() => {
    if (phase !== 'playing' || feedback) return
    questionStartRef.current = Date.now()
    setQuestionTimeLeft(QUESTION_TIME_MS)
    const id = window.setInterval(() => {
      const elapsed = Date.now() - (questionStartRef.current || Date.now())
      const remaining = Math.max(0, QUESTION_TIME_MS - elapsed)
      setQuestionTimeLeft(remaining)
      if (remaining <= 0) {
        window.clearInterval(id)
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [phase, feedback, currentIndex])

  const handleAnswer = useCallback(
    (year: number) => {
      if (phase !== 'playing' || feedback) return
      const question = questions[currentIndex]
      if (!question) return

      const timeTaken = Date.now() - (questionStartRef.current || Date.now())
      const isCorrect = year === question.item.year_correct
      let earned = 0
      if (isCorrect) {
        earned = POINTS_PER_CORRECT
        if (timeTaken < SPEED_BONUS_THRESHOLD_MS) {
          earned += Math.round(SPEED_BONUS_MAX * (1 - timeTaken / SPEED_BONUS_THRESHOLD_MS))
        }
      }

      setFeedback({ correct: isCorrect, year })
      const nextScore = score + earned
      if (isCorrect) {
        scoreRef.current = nextScore
        setScore(nextScore)
        setCorrectCount(c => c + 1)
      }

      feedbackTimeoutRef.current = window.setTimeout(() => {
        advance(nextScore)
      }, FEEDBACK_MS)
    },
    [phase, feedback, questions, currentIndex, score, advance]
  )

  // Expiration du timer par question = réponse manquée
  useEffect(() => {
    if (phase !== 'playing' || feedback) return
    if (questionTimeLeft > 0) return
    const question = questions[currentIndex]
    if (!question) return
    setFeedback({ correct: false, year: -1 })
    feedbackTimeoutRef.current = window.setTimeout(() => {
      advance(scoreRef.current)
    }, FEEDBACK_MS)
  }, [questionTimeLeft, phase, feedback, questions, currentIndex, advance])

  // Raccourcis clavier 1/2/3/4
  useEffect(() => {
    if (phase !== 'playing' || feedback) return
    const question = questions[currentIndex]
    if (!question) return
    const onKey = (e: KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key)
      if (idx === -1) return
      const year = question.options[idx]
      if (year !== undefined) handleAnswer(year)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, feedback, questions, currentIndex, handleAnswer])

  // Nettoyage des timeouts au démontage
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current)
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current)
    }
  }, [])

  const currentQuestion = questions[currentIndex]
  const globalSeconds = Math.ceil(globalTimeLeft / 1000)
  const globalPercent = (globalTimeLeft / GLOBAL_TIME_MS) * 100
  const questionPercent = (questionTimeLeft / QUESTION_TIME_MS) * 100
  const urgent = globalTimeLeft <= 10_000

  if (phase === 'countdown') {
    return (
      <Card variant="glass" padding="lg" className="cct-game cct-countdown">
        <Badge variant="accent" size="lg" glow>
          Course contre le temps
        </Badge>
        <p className="cct-intro">10 années, 60 secondes. A fond !</p>
        <div className="cct-countdown-number" key={countdown}>
          {countdown > 0 ? countdown : 'GO !'}
        </div>
        <p className="cct-hint">Astuce : touches 1 / 2 / 3 / 4 pour repondre plus vite</p>
      </Card>
    )
  }

  if (phase === 'finished') {
    const maxBase = TOTAL_QUESTIONS * (POINTS_PER_CORRECT + SPEED_BONUS_MAX)
    return (
      <Card variant="glass" padding="lg" className="cct-game cct-result">
        <div className="cct-result-icon">
          <CheckIcon size={48} color="var(--aa-success)" />
        </div>
        <h2>Temps ecoule !</h2>
        <p className="cct-result-score">
          {correctCount} / {TOTAL_QUESTIONS} bonnes reponses
        </p>
        <p className="cct-result-points">
          {score} pts{finisherEarned && ` + ${FINISHER_BONUS} pts finisher`}
        </p>
        <p className="cct-result-hint">
          {correctCount >= 8
            ? 'Boom ! Tu maitrises les dates !'
            : correctCount >= 5
              ? 'Bien joue ! Les dates commencent a rentrer.'
              : 'A retenter pour muscler ta memoire des dates.'}
        </p>
        <p className="cct-result-meta">Score base max : {maxBase} pts</p>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg" className="cct-game">
      <header className="cct-header">
        <Badge variant="accent" size="lg" glow>
          Course contre le temps
        </Badge>
        <div className={`cct-timer ${urgent ? 'urgent' : ''}`}>
          <TimeIcon size={20} color="currentColor" />
          <span className="cct-timer-value">{globalSeconds}s</span>
        </div>
      </header>

      <div className="cct-global-bar">
        <div
          className={`cct-global-fill ${urgent ? 'urgent' : ''}`}
          style={{ width: `${globalPercent}%` }}
        />
      </div>

      <div className="cct-stats">
        <span>Question {currentIndex + 1} / {TOTAL_QUESTIONS}</span>
        <span>{score} pts</span>
      </div>

      {currentQuestion && (
        <div className="cct-question">
          <div className="cct-question-bar">
            <div
              className="cct-question-fill"
              style={{ width: `${questionPercent}%` }}
            />
          </div>

          <p className="cct-prompt">{currentQuestion.item.prompt}</p>

          <div className="cct-options" role="group" aria-label="Choix d'annees">
            {currentQuestion.options.map((year, idx) => {
              const isCorrectAnswer =
                feedback && year === currentQuestion.item.year_correct
              const isWrongPick =
                feedback && !feedback.correct && feedback.year === year
              return (
                <Button
                  key={year}
                  variant="secondary"
                  size="lg"
                  onClick={() => handleAnswer(year)}
                  disabled={!!feedback}
                  className={`cct-option ${
                    isCorrectAnswer ? 'cct-option-correct' : ''
                  } ${isWrongPick ? 'cct-option-wrong' : ''}`}
                  aria-keyshortcuts={String(idx + 1)}
                >
                  <span className="cct-option-key">{idx + 1}</span>
                  <span className="cct-option-year">{year}</span>
                </Button>
              )
            })}
          </div>

          {feedback && (
            <div className={`cct-feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
              {feedback.correct ? (
                <>
                  <CheckIcon size={20} color="var(--aa-success)" />
                  <span>Boom !</span>
                </>
              ) : (
                <>
                  <CrossIcon size={20} color="var(--aa-error)" />
                  <span>
                    {feedback.year === -1
                      ? `Trop tard ! C'etait ${currentQuestion.item.year_correct}`
                      : `Rate ! C'etait ${currentQuestion.item.year_correct}`}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {onSkip && !feedback && (
        <Button variant="ghost" size="sm" onClick={onSkip} className="cct-skip">
          Passer le mini-jeu
        </Button>
      )}
    </Card>
  )
}
