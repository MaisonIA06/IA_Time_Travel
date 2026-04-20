/**
 * Overlays — papier millimétré, grain, scanlines CRT. Tous désactivables.
 */

import './Overlays.css'

interface OverlaysProps {
  paper?: boolean
  grain?: boolean
  crt?: boolean
}

export function Overlays({ paper = true, grain = true, crt = true }: OverlaysProps) {
  return (
    <>
      {paper && <div className="paper-bg" aria-hidden="true" />}
      {grain && <div className="grain" aria-hidden="true" />}
      {crt && <div className="crt" aria-hidden="true" />}
    </>
  )
}
