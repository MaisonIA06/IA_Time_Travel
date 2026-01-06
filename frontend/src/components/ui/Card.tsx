/**
 * Composant Card - Style glassmorphism
 */

import { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'glass' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  glowColor?: 'accent' | 'purple' | 'success' | 'error'
}

export function Card({
  children,
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  glowColor,
  className = '',
  ...props
}: CardProps) {
  const classNames = [
    'card',
    `card-${variant}`,
    `card-p-${padding}`,
    hoverable ? 'card-hoverable' : '',
    glowColor ? `card-glow-${glowColor}` : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}

// Sous-composants pour structurer le contenu
export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-body ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-footer ${className}`}>{children}</div>
}

