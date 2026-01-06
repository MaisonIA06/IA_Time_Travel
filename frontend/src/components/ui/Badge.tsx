/**
 * Composant Badge - Pour tags et labels
 */

import { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'accent' | 'purple' | 'success' | 'error' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className = '',
  ...props
}: BadgeProps) {
  const classNames = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    glow ? 'badge-glow' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classNames} {...props}>
      {children}
    </span>
  )
}

