/**
 * Page d'accueil — Sélection du chapitre (identité visuelle MIA).
 * Easter eggs :
 *   - 5 clics rapides sur le logo    → Chronos Snake
 *   - 5 clics rapides sur le sous-titre → Glitch Terminal
 *   - Séquence clavier « MUSEE »     → Musée virtuel (voir useMuseumEgg)
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { ChronosSnake } from '../components/EasterEgg/ChronosSnake'
import { GlitchTerminal } from '../components/EasterEgg/GlitchTerminal'
import { getChapters, getQuiz } from '../api/client'
import { useGameStore } from '../store/gameStore'
import { useMuseumEgg } from '../hooks/useMuseumEgg'
import type { Chapter, ChapterId } from '../types'
import './Home.css'

export function Home() {
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [snakeClickCount, setSnakeClickCount] = useState(0)
  const [showSnake, setShowSnake] = useState(false)
  const [glitchActive, setGlitchActive] = useState(false)
  const lastSnakeClickTime = useRef<number>(0)

  const [terminalClickCount, setTerminalClickCount] = useState(0)
  const [showTerminal, setShowTerminal] = useState(false)
  const lastTerminalClickTime = useRef<number>(0)

  const { overlay: museumOverlay } = useMuseumEgg()

  const {
    setChapter,
    setQuizItems,
    startGame,
    resetGame,
    setIsLoading: setStoreIsLoading,
  } = useGameStore()

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
      const firstPlayable = data.find(c => c.event_count > 0)
      if (firstPlayable) {
        setSelectedChapter(firstPlayable.id)
      }
    } catch {
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

        const response = await getQuiz({
          chapter: selectedChapter,
          count: chapter.event_count,
        })

        setQuizItems(response.items)
        startGame()
        navigate('/game')
      } catch {
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
  const selectedIsEmpty = selectedChapterData?.event_count === 0

  return (
    <div className={`home-page ${glitchActive ? 'glitch-active' : ''}`}>
      {museumOverlay}
      {showSnake && <ChronosSnake onClose={() => setShowSnake(false)} />}
      {showTerminal && <GlitchTerminal onClose={() => setShowTerminal(false)} />}

      <header className="home-hero">
        <button
          type="button"
          className="home-logo"
          onClick={handleLogoClick}
          aria-label="La Maison de l'IA"
        >
          <img
            src="/logo-mia-medaillon.png"
            alt="La Maison de l'IA"
            className="home-logo-img"
            draggable={false}
          />
        </button>

        <h1 className="home-title">IA Time Traveler</h1>
        <p className="home-subtitle" onClick={handleSubtitleClick}>
          Deviens un agent temporel et reconstruis l'histoire de l'Intelligence Artificielle.
        </p>
      </header>

      <main className="home-content">
        {isLoading ? (
          <div className="home-loading">
            <span className="home-spinner" />
            <p>Chargement des chapitres…</p>
          </div>
        ) : error ? (
          <div className="home-error" role="alert">
            <p>{error}</p>
            <Button variant="outline" onClick={loadChapters}>
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            <section className="home-section">
              <h2 className="home-section-title">Choisis ton chapitre</h2>
              <div className="chapter-grid">
                {chapters.map((chapter, index) => {
                  const isSelected = selectedChapter === chapter.id
                  const isEmpty = chapter.event_count === 0
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      className={`chapter-card ${isSelected ? 'is-selected' : ''} ${isEmpty ? 'is-empty' : ''}`}
                      onClick={() => !isEmpty && setSelectedChapter(chapter.id)}
                      aria-pressed={isSelected}
                      aria-disabled={isEmpty}
                      disabled={isEmpty}
                    >
                      <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="chapter-name">{chapter.name}</h3>
                      <span className="chapter-meta">
                        {isEmpty ? 'Bientôt disponible' : `${chapter.event_count} étapes`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="home-action">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlayAdventure}
                disabled={!selectedChapter || selectedIsEmpty}
                className="btn-play-adventure"
              >
                Lancer l'aventure
              </Button>
              {selectedChapterData && !selectedIsEmpty && (
                <p className="home-info">
                  <strong>{selectedChapterData.name}</strong>
                  {' — '}
                  {selectedChapterData.event_count} événements à découvrir.
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="home-footer">
        <p>Un jeu éducatif de La Maison de l'IA pour découvrir l'histoire de l'Intelligence Artificielle.</p>
      </footer>
    </div>
  )
}
