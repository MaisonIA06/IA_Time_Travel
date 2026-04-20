/**
 * MuseumEggOverlay — modale éphémère annonçant l'accès au musée virtuel.
 *
 * Affichée pendant ~1,2 s par useMuseumEgg, juste avant la navigation
 * vers /museum. Objectif ludique : signaler clairement qu'on bascule
 * sur un contenu « caché » découvert par l'easter egg.
 */

import './MuseumEggOverlay.css'

export function MuseumEggOverlay() {
  return (
    <div className="museum-egg-overlay" role="dialog" aria-live="assertive">
      <div className="museum-egg-overlay__card">
        <p className="museum-egg-overlay__emoji" aria-hidden="true">
          🚪
        </p>
        <p className="museum-egg-overlay__text">
          Une porte secrète s'entrouvre vers le musée…
        </p>
      </div>
    </div>
  )
}
