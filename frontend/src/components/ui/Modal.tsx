/**
 * Composant Modal - Pour les popups et drawers
 */

import { useEffect, ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md'
}: ModalProps) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="modal-header">
          {title && <h3 id="modal-title" className="modal-title">{title}</h3>}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

// Drawer (panneau latéral)
interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  position?: 'right' | 'left' | 'bottom'
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right'
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className={`drawer drawer-${position} ${isOpen ? 'drawer-open' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          {title && <h3 className="drawer-title">{title}</h3>}
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  )
}

