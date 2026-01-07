import React from 'react'
import { Card, Button, Badge } from './ui'
import { QuizItem } from '../types'
import './DiscoveryMode.css'

interface DiscoveryModeProps {
  event: QuizItem
  onNext: () => void
  isLast: boolean
}

export const DiscoveryMode: React.FC<DiscoveryModeProps> = ({
  event,
  onNext,
  isLast
}) => {
  return (
    <div className="discovery-container">
      <Card variant="glass" padding="xl" className="discovery-card">
        <div className="discovery-content">
          <div className="discovery-image-container">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="discovery-image" />
            ) : (
              <div className="discovery-image-placeholder">Pas d'image</div>
            )}
            <div className="discovery-year-badge">
              <Badge variant="accent" size="lg" glow>{event.year_correct}</Badge>
            </div>
          </div>

          <div className="discovery-info">
            <h2 className="discovery-title">{event.title}</h2>
            <p className="discovery-description">{event.description_short}</p>
            
            <div className="discovery-note">
              <h4>💡 Le savais-tu ?</h4>
              <p>
                {event.explanation || "Cet événement a marqué l'histoire de l'IA en montrant ce que les machines peuvent accomplir !"}
              </p>
            </div>
          </div>
        </div>

        <div className="discovery-actions">
          <Button variant="primary" size="lg" onClick={onNext} className="next-btn">
            {isLast ? "Prêt pour le quiz !" : "Événement Suivant"}
          </Button>
        </div>
      </Card>
      
      <div className="discovery-teacher-note">
        <p><strong>Note pour les élèves :</strong> Prenez le temps de lire la description et de comprendre l'événement.</p>
      </div>
    </div>
  )
}

