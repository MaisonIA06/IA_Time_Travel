/**
 * MuseumSheet — une fiche muséale unique.
 *
 * Utilisée par la page /museum. Rend le contenu complet d'une fiche :
 * contexte long, personnages clés, anecdote, pour l'animateur, pour aller
 * plus loin. Un bouton « Imprimer cette fiche » déclenche window.print().
 * Le bloc « Pour l'animateur » n'est visible que si `mediatorMode` vaut
 * true — basculé par la page Museum via le toggle « Mode médiateur ».
 */

import type { MuseumSheet as MuseumSheetType } from '../types'
import './MuseumSheet.css'

interface MuseumSheetProps {
  sheet: MuseumSheetType
  mediatorMode: boolean
}

export function MuseumSheet({ sheet, mediatorMode }: MuseumSheetProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <article className="museum-sheet" aria-labelledby={`sheet-title-${sheet.event}`}>
      <header className="museum-sheet__header">
        <div className="museum-sheet__year" aria-label={`Année ${sheet.event_year}`}>
          {sheet.event_year}
        </div>
        <h1 id={`sheet-title-${sheet.event}`} className="museum-sheet__title">
          {sheet.event_title}
        </h1>
        <button
          type="button"
          className="museum-sheet__print-btn no-print"
          onClick={handlePrint}
          aria-label="Imprimer cette fiche au format A4"
        >
          Imprimer cette fiche
        </button>
      </header>

      <section className="museum-sheet__section museum-sheet__context">
        <h2 className="museum-sheet__section-title">Contexte</h2>
        <p>{sheet.context_long}</p>
      </section>

      {sheet.key_figures.length > 0 && (
        <section className="museum-sheet__section">
          <h2 className="museum-sheet__section-title">Personnages clés</h2>
          <div className="museum-sheet__figures">
            {sheet.key_figures.map((figure) => (
              <div key={figure.name} className="museum-sheet__figure-card">
                <h3 className="museum-sheet__figure-name">{figure.name}</h3>
                <p className="museum-sheet__figure-role">{figure.role}</p>
                <p className="museum-sheet__figure-bio">{figure.mini_bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sheet.anecdote && (
        <section className="museum-sheet__section museum-sheet__anecdote-wrap">
          <h2 className="museum-sheet__section-title">Anecdote</h2>
          <blockquote className="museum-sheet__anecdote">
            <p>« {sheet.anecdote} »</p>
          </blockquote>
        </section>
      )}

      {mediatorMode && sheet.educator_tips.length > 0 && (
        <section
          className="museum-sheet__section museum-sheet__educator"
          aria-label="Conseils pour l'animateur"
        >
          <h2 className="museum-sheet__section-title">
            Pour l'animateur
            <span className="museum-sheet__educator-badge">Mode médiateur</span>
          </h2>
          <ul className="museum-sheet__tips">
            {sheet.educator_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {sheet.resources.length > 0 && (
        <section className="museum-sheet__section">
          <h2 className="museum-sheet__section-title">Pour aller plus loin</h2>
          <ul className="museum-sheet__resources">
            {sheet.resources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="museum-sheet__resource-link"
                >
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
