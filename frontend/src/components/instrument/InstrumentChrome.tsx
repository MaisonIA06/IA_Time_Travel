/**
 * InstrumentChrome — header + footer persistants façon instrument CHRONOS-06.
 * Ref : design_handoff_mia_retro_futurist §8.
 */

import { useLocation } from 'react-router-dom'
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
        <img
          src="/macaron-mia-bleu.png"
          alt="La Maison de l'IA"
          className="brand-seal"
          draggable={false}
        />
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

/**
 * Ticker défilant dans la barre du bas. Énonce le statut de la machine,
 * cite quelques jalons historiques, et rappelle l'identité MIA. L'utilisateur
 * peut enrichir la liste MESSAGES ci-dessous.
 */
const MESSAGES = [
  "Mission : reconstituer la frise de l'IA",
  'd\'Ada Lovelace (1843) à ChatGPT (2022)',
  "La Maison de l'IA · Sophia-Antipolis · 2026",
]

export function InstrumentBottom() {
  const location = useLocation()
  const sessionDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const crumbLabel =
    location.pathname === '/museum'
      ? 'NAV / ARCHIVES'
      : location.pathname === '/game'
        ? 'NAV / MISSION'
        : location.pathname === '/end'
          ? 'NAV / RAPPORT'
          : 'NAV / ACCUEIL'

  return (
    <footer className="instrument-bottom">
      <span className="crumb-label">{crumbLabel}</span>
      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[...MESSAGES, ...MESSAGES].map((msg, i) => (
            <span key={i} className="ticker__item">
              <span className="ticker__dot">◆</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
      <span className="mia-tag">
        SESSION {sessionDate} · MIA 2026
      </span>
    </footer>
  )
}
