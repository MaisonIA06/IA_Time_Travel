/**
 * Home — écran d'accueil CHRONOS-06.
 * Easter eggs :
 *   - 5 clics rapides sur le logo (coin haut-droite) → Chronos Snake
 *   - 5 clics rapides sur l'eyebrow « Mission IA présente » → Glitch Terminal
 *   - Séquence clavier « MUSEE » → Musée virtuel (useMuseumEgg)
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Stamp, FlipYear } from '../components/instrument'
import { ChronosSnake } from '../components/EasterEgg/ChronosSnake'
import { GlitchTerminal } from '../components/EasterEgg/GlitchTerminal'
import { getChapters, getQuiz } from '../api/client'
import { useGameStore } from '../store/gameStore'
import { useMuseumEgg } from '../hooks/useMuseumEgg'
import type { Chapter, ChapterId } from '../types'
import './Home.css'

const MISSION_DATES = [1843, 1936, 1950, 1966, 1997, 2011, 2016, 2022]
const JOURNAL = [
  'Condensateurs en charge…',
  'Alignement chronomètre : 0.00',
  'Prêt à l\'activation. En attente de l\'agent.',
]

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
      if (firstPlayable) setSelectedChapter(firstPlayable.id)
    } catch {
      setError('Impossible de contacter la Centrale Chronologique.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayAdventure = async () => {
    if (!selectedChapter) return
    const chapter = chapters.find(c => c.id === selectedChapter)
    if (!chapter) return
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
      setError('Erreur lors du lancement de la mission.')
    } finally {
      setStoreIsLoading(false)
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

  const handleEyebrowClick = () => {
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
  const totalEvents = chapters.reduce((sum, c) => sum + c.event_count, 0)

  return (
    <div className={`home-page ${glitchActive ? 'glitch-active' : ''}`}>
      {museumOverlay}
      {showSnake && <ChronosSnake onClose={() => setShowSnake(false)} />}
      {showTerminal && <GlitchTerminal onClose={() => setShowTerminal(false)} />}

      <button
        type="button"
        className="home-logo"
        onClick={handleLogoClick}
        aria-label="Activer l'easter egg"
      />

      {/* ==================== COLONNE GAUCHE (papier) ==================== */}
      <section className="home-paper">
        <div className="home-paper__dossier">
          <Stamp color="red" rotate={-3}>MIA — Édition 2026</Stamp>
          <span className="home-paper__dossier-label">
            Dossier<br />N°IA-001
          </span>
        </div>

        <span
          className="home-paper__eyebrow"
          onClick={handleEyebrowClick}
          role="button"
          tabIndex={0}
        >
          Mission Intelligence Artificielle présente
        </span>

        <h1 className="home-title">
          <span className="home-title__line">L'Aventure</span>
          <span className="home-title__line">
            <span className="home-title__block">Temporelle</span>
          </span>
          <span className="home-title__line">
            de l'<span className="home-title__ia">I.A.</span>
          </span>
        </h1>

        <p className="home-paper__intro">
          Une expédition chronologique à travers près de 180 ans d'Intelligence Artificielle,
          conçue pour les agents temporels de 11 à 15 ans et leurs médiateurs.
        </p>

        <div className="home-paper__cta">
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayAdventure}
            disabled={!selectedChapter || selectedIsEmpty}
          >
            ▶ Activer la machine
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/museum')}>
            Consulter les archives
          </Button>
        </div>

        <div className="home-paper__stats">
          <div className="home-paper__stat">
            <strong>{String(totalEvents).padStart(2, '0')}</strong>
            <span>Époques</span>
          </div>
          <div className="home-paper__stat">
            <strong>04</strong>
            <span>Mini-jeux</span>
          </div>
          <div className="home-paper__stat">
            <strong>20'</strong>
            <span>Durée</span>
          </div>
          <div className="home-paper__stat">
            <strong>11-15</strong>
            <span>Âges</span>
          </div>
        </div>
      </section>

      {/* ==================== COLONNE DROITE (instrument) ==================== */}
      <section className="home-instrument">
        <div className="home-instrument__bandeau">
          <div>
            <div className="home-instrument__bandeau-label">
              Unité Chronologique / Modèle MIA-VIII
            </div>
            <div className="home-instrument__bandeau-title">CHRONOS-06</div>
          </div>
          <div className="home-instrument__led-jauge">
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className={`home-instrument__led ${i < 4 ? 'home-instrument__led--on' : ''}`}
              />
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="home-loading">
            <span className="home-spinner" />
            <p>Chargement des époques…</p>
          </div>
        ) : error ? (
          <div className="home-error" role="alert">
            <p>{error}</p>
            <Button variant="ghost" onClick={loadChapters}>Réessayer</Button>
          </div>
        ) : (
          <div className="home-chapters">
            <div className="home-chapters__title">
              Sélection de mission — 4 chapitres disponibles
            </div>
            {chapters.map((chapter, index) => {
              const isSelected = selectedChapter === chapter.id
              const isEmpty = chapter.event_count === 0
              const num = String(index + 1).padStart(2, '0')
              return (
                <button
                  key={chapter.id}
                  type="button"
                  className={`chapter-card ${isSelected ? 'is-selected' : ''} ${isEmpty ? 'is-empty' : ''}`}
                  onClick={() => !isEmpty && setSelectedChapter(chapter.id)}
                  aria-pressed={isSelected}
                  disabled={isEmpty}
                >
                  <span className="chapter-number">Ch. {num}</span>
                  <h3 className="chapter-name">{chapter.name}</h3>
                  <span className="chapter-meta">
                    {isEmpty ? 'Bientôt disponible' : `${chapter.event_count} époques`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="home-journal">
          {JOURNAL.map((line, i) => (
            <span key={i} className="home-journal__entry">{line}</span>
          ))}
        </div>

        {/* Radar discret en overlay (décoratif, masqué sur petits écrans) */}
        <div style={{ display: 'none' }}>
          {MISSION_DATES.map((year, i) => {
            const angle = (i / MISSION_DATES.length) * 360
            const radius = 42
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180)
            return (
              <div
                key={year}
                className="home-radar__point"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span className="home-radar__point-dot" />
                <span className="home-radar__point-year">{year}</span>
              </div>
            )
          })}
          <FlipYear value={1843} size={44} />
        </div>
      </section>
    </div>
  )
}
