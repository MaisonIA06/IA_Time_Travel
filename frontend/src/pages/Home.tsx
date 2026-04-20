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
import { Stamp, FlipYear, Dial } from '../components/instrument'
import { ChronosSnake } from '../components/EasterEgg/ChronosSnake'
import { GlitchTerminal } from '../components/EasterEgg/GlitchTerminal'
import { getChapters, getQuiz } from '../api/client'
import { useGameStore } from '../store/gameStore'
import { useMuseumEgg } from '../hooks/useMuseumEgg'
import type { Chapter, ChapterId } from '../types'
import './Home.css'

const MISSION_DATES = [1843, 1943, 1950, 1956, 1966, 1972, 1980, 1997, 2009, 2011, 2016, 2018, 2022, 2024]
const MISSION_TONES: Array<'terra' | 'green' | 'blue'> = [
  'terra', 'blue', 'green', 'terra', 'green', 'blue', 'terra', 'green', 'blue', 'terra', 'green', 'blue', 'terra', 'green',
]
const JOURNAL = [
  'Condensateurs en charge…',
  'Coordonnées verrouillées',
  'Prêt pour le saut temporel',
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
  const [power, setPower] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPower(p => Math.min(1, p + 0.012)), 80)
    return () => clearInterval(t)
  }, [])
  const ledsOn = Math.round(power * 5)

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
        {/* Bandeau CHRONOS-06 */}
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
                className={`home-instrument__led ${i < ledsOn ? 'home-instrument__led--on' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Écran radar — cadran circulaire avec aiguille qui tourne */}
        <div className="home-radar">
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              className="home-radar__ring"
              style={{
                width: `${(i + 1) * 26}%`,
                height: `${(i + 1) * 26}%`,
              }}
              aria-hidden
            />
          ))}
          <span className="home-radar__needle" aria-hidden />

          {MISSION_DATES.map((year, i) => {
            const a = (i / MISSION_DATES.length) * Math.PI * 2 - Math.PI / 2
            const r = 44 // pourcent
            const x = 50 + Math.cos(a) * r
            const y = 50 + Math.sin(a) * r
            const tone = MISSION_TONES[i % MISSION_TONES.length]
            return (
              <span
                key={year}
                className={`home-radar__point home-radar__point--${tone}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  ['--pulse-delay' as string]: `${i * 0.2}s`,
                }}
              >
                <span className="home-radar__point-year">{year}</span>
              </span>
            )
          })}

          <div className="home-radar__center">
            <span className="home-radar__label">Destination</span>
            <FlipYear value={1843} size={52} />
            <span className="home-radar__destination">↔ 2 0 2 4</span>
          </div>
        </div>

        {/* Cadrans + journal */}
        <div className="home-instrument__bottom">
          <Dial value={power} label="Énergie" color="var(--mai-red-lovelace)" size={86} />
          <Dial value={0.66} label="Flux" color="var(--mai-blue-deep)" size={86} />
          <Dial value={0.84} label="Stabilité" color="var(--mai-ink)" size={86} />
          <div className="home-journal">
            <span className="label">Journal de bord</span>
            <div className="home-journal__body">
              {JOURNAL.map((line, i) => (
                <span key={i} className="home-journal__entry">{line}</span>
              ))}
            </div>
          </div>
        </div>

        {/* État (loading / error) en overlay */}
        {isLoading && (
          <div className="home-loading home-loading--overlay">
            <span className="home-spinner" />
            <p>Chargement des époques…</p>
          </div>
        )}
        {error && (
          <div className="home-error" role="alert">
            <p>{error}</p>
            <Button variant="ghost" onClick={loadChapters}>Réessayer</Button>
          </div>
        )}

        {/* Auto-selection : le seul chapitre est déjà sélectionné (voir loadChapters).
            Si l'utilisateur est arrivé sans sélection (erreur), on affiche un CTA discret. */}
        {!isLoading && !error && (!selectedChapter || selectedIsEmpty) && (
          <p className="label home-instrument__empty">
            Aucune mission active — contacte la centrale MIA.
          </p>
        )}

        <p className="home-instrument__caption">
          Mission : {totalEvents} époques · d'Ada Lovelace à ChatGPT
        </p>
      </section>
    </div>
  )
}
