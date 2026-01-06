/**
 * Page End - Récapitulatif de fin de partie
 */

import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { Timeline } from '../components/Timeline'
import { EventCardMini } from '../components/EventCard'
import { RefreshIcon, CheckIcon, HomeIcon } from '../components/icons'
import { useGameStore } from '../store/gameStore'
import './End.css'

export function End() {
  const navigate = useNavigate()

  const {
    chapterName,
    score,
    correctCount,
    streakMax,
    answeredEvents,
    totalDuration,
    quizItems,
    resetGame
  } = useGameStore()

  const totalQuestions = quizItems.length
  const accuracy = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0

  const handlePlayAgain = () => {
    resetGame()
    navigate('/')
  }

  const handleGoHome = () => {
    resetGame()
    navigate('/')
  }

  // Message de félicitations basé sur la performance
  const getMessage = () => {
    if (accuracy >= 90) return { level: 'legendary', text: 'Extraordinaire !' }
    if (accuracy >= 70) return { level: 'excellent', text: 'Excellent travail !' }
    if (accuracy >= 50) return { level: 'good', text: 'Bien joué !' }
    return { level: 'encourage', text: 'Continue comme ça !' }
  }

  const message = getMessage()

  return (
    <div className="end-page">
      <header className="end-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoHome}
          className="btn-home-end"
          title="Retour à l'accueil"
        >
          <HomeIcon size={24} />
        </Button>
        <div className={`end-badge end-badge--${message.level}`}>
          <CheckIcon size={48} color="currentColor" />
        </div>
        <h1 className="end-title">{message.text}</h1>
        <p className="end-subtitle">
          Mission accomplie, Agent Temporel !
        </p>
      </header>

      <main className="end-content">
        {/* Score principal */}
        <Card variant="glass" padding="lg" className="score-card">
          <div className="score-main">
            <span className="score-value">{score}</span>
            <span className="score-label">points</span>
          </div>

          <div className="score-details">
            <div className="score-stat">
              <span className="stat-value">{correctCount}/{totalQuestions}</span>
              <span className="stat-label">Bonnes réponses</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">{accuracy}%</span>
              <span className="stat-label">Précision</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">{Math.floor(totalDuration / 60)}:{String(totalDuration % 60).padStart(2, '0')}</span>
              <span className="stat-label">Temps</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">x{streakMax}</span>
            <span className="stat-label">Meilleure série</span>
          </div>
        </div>
      </Card>

        {/* Frise chronologique complète */}
        <Card variant="bordered" padding="md" className="timeline-card">
          <h2 className="section-title">Ta frise chronologique</h2>
          <Timeline answeredEvents={answeredEvents} showLabels />
        </Card>

        {/* Liste des événements */}
        <Card variant="bordered" padding="md" className="events-card">
          <h2 className="section-title">Événements rencontrés</h2>
          <div className="events-list">
            {answeredEvents
              .sort((a, b) => a.event.year_correct - b.event.year_correct)
              .map((ae, idx) => (
                <EventCardMini
                  key={idx}
                  event={ae.event}
                  isCorrect={ae.isCorrect}
                />
              ))
            }
          </div>
        </Card>

        {/* Actions */}
        <div className="end-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayAgain}
          >
            <span className="btn-icon">
              <RefreshIcon size={20} />
            </span>
            Rejouer
          </Button>

          <Button
            variant="ghost"
            onClick={handlePlayAgain}
          >
            Retour à l'accueil
          </Button>
        </div>
      </main>
    </div>
  )
}

