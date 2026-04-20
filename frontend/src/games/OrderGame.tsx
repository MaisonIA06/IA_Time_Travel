/**
 * Mini-jeu OrderGame - Remettre 5 événements dans l'ordre chronologique
 */

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Card, Badge } from '../components/ui'
import { ValidateIcon, CheckIcon, CrossIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './OrderGame.css'

interface OrderGameProps {
  events: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip: () => void
}

interface SortableItemProps {
  id: string
  event: QuizItem
  index: number
}

function SortableItem({ id, event, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className="item-handle">⋮⋮</span>
      <span className="item-index">{index + 1}</span>
      <span className="item-title">{event.prompt}</span>
    </div>
  )
}

export function OrderGame({ events, onComplete, onSkip }: OrderGameProps) {
  const yearOf = (event: QuizItem) => event.year_correct ?? 0
  // Prendre 5 événements aléatoires
  const [selectedEvents] = useState<QuizItem[]>(() => {
    const shuffled = [...events].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  })

  // Mélanger pour le jeu
  const [items, setItems] = useState<QuizItem[]>(() => {
    return [...selectedEvents].sort(() => Math.random() - 0.5)
  })

  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; errors: number } | null>(null)
  const [startTime] = useState(Date.now())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.event_id.toString() === active.id)
        const newIndex = items.findIndex(i => i.event_id.toString() === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleCheck = useCallback(() => {
    setIsChecking(true)

    // Vérifier l'ordre
    const correctOrder = [...selectedEvents].sort((a, b) => yearOf(a) - yearOf(b))
    let errors = 0

    items.forEach((item, index) => {
      if (item.event_id !== correctOrder[index].event_id) {
        errors++
      }
    })

    const isCorrect = errors === 0
    setResult({ correct: isCorrect, errors })

    // Calculer les points bonus
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    let bonusPoints = 0

    if (isCorrect) {
      // Base bonus pour réussite
      bonusPoints = 200
      // Bonus temps (max 100 si moins de 30 secondes)
      if (timeTaken < 30) {
        bonusPoints += Math.round(100 * (1 - timeTaken / 30))
      }
    } else {
      // Petit bonus même en cas d'erreurs partielles
      bonusPoints = Math.max(0, 50 - errors * 10)
    }

    // Délai avant de terminer
    setTimeout(() => {
      onComplete(bonusPoints)
    }, 2500)
  }, [items, selectedEvents, startTime, onComplete])

  return (
    <Card variant="glass" padding="lg" className="order-game">
      <div className="game-header">
        <Badge variant="purple" size="lg" glow>
          Mini-jeu
        </Badge>
        <h2>Remets dans l'ordre !</h2>
        <p>Place ces {selectedEvents.length} événements du plus ancien au plus récent</p>
      </div>

      {!result ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(i => i.event_id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="sortable-list">
                {items.map((event, index) => (
                  <SortableItem
                    key={event.event_id}
                    id={event.event_id.toString()}
                    event={event}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="game-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheck}
              isLoading={isChecking}
            >
              <ValidateIcon size={20} /> Valider
            </Button>
            <Button variant="ghost" onClick={onSkip}>
              Passer
            </Button>
          </div>
        </>
      ) : (
        <div className={`game-result ${result.correct ? 'success' : 'partial'}`}>
          <div className="result-icon">
            {result.correct
              ? <CheckIcon size={48} color="var(--aa-success)" />
              : <CrossIcon size={48} color="var(--aa-warning)" />}
          </div>
          <h3>
            {result.correct
              ? 'Parfait !'
              : `${selectedEvents.length - result.errors}/${selectedEvents.length} bien placés`}
          </h3>

          <div className="correct-order">
            <p>L'ordre correct était :</p>
            {[...selectedEvents]
              .sort((a, b) => yearOf(a) - yearOf(b))
              .map((event) => (
                <div key={event.event_id} className="correct-item">
                  <Badge variant="accent" size="sm">{yearOf(event)}</Badge>
                  <span>{event.prompt}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </Card>
  )
}

