/**
 * Page Game — le jeu principal (identité visuelle MIA).
 * Déclenche les mini-jeux centrés dates après la 3e, 6e, 9e question,
 * et le speed-quiz « Course contre le temps » en fin de partie.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { EventCard } from '../components/EventCard'
import { FeedbackPanel } from '../components/FeedbackPanel'
import { Timeline } from '../components/Timeline'
import { useGameStore } from '../store/gameStore'
import { OrderGame } from '../games/OrderGame'
import { TrueFalseGame } from '../games/TrueFalseGame'
import { DuelDates } from '../games/DuelDates'
import { DecennieRush } from '../games/DecennieRush'
import { AvantApres } from '../games/AvantApres'
import { CourseContreTemps } from '../games/CourseContreTemps'
import { DiscoveryMode } from '../components/DiscoveryMode'
import { HomeIcon } from '../components/icons'
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

  const {
    phase,
    chapterName,
    quizItems,
    currentIndex,
    score,
    streak,
    answeredEvents,
    miniGameType,
    getCurrentItem,
    getProgress,
    answerQuestion,
    nextQuestion,
    nextDiscovery,
    completeMiniGame,
    skipMiniGame,
    resetGame,
  } = useGameStore()

  const currentItem = getCurrentItem()
  const progress = getProgress()

  const handleGoHome = () => {
    if (window.confirm('Voulez-vous vraiment quitter la partie en cours ?')) {
      resetGame()
      navigate('/')
    }
  }

  useEffect(() => {
    if (phase === 'result') {
      navigate('/end')
    }
  }, [phase, navigate])

  const handleAnswer = useCallback((year: number) => {
    const result = answerQuestion(year)
    setLastResult({ ...result, userAnswer: year })
  }, [answerQuestion])

  const handleNext = useCallback(() => {
    nextQuestion()
    setLastResult(null)
  }, [nextQuestion])

  const handleNextDiscovery = useCallback(() => {
    nextDiscovery()
  }, [nextDiscovery])

  const handleMiniGameComplete = useCallback((bonusPoints: number) => {
    completeMiniGame(bonusPoints)
  }, [completeMiniGame])

  const handleSkipMiniGame = useCallback(() => {
    skipMiniGame()
  }, [skipMiniGame])

  if (quizItems.length === 0) {
    return (
      <div className="game-page">
        <div className="game-empty">
          <h2>Aucune question chargée</h2>
          <p>Retourne à l'accueil pour démarrer une partie.</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-header-left">
          <button
            type="button"
            className="game-home-btn"
            onClick={handleGoHome}
            title="Retour à l'accueil"
            aria-label="Retour à l'accueil"
          >
            <HomeIcon size={22} />
          </button>
          <img
            src="/logo-mia-medaillon.png"
            alt="La Maison de l'IA"
            className="game-logo-mini"
            draggable={false}
          />
          <div className="game-progress">
            <span className="game-progress-label">
              {phase === 'discovery' ? 'Étape' : 'Défi'} {progress.current} / {progress.total}
            </span>
            <div className="game-progress-bar">
              <div
                className="game-progress-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="game-stats">
          <div className="game-stat game-stat--score">
            <span className="game-stat-value">{score}</span>
            <span className="game-stat-label">pts</span>
          </div>
          {streak > 1 && (
            <div className="game-stat game-stat--streak" aria-label={`Série de ${streak}`}>
              <span className="game-stat-flame" aria-hidden="true">★</span>
              <span className="game-stat-value">x{streak}</span>
            </div>
          )}
        </div>
      </header>

      <main className="game-content">
        {phase === 'discovery' && currentItem && (
          <DiscoveryMode
            event={currentItem}
            year={currentItem.year_correct}
            onNext={handleNextDiscovery}
            isLast={currentIndex === quizItems.length - 1}
          />
        )}

        {phase === 'minigame' && miniGameType && (
          <div className="minigame-container">
            {miniGameType === 'duelDates' && (
              <DuelDates
                items={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
            {miniGameType === 'decennieRush' && (
              <DecennieRush
                items={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
            {miniGameType === 'avantApres' && (
              <AvantApres
                items={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
            {miniGameType === 'courseContreTemps' && (
              <CourseContreTemps
                items={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
            {miniGameType === 'order' && (
              <OrderGame
                events={quizItems.slice(0, 5)}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
            {miniGameType === 'trueFalse' && (
              <TrueFalseGame
                events={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
          </div>
        )}

        {phase === 'quiz' && currentItem && (
          <div className="question-container">
            <div className="timeline-mini">
              <Timeline
                answeredEvents={answeredEvents}
                compact
                showLabels={false}
              />
            </div>

            <div className="event-container">
              <p className="question-prompt">Quand cet événement a-t-il eu lieu ?</p>
              <EventCard
                event={currentItem}
                showYear={false}
                showDescription={false}
              />
            </div>

            {currentItem.options_years && (
              <div className="answer-options">
                {currentItem.options_years.map((year) => (
                  <Button
                    key={year}
                    variant="secondary"
                    size="lg"
                    onClick={() => handleAnswer(year)}
                    className="answer-button"
                  >
                    {year}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === 'feedback' && currentItem && lastResult && (
          <FeedbackPanel
            isCorrect={lastResult.isCorrect}
            event={currentItem}
            userAnswer={lastResult.userAnswer}
            correctYear={lastResult.correctYear}
            pointsEarned={lastResult.pointsEarned}
            bonusTime={lastResult.bonusTime}
            streakBonus={lastResult.streakBonus}
            streak={streak}
            onNext={handleNext}
          />
        )}
      </main>

      <footer className="game-footer">
        <span className="chapter-info">{chapterName}</span>
      </footer>
    </div>
  )
}
