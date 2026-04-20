/**
 * Panel — bordure 3px, ombre dure, fond au choix (blanc / paper-warm / dark).
 */

import './Panel.css'

interface PanelProps {
  children: React.ReactNode
  variant?: 'white' | 'paper' | 'dark'
  shadow?: 'ink' | 'accent' | 'none'
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside'
}

export function Panel({
  children,
  variant = 'white',
  shadow = 'ink',
  className = '',
  as: Tag = 'div',
}: PanelProps) {
  return (
    <Tag className={`panel panel--${variant} panel--shadow-${shadow} ${className}`}>
      {children}
    </Tag>
  )
}
