/**
 * Corners — 4 équerres aux coins du viewport pour signer "instrument".
 * Pointer-events: none.
 */

import './Corners.css'

export function Corners() {
  return (
    <>
      <span className="corner corner--tl" aria-hidden="true" />
      <span className="corner corner--tr" aria-hidden="true" />
      <span className="corner corner--bl" aria-hidden="true" />
      <span className="corner corner--br" aria-hidden="true" />
    </>
  )
}
