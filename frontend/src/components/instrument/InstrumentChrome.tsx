/**
 * InstrumentChrome — header + footer persistants façon instrument CHRONOS-06.
 * Ref : design_handoff_mia_retro_futurist §8.
 */

import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './InstrumentChrome.css'

interface Readout {
  label: string
  value: string
  tone?: 'ok' | 'alert' | 'neutral'
}

interface InstrumentTopProps {
  readouts?: Readout[]
}

export function InstrumentTop({ readouts }: InstrumentTopProps) {
  const defaults: Readout[] = readouts ?? [
    { label: 'SYS', value: 'OK', tone: 'ok' },
    { label: 'REC', value: '∙∙∙', tone: 'alert' },
    { label: 'PTS', value: '0000', tone: 'neutral' },
  ]
  return (
    <header className="instrument-top">
      <div className="brandmark">
        <span className="brand-seal" aria-hidden="true">M</span>
        <div className="brandmark__text">
          <span className="brandmark__eyebrow">MIA · Mission IA</span>
          <span className="brandmark__title">L'Aventure Temporelle de l'IA</span>
        </div>
      </div>

      <div className="inst-title">
        UNITÉ CHRONOLOGIQUE · MODÈLE <b>CHRONOS-06</b> · ÉDITION 2026
      </div>

      <div className="inst-readouts">
        {defaults.map((r) => (
          <div key={r.label} className={`readout readout--${r.tone ?? 'neutral'}`}>
            <span className="readout__dot" aria-hidden="true" />
            <span className="readout__content">
              <span className="readout__label">{r.label}</span>
              <span className="readout__value">{r.value}</span>
            </span>
          </div>
        ))}
      </div>
    </header>
  )
}

const NAV_ITEMS = [
  { to: '/', label: 'Accueil' },
  { to: '/game', label: 'Partie' },
  { to: '/end', label: 'Résultats' },
  { to: '/museum', label: 'Archives' },
] as const

export function InstrumentBottom() {
  const navigate = useNavigate()
  const location = useLocation()

  const current = useMemo(() => {
    const match = NAV_ITEMS.find((it) => it.to === location.pathname)
    return match?.label ?? 'Session'
  }, [location.pathname])

  return (
    <footer className="instrument-bottom">
      <span className="crumb-label">NAV / {current.toUpperCase()}</span>
      <nav className="screen-crumbs" aria-label="Navigation instrument">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            className={location.pathname === item.to ? 'on' : ''}
            onClick={() => navigate(item.to)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <span className="mia-tag">MIA · 2026</span>
    </footer>
  )
}
