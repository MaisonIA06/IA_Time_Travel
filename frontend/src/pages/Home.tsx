/**
 * Page d'accueil - Sélection du mode de jeu et du chapitre
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import { GlitchText, HolographicCard, TimeIcon } from '../components'
import { ChronosSnake } from '../components/EasterEgg/ChronosSnake'
import { GlitchTerminal } from '../components/EasterEgg/GlitchTerminal'
import { getChapters, getQuiz } from '../api/client'
import { useGameStore } from '../store/gameStore'
import type { Chapter, ChapterId } from '../types'
import './Home.css'

export function Home() {
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Easter Egg 1: Chronos Snake
  const [snakeClickCount, setSnakeClickCount] = useState(0)
  const [showSnake, setShowSnake] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const lastSnakeClickTime = useRef<number>(0)

  // Easter Egg 2: Glitch Terminal
  const [terminalClickCount, setTerminalClickCount] = useState(0)
  const [showTerminal, setShowTerminal] = useState(false)
  const lastTerminalClickTime = useRef<number>(0)

  const { setChapter, setQuizItems, startGame, resetGame, setIsLoading: setStoreIsLoading } = useGameStore()

  useEffect(() => {
    resetGame()
    loadChapters()
  }, [resetGame])

  useEffect(() => {
    if (snakeClickCount >= 5) {
      setGlitchActive(true)
      setTimeout(() => {
        setShowSnake(true)
        setGlitchActive(false)
        setSnakeClickCount(0)
      }, 500)
    }
  }, [snakeClickCount])

  useEffect(() => {
    if (terminalClickCount >= 5) {
      setGlitchActive(true)
      setTimeout(() => {
        setShowTerminal(true)
        setGlitchActive(false)
        setTerminalClickCount(0)
      }, 500)
    }
  }, [terminalClickCount])

  const loadChapters = async () => {
    try {
      setIsLoading(true)
      const data = await getChapters()
      setChapters(data)
      if (data.length > 0) {
        setSelectedChapter(data[0].id)
      }
    } catch (err) {
      setError('Impossible de charger les chapitres. Vérifiez la connexion au serveur.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayAdventure = async () => {
    if (!selectedChapter) return
    const chapter = chapters.find(c => c.id === selectedChapter)
    if (chapter) {
      try {
        setStoreIsLoading(true)
        setChapter(selectedChapter, chapter.name)
        
        // Charger le quiz directement
        const response = await getQuiz({
          chapter: selectedChapter,
          count: chapter.event_count
        })
        
        setQuizItems(response.items)
        startGame()
        navigate('/game')
      } catch (err) {
        setError('Erreur lors du lancement de l\'aventure')
      } finally {
        setStoreIsLoading(false)
      }
    }
  }

  const handleLogoClick = () => {
    const now = Date.now()
    if (now - lastSnakeClickTime.current < 300) {
      setSnakeClickCount(prev => prev + 1)
    } else {
      setSnakeClickCount(1)
    }
    lastSnakeClickTime.current = now
  }

  const handleSubtitleClick = () => {
    const now = Date.now()
    if (now - lastTerminalClickTime.current < 300) {
      setTerminalClickCount(prev => prev + 1)
    } else {
      setTerminalClickCount(1)
    }
    lastTerminalClickTime.current = now
  }

  const selectedChapterData = chapters.find(c => c.id === selectedChapter)

  return (
    <div className={`home-page ${glitchActive ? 'glitch-active' : ''}`}>
      {showSnake && <ChronosSnake onClose={() => setShowSnake(false)} />}
      {showTerminal && <GlitchTerminal onClose={() => setShowTerminal(false)} />}
      
      {/* Header */}
      <header className="home-header">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <TimeIcon size={48} color="var(--aa-accent)" />
          </div>
          <GlitchText
            text="IA Time Traveler"
            as="h1"
            className="logo-title"
            intensity="normal"
            glow={true}
          />
        </div>
        <p className="home-subtitle" onClick={handleSubtitleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
          Deviens un agent temporel et reconstruis l'histoire de l'Intelligence Artificielle !
        </p>
      </header>

      {/* Contenu principal */}
      <main className="home-content">
        {isLoading ? (
          <div className="home-loading">
            <div className="loading-spinner" />
            <p>Chargement des chapitres...</p>
          </div>
        ) : error ? (
          <Card variant="bordered" padding="lg" className="home-error">
            <p>{error}</p>
            <Button variant="outline" onClick={loadChapters}>
              Réessayer
            </Button>
          </Card>
        ) : (
          <>
            {/* Sélection du chapitre */}
            <section className="chapter-section">
              <h2 className="section-title">Choisis ton aventure</h2>
              <div className="chapter-grid">
                {chapters.map((chapter, index) => (
                  <HolographicCard
                    key={chapter.id}
                    glowColor={selectedChapter === chapter.id ? 'cyan' : 'purple'}
                    intensity={selectedChapter === chapter.id ? 'high' : 'medium'}
                    className={`chapter-card ${selectedChapter === chapter.id ? 'selected' : ''}`}
                    onClick={() => setSelectedChapter(chapter.id)}
                  >
                    <div className="chapter-number">
                      <span>{index + 1}</span>
                    </div>
                    <h3 className="chapter-name">{chapter.name}</h3>
                    <Badge variant="accent" size="sm">
                      {chapter.event_count} étapes
                    </Badge>
                  </HolographicCard>
                ))}
              </div>
            </section>

            {/* Bouton d'action */}
            <section className="action-section">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlayAdventure}
                disabled={!selectedChapter}
                className="btn-play-adventure"
              >
                Lancer l'Aventure
              </Button>
            </section>

            {/* Info chapitre sélectionné */}
            {selectedChapterData && (
              <section className="info-section">
                <Card variant="bordered" padding="sm">
                  <p className="info-text">
                    <strong>{selectedChapterData.name}</strong> — {selectedChapterData.event_count} événements à découvrir
                  </p>
                </Card>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <p>Un jeu éducatif pour découvrir l'histoire de l'IA</p>
      </footer>
    </div>
  )
}
