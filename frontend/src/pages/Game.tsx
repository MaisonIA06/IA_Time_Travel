/**
 * Game — écrans Discovery / Quiz / Feedback / Mini-jeux.
 * Implémente les layouts du handoff (§2 Discovery, §3 Quiz fusion quiz+feedback).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { FlipYear, Stamp } from '../components/instrument'
import { useGameStore } from '../store/gameStore'
import { OrderGame } from '../games/OrderGame'
import { TrueFalseGame } from '../games/TrueFalseGame'
import { DuelDates } from '../games/DuelDates'
import { DecennieRush } from '../games/DecennieRush'
import { AvantApres } from '../games/AvantApres'
import { CourseContreTemps } from '../games/CourseContreTemps'
import { DiscoveryMode } from '../components/DiscoveryMode'
import './Game.css'

export function Game() {
  const navigate = useNavigate()
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean
    pointsEarned: number
    bonusTime: number
    streakBonus: number
    userAnswer: number
    correctYear: number
  } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(Date.now())

  const {
    phase,
    quizItems,
    currentIndex,
    score,
    streak,
    correctCount,
    miniGameType,
    chapterName,
    getCurrentItem,
    answerQuestion,
    nextQuestion,
    nextDiscovery,
    prevDiscovery,
    completeMiniGame,
    skipMiniGame,
  } = useGameStore()

  const currentItem = getCurrentItem()

  useEffect(() => {
    if (phase === 'result') navigate('/end')
  }, [phase, navigate])

  // Chrono quiz : reset au changement de question
  useEffect(() => {
    if (phase !== 'quiz') return
    startRef.current = Date.now()
    setElapsed(0)
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 100) / 10),
      100
    )
    return () => clearInterval(t)
  }, [phase, currentIndex])

  const handleAnswer = useCallback((year: number) => {
    if (lastResult) return
    const result = answerQuestion(year)
    setLastResult({ ...result, userAnswer: year })
  }, [answerQuestion, lastResult])

  const handleNext = useCallback(() => {
    nextQuestion()
    setLastResult(null)
  }, [nextQuestion])

  if (quizItems.length === 0) {
    return (
      <div className="game-empty">
        <h2>Aucune mission chargée</h2>
        <p>Retournez à l'accueil pour activer la machine CHRONOS-06.</p>
        <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </div>
    )
  }

  /* ==================== DISCOVERY ==================== */
  if (phase === 'discovery' && currentItem) {
    return (
      <DiscoveryMode
        event={currentItem}
        year={currentItem.year_correct}
        index={currentIndex}
        total={quizItems.length}
        chapterName={chapterName}
        onNext={nextDiscovery}
        onPrev={prevDiscovery}
        isLast={currentIndex === quizItems.length - 1}
      />
    )
  }

  /* ==================== MINI-JEU ==================== */
  if (phase === 'minigame' && miniGameType) {
    return (
      <div className="minigame-container">
        {miniGameType === 'duelDates' && (
          <DuelDates items={quizItems} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
        {miniGameType === 'decennieRush' && (
          <DecennieRush items={quizItems} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
        {miniGameType === 'avantApres' && (
          <AvantApres items={quizItems} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
        {miniGameType === 'courseContreTemps' && (
          <CourseContreTemps items={quizItems} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
        {miniGameType === 'order' && (
          <OrderGame events={quizItems.slice(0, 5)} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
        {miniGameType === 'trueFalse' && (
          <TrueFalseGame events={quizItems} onComplete={completeMiniGame} onSkip={skipMiniGame} />
        )}
      </div>
    )
  }

  /* ==================== QUIZ + FEEDBACK (même écran) ==================== */
  if ((phase === 'quiz' || phase === 'feedback') && currentItem) {
    const picked = lastResult?.userAnswer ?? null
    const correct = lastResult?.isCorrect ?? false
    const correctYear = lastResult?.correctYear ?? currentItem.year_correct
    const showFeedback = lastResult !== null
    const isLast = currentIndex >= quizItems.length - 1

    const options = currentItem.options_years ?? []
    const subtitleRaw = currentItem.explanation?.split('.')[0]

    return (
      <div className="quiz-screen">
        {/* ========== LEFT : événement à dater ========== */}
        <section className="quiz__left">
          <header className="quiz__header">
            <span className="label">
              Question [ {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(quizItems.length).padStart(2, '0')} ]
            </span>
            <span className={`quiz__timer ${showFeedback ? 'is-done' : ''}`}>
              ⏱ {elapsed.toFixed(1)}s
            </span>
          </header>

          <div className="quiz__event">
            <span className="label">Événement à dater</span>
            <h2 className="quiz__title">{currentItem.prompt}</h2>
            {subtitleRaw && (
              <p className="quiz__subtitle">« {subtitleRaw}. »</p>
            )}
          </div>

          <div className="quiz__media">
            {currentItem.image_url ? (
              <img
                src={currentItem.image_url}
                alt={currentItem.prompt}
                className="quiz__image"
                draggable={false}
              />
            ) : (
              <div className="quiz__placeholder">
                <span className="label">[ Archive ]</span>
                <span>{currentItem.prompt}</span>
              </div>
            )}
          </div>

          <p className="quiz__short">{currentItem.description_short}</p>

          <div className="quiz__score-strip">
            <div className="quiz__score-cell">
              <span className="label">Score</span>
              <span className="quiz__score-value">{score}</span>
            </div>
            <div className="quiz__score-cell">
              <span className="label">Série</span>
              <span className="quiz__score-value">×{streak}</span>
            </div>
            <div className="quiz__score-cell">
              <span className="label">Bonnes rép.</span>
              <span className="quiz__score-value">
                {correctCount}/{quizItems.length}
              </span>
            </div>
          </div>
        </section>

        {/* ========== RIGHT : sélection coordonnée ========== */}
        <section className="quiz__right">
          <div>
            <span className="label label--accent">Sélection de la coordonnée temporelle</span>
            <h3 className="quiz__question">En quelle année ?</h3>
          </div>

          <div className="quiz__options">
            {options.map((year, idx) => {
              const isCorrect = year === correctYear
              const isPicked = picked === year
              const disabled = showFeedback

              const classes = ['quiz-option']
              if (showFeedback && isCorrect) classes.push('is-correct')
              else if (showFeedback && isPicked && !isCorrect) classes.push('is-wrong')
              else if (showFeedback) classes.push('is-muted')
              if (isPicked) classes.push('is-picked')

              return (
                <button
                  key={year}
                  className={classes.join(' ')}
                  onClick={() => handleAnswer(year)}
                  disabled={disabled}
                >
                  <span className="quiz-option__label">
                    Option {String.fromCharCode(65 + idx)}
                  </span>
                  <FlipYear value={year} size={44} />
                  {showFeedback && isCorrect && (
                    <div className="quiz-option__stamp">
                      <Stamp color="ink" rotate={-3}>Correct</Stamp>
                    </div>
                  )}
                  {showFeedback && isPicked && !isCorrect && (
                    <div className="quiz-option__stamp">
                      <Stamp color="red" rotate={3}>Erreur</Stamp>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {showFeedback && (
            <div className={`quiz-feedback ${correct ? 'is-correct' : 'is-wrong'} fade-in-up`}>
              <header className="quiz-feedback__header">
                <span className={`label ${correct ? '' : 'label--accent'}`}>
                  {correct
                    ? '✓ Agent, coordonnées vérifiées'
                    : '✗ Coordonnées erronées — correction'}
                </span>
                {correct && lastResult && (
                  <span className="quiz-feedback__pts">
                    +{lastResult.pointsEarned} pts
                  </span>
                )}
              </header>
              <p className="quiz-feedback__title">
                {currentItem.prompt}, c'était en {correctYear}.
              </p>
              {currentItem.explanation && (
                <p className="quiz-feedback__body">{currentItem.explanation}</p>
              )}
            </div>
          )}

          <footer className="quiz__footer">
            {showFeedback ? (
              <Button variant="primary" onClick={handleNext}>
                {isLast ? 'Voir les résultats →' : 'Question suivante →'}
              </Button>
            ) : (
              <span className="label quiz__hint">↓ Choisissez une date</span>
            )}
          </footer>
        </section>
      </div>
    )
  }

  return null
}
