/**
 * CourseContreTemps — speed-quiz : 10 QCM années en 60 secondes.
 *
 * Design brutaliste MIA (§ handoff §4d / screen-minigames.jsx TimeRaceGame).
 * Layout : header + timer bar + main 2 cols + footer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlipYear } from '../components/instrument'
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
    if (candidate !== correct) pool.add(candidate)
  }
  return Array.from(pool).sort(() => Math.random() - 0.5)
}

type Phase = 'countdown' | 'playing' | 'finished'

export function CourseContreTemps({ items, onComplete }: CourseContreTempsProps) {
  const questions = useMemo<Question[]>(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
    return shuffled.map((item) => ({ item, options: buildOptions(item) }))
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

  const advance = useCallback(
    (nextScore: number) => {
      setFeedback(null)
      setCurrentIndex((idx) => {
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

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      const now = Date.now()
      startRef.current = now
      questionStartRef.current = now
      setPhase('playing')
      return
    }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 700)
    return () => window.clearTimeout(id)
  }, [phase, countdown])

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

  useEffect(() => {
    if (phase !== 'playing' || feedback) return
    questionStartRef.current = Date.now()
    setQuestionTimeLeft(QUESTION_TIME_MS)
    const id = window.setInterval(() => {
      const elapsed = Date.now() - (questionStartRef.current || Date.now())
      const remaining = Math.max(0, QUESTION_TIME_MS - elapsed)
      setQuestionTimeLeft(remaining)
      if (remaining <= 0) window.clearInterval(id)
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
        setCorrectCount((c) => c + 1)
      }

      feedbackTimeoutRef.current = window.setTimeout(() => advance(nextScore), FEEDBACK_MS)
    },
    [phase, feedback, questions, currentIndex, score, advance]
  )

  useEffect(() => {
    if (phase !== 'playing' || feedback) return
    if (questionTimeLeft > 0) return
    const question = questions[currentIndex]
    if (!question) return
    setFeedback({ correct: false, year: -1 })
    feedbackTimeoutRef.current = window.setTimeout(
      () => advance(scoreRef.current),
      FEEDBACK_MS
    )
  }, [questionTimeLeft, phase, feedback, questions, currentIndex, advance])

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

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current)
      if (completeTimeoutRef.current) window.clearTimeout(completeTimeoutRef.current)
    },
    []
  )

  const currentQuestion = questions[currentIndex]
  const globalSeconds = Math.ceil(globalTimeLeft / 1000)
  const globalMinutes = Math.floor(globalSeconds / 60)
  const globalSecondsOnly = globalSeconds % 60
  const globalPercent = (globalTimeLeft / GLOBAL_TIME_MS) * 100
  const urgent = globalTimeLeft <= 10_000
  const subtitleRaw = currentQuestion?.item.explanation?.split('.')[0]

  if (phase === 'countdown') {
    return (
      <div className="cct cct--countdown">
        <span className="label label--accent">Course contre le Temps</span>
        <p className="cct__intro">10 années, 60 secondes. À fond !</p>
        <div className="cct__countdown-number" key={countdown}>
          {countdown > 0 ? countdown : 'GO !'}
        </div>
        <p className="cct__hint">Touches 1 / 2 / 3 / 4 pour répondre plus vite</p>
      </div>
    )
  }

  if (phase === 'finished') {
    return (
      <div className="cct cct--finished">
        <span className="label label--accent">Temps écoulé</span>
        <h2 className="cct__result-title">
          {correctCount} / {TOTAL_QUESTIONS} bonnes réponses
        </h2>
        <p className="cct__result-score">
          {score} pts{finisherEarned && ` + ${FINISHER_BONUS} pts finisher`}
        </p>
        <p className="cct__result-hint">
          {correctCount >= 8
            ? 'Boom ! Tu maîtrises les dates !'
            : correctCount >= 5
              ? 'Bien joué ! Les dates commencent à rentrer.'
              : 'À retenter pour muscler ta mémoire des dates.'}
        </p>
      </div>
    )
  }

  return (
    <div className="cct">
      <header className="cct__header">
        <div>
          <span className="label label--accent">Course contre le Temps</span>
          <h2 className="cct__title">
            Enchaînez les bonnes dates avant la fin du compte à rebours
          </h2>
        </div>
        <div className="cct__header-stats">
          <span className={`cct__clock ${urgent ? 'is-urgent' : ''}`}>
            {String(globalMinutes).padStart(2, '0')}:
            {String(globalSecondsOnly).padStart(2, '0')}
          </span>
          <span className="cct__score">{score} pts</span>
        </div>
      </header>

      <div className="cct__timer-bar">
        <div
          className={`cct__timer-fill ${urgent ? 'is-urgent' : ''}`}
          style={{ width: `${globalPercent}%` }}
        />
      </div>

      {currentQuestion && (
        <main className="cct__main">
          <section
            className={`cct__event ${
              feedback?.correct === true
                ? 'is-correct'
                : feedback?.correct === false
                  ? 'is-wrong'
                  : ''
            }`}
          >
            <span className="label">Événement #{currentIndex + 1}</span>
            <h3 className="cct__event-title">{currentQuestion.item.prompt}</h3>
            {subtitleRaw && <p className="cct__event-subtitle">« {subtitleRaw}. »</p>}
            <p className="cct__event-short">{currentQuestion.item.description_short}</p>
          </section>

          <section className="cct__options">
            {currentQuestion.options.map((year, idx) => {
              const isCorrectAnswer =
                feedback && year === currentQuestion.item.year_correct
              const isWrongPick =
                feedback && !feedback.correct && feedback.year === year

              const classes = ['cct__option']
              if (isCorrectAnswer) classes.push('cct__option--correct')
              if (isWrongPick) classes.push('cct__option--wrong')
              if (feedback && !isCorrectAnswer && !isWrongPick)
                classes.push('cct__option--muted')

              return (
                <button
                  key={year}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => handleAnswer(year)}
                  disabled={!!feedback}
                  aria-keyshortcuts={String(idx + 1)}
                >
                  <span className="cct__option-label">
                    Option {String.fromCharCode(65 + idx)}
                  </span>
                  <FlipYear value={year} size={36} />
                </button>
              )
            })}
          </section>
        </main>
      )}

      <footer className="cct__footer">
        +{POINTS_PER_CORRECT} pts par bonne réponse · pas de pénalité, enchaînez !
      </footer>
    </div>
  )
}
