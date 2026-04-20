/**
 * Museum — Musée virtuel de l'histoire de l'IA.
 *
 * Page accessible uniquement via l'easter egg (useMuseumEgg). Elle présente
 * les 14 fiches pédagogiques via un layout deux colonnes : liste à gauche,
 * fiche détaillée à droite. Un toggle « Mode médiateur » (coin haut-droit)
 * révèle les conseils pour l'animateur. Navigation clavier : flèches haut/bas
 * entre les fiches. Le bouton « Imprimer cette fiche » déclenche window.print()
 * avec un layout A4 propre (voir MuseumSheet.css @media print).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MuseumSheet } from '../components/MuseumSheet'
import { getMuseumSheets } from '../api/client'
import type { MuseumSheet as MuseumSheetType } from '../types'
import { MUSEUM_SEED } from './museumSeed'
import './Museum.css'

type LoadState = 'loading' | 'ready' | 'error'

export function Museum() {
  const navigate = useNavigate()
  const [sheets, setSheets] = useState<MuseumSheetType[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [mediatorMode, setMediatorMode] = useState(false)

  // Fiches triées par année (ordre chronologique pour la barre latérale)
  const orderedSheets = useMemo(
    () => [...sheets].sort((a, b) => a.event_year - b.event_year),
    [sheets]
  )

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getMuseumSheets()
        if (cancelled) return
        if (Array.isArray(data) && data.length > 0) {
          setSheets(data)
          setLoadState('ready')
          return
        }
        throw new Error('empty')
      } catch {
        // Fallback : dataset local de secours tant que le backend n'expose
        // pas encore /api/v1/museum-sheets/.
        if (cancelled) return
        setSheets(MUSEUM_SEED)
        setLoadState('ready')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedEvent === null && orderedSheets.length > 0) {
      setSelectedEvent(orderedSheets[0].event)
    }
  }, [orderedSheets, selectedEvent])

  const selectedIndex = orderedSheets.findIndex((s) => s.event === selectedEvent)
  const selectedSheet = selectedIndex >= 0 ? orderedSheets[selectedIndex] : null

  const goToIndex = useCallback(
    (index: number) => {
      if (orderedSheets.length === 0) return
      const clamped = Math.max(0, Math.min(index, orderedSheets.length - 1))
      setSelectedEvent(orderedSheets[clamped].event)
    },
    [orderedSheets]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToIndex(selectedIndex + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToIndex(selectedIndex - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goToIndex, selectedIndex])

  return (
    <div className="museum-page">
      <header className="museum-page__topbar no-print">
        <div className="museum-page__brand">
          <button
            type="button"
            className="museum-page__exit"
            onClick={() => navigate('/')}
            aria-label="Quitter le musée et revenir à l'accueil"
          >
            ← Sortir du musée
          </button>
          <div className="museum-page__titles">
            <h1 className="museum-page__title">Bienvenue au musée de l'IA</h1>
            <p className="museum-page__subtitle">Entre, c'est gratuit — et les fiches sont à emporter.</p>
          </div>
        </div>
        <label className="museum-page__toggle">
          <input
            type="checkbox"
            checked={mediatorMode}
            onChange={(e) => setMediatorMode(e.target.checked)}
            aria-label="Activer le mode médiateur"
          />
          <span className="museum-page__toggle-track" aria-hidden="true">
            <span className="museum-page__toggle-thumb" />
          </span>
          <span className="museum-page__toggle-label">Mode médiateur</span>
        </label>
      </header>

      <div className="museum-page__layout">
        <aside className="museum-page__sidebar no-print" aria-label="Liste des fiches du musée">
          <div className="museum-page__sidebar-header">
            <span className="museum-page__sidebar-count">
              {orderedSheets.length} fiches
            </span>
            <span className="museum-page__sidebar-hint">↑ ↓ pour naviguer</span>
          </div>
          <nav className="museum-page__sheet-list" aria-label="Fiches disponibles">
            {loadState === 'loading' && (
              <p className="museum-page__loading">Ouverture des salles…</p>
            )}
            {loadState === 'error' && (
              <p className="museum-page__error">Impossible de charger le musée.</p>
            )}
            {orderedSheets.map((sheet, idx) => {
              const isActive = sheet.event === selectedEvent
              return (
                <button
                  key={sheet.event}
                  type="button"
                  className={`museum-page__sheet-item${isActive ? ' is-active' : ''}`}
                  onClick={() => setSelectedEvent(sheet.event)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="museum-page__sheet-index">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="museum-page__sheet-body">
                    <span className="museum-page__sheet-year">{sheet.event_year}</span>
                    <span className="museum-page__sheet-title">{sheet.event_title}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="museum-page__main" aria-live="polite">
          {selectedSheet ? (
            <MuseumSheet sheet={selectedSheet} mediatorMode={mediatorMode} />
          ) : loadState === 'loading' ? (
            <p className="museum-page__loading">Le gardien prépare la salle…</p>
          ) : (
            <p className="museum-page__error">Aucune fiche à afficher.</p>
          )}
        </main>
      </div>
    </div>
  )
}
