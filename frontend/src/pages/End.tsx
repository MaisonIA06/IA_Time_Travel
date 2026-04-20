/**
 * Page End — récapitulatif de fin de partie (refonte visuelle MIA)
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Timeline } from '../components/Timeline'
import { EventCardMini } from '../components/EventCard'
import { RefreshIcon, HomeIcon } from '../components/icons'
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

  const getMessage = () => {
    if (accuracy >= 90) return { level: 'legendary', text: 'Extraordinaire !' }
    if (accuracy >= 70) return { level: 'excellent', text: 'Excellent travail !' }
    if (accuracy >= 50) return { level: 'good', text: 'Bien joué !' }
    return { level: 'encourage', text: 'Continue comme ça !' }
  }

  const message = getMessage()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <div className="end-page">
      <header className="end-header">
        <button
          type="button"
          className="end-home-btn"
          onClick={handleGoHome}
          title="Retour à l'accueil"
          aria-label="Retour à l'accueil"
        >
          <HomeIcon size={22} />
        </button>

        <img
          src="/logo-mia-medaillon.png"
          alt="La Maison de l'IA"
          className="end-logo"
          draggable={false}
        />

        <h1 className={`end-title end-title--${message.level}`}>{message.text}</h1>
        <p className="end-subtitle">Mission accomplie, Agent Temporel.</p>
        {chapterName && (
          <p className="end-chapter">Chapitre&nbsp;: <strong>{chapterName}</strong></p>
        )}
      </header>

      <main className="end-content">
        {/* Score principal */}
        <section className="score-card">
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
              <span className="stat-value">{formatTime(totalDuration)}</span>
              <span className="stat-label">Temps</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">x{streakMax}</span>
              <span className="stat-label">Meilleure série</span>
            </div>
          </div>
        </section>

        {/* Frise chronologique */}
        <section className="timeline-card">
          <h2 className="section-title">Ta frise chronologique</h2>
          <Timeline answeredEvents={answeredEvents} showLabels />
        </section>

        {/* Liste des événements */}
        <section className="events-card">
          <h2 className="section-title">Événements rencontrés</h2>
          <div className="events-list">
            {answeredEvents
              .slice()
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
        </section>

        {/* Actions */}
        <div className="end-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayAgain}
            leftIcon={<RefreshIcon size={18} />}
          >
            Rejouer
          </Button>

          <Button
            variant="ghost"
            onClick={handleGoHome}
          >
            Retour à l'accueil
          </Button>
        </div>
      </main>
    </div>
  )
}
