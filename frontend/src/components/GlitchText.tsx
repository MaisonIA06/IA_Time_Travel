/**
 * GlitchText - Texte avec effet glitch cyberpunk
 *
 * Crée un effet de distorsion visuelle sur le texte,
 * parfait pour un thème futuriste/cyberpunk.
 */

import './GlitchText.css'

interface GlitchTextProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p'
  className?: string
  intensity?: 'subtle' | 'normal' | 'intense'
  glow?: boolean
}

export function GlitchText({
  text,
  as: Tag = 'h1',
  className = '',
  intensity = 'normal',
  glow = true
}: GlitchTextProps) {
  return (
    <Tag
      className={`glitch-text glitch-text--${intensity} ${glow ? 'glitch-text--glow' : ''} ${className}`}
      data-text={text}
    >
      {text}
      <span className="glitch-text__layer glitch-text__layer--1" aria-hidden="true">{text}</span>
      <span className="glitch-text__layer glitch-text__layer--2" aria-hidden="true">{text}</span>
    </Tag>
  )
}

