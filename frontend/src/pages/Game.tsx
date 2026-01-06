/**
 * Page Game - Le jeu principal
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import { EventCard } from '../components/EventCard'
import { FeedbackPanel } from '../components/FeedbackPanel'
import { Timeline, TimelineDropZones } from '../components/Timeline'
import { useGameStore } from '../store/gameStore'
import { OrderGame } from '../games/OrderGame'
import { TrueFalseGame } from '../games/TrueFalseGame'
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
  } | null>(null)

  const {
    phase,
    chapterName,
    quizItems,
    currentIndex,
    score,
    streak,
    answeredEvents,
    miniGamePending,
    miniGameType,
    getCurrentItem,
    getProgress,
    isGameOver,
    answerQuestion,
    nextQuestion,
    nextDiscovery,
    completeMiniGame,
    skipMiniGame,
    finishGame
  } = useGameStore()

  const currentItem = getCurrentItem()
  const progress = getProgress()

  // Vérifier si le jeu est terminé
  useEffect(() => {
    if (phase === 'result') {
      navigate('/end')
    }
  }, [phase, navigate])

  // Répondre à la question (mode QCM par défaut dans le quiz)
  const handleAnswer = useCallback((year: number) => {
    const result = answerQuestion(year)
    setLastResult({ ...result, userAnswer: year })
  }, [answerQuestion])

  // Passer à la question suivante
  const handleNext = useCallback(() => {
    nextQuestion()
    setLastResult(null)
  }, [nextQuestion])

  // Passer à l'événement suivant en découverte
  const handleNextDiscovery = useCallback(() => {
    nextDiscovery()
  }, [nextDiscovery])

  // Terminer un mini-jeu
  const handleMiniGameComplete = useCallback((bonusPoints: number) => {
    completeMiniGame(bonusPoints)
  }, [completeMiniGame])

  // Passer le mini-jeu
  const handleSkipMiniGame = useCallback(() => {
    skipMiniGame()
  }, [skipMiniGame])

  // Rediriger si pas de quiz chargé
  if (quizItems.length === 0) {
    return (
      <div className="game-page">
        <Card variant="glass" padding="lg" className="game-empty">
          <h2>Aucune question chargée</h2>
          <p>Retourne à l'accueil pour démarrer une partie</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="game-page">
      {/* Header avec progression et score */}
      <header className="game-header">
        <div className="game-progress">
          <span className="progress-text">
            Question {progress.current} / {progress.total}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="game-stats">
          <Badge variant="accent" size="lg" glow>
            {score} pts
          </Badge>
          {streak > 1 && (
            <Badge variant="purple" size="lg" glow>
              🔥 x{streak}
            </Badge>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="game-content">
        {/* Phase Découverte */}
        {phase === 'discovery' && currentItem && (
          <DiscoveryMode
            event={currentItem}
            onNext={handleNextDiscovery}
            isLast={currentIndex === quizItems.length - 1}
            progress={progress}
          />
        )}

        {/* Mini-jeu */}
        {phase === 'minigame' && miniGameType && (
          <div className="minigame-container">
            {miniGameType === 'order' ? (
              <OrderGame
                events={quizItems.slice(0, 5)}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            ) : (
              <TrueFalseGame
                events={quizItems}
                onComplete={handleMiniGameComplete}
                onSkip={handleSkipMiniGame}
              />
            )}
          </div>
        )}

        {/* Question */}
        {phase === 'quiz' && currentItem && (
          <div className="question-container">
            {/* Frise chronologique mini */}
            <div className="timeline-mini">
              <Timeline
                answeredEvents={answeredEvents}
                compact
                showLabels={false}
              />
            </div>

            {/* Carte événement */}
            <div className="event-container">
              <p className="question-prompt">Quand cet événement a-t-il eu lieu ?</p>
              <EventCard
                event={currentItem}
                showYear={false}
                showDescription={false}
              />
            </div>

            {/* Options de réponse */}
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

        {/* Feedback */}
        {phase === 'feedback' && currentItem && lastResult && (
          <FeedbackPanel
            isCorrect={lastResult.isCorrect}
            event={currentItem}
            userAnswer={lastResult.userAnswer}
            pointsEarned={lastResult.pointsEarned}
            bonusTime={lastResult.bonusTime}
            streakBonus={lastResult.streakBonus}
            streak={streak}
            onNext={handleNext}
          />
        )}
      </main>

      {/* Info chapitre */}
      <footer className="game-footer">
        <span className="chapter-info">{chapterName}</span>
      </footer>
    </div>
  )
}

