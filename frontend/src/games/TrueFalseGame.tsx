/**
 * Mini-jeu TrueFalseGame - 10 affirmations Vrai/Faux
 */

import { useState, useCallback, useMemo } from 'react'
import { Button, Card, Badge } from '../components/ui'
import { CheckIcon, CrossIcon } from '../components/icons'
import type { QuizItem } from '../types'
import './TrueFalseGame.css'

interface TrueFalseGameProps {
  events: QuizItem[]
  onComplete: (bonusPoints: number) => void
  onSkip: () => void
}

interface Statement {
  id: number
  text: string
  isTrue: boolean
  event: QuizItem
  fakeYear?: number
}

export function TrueFalseGame({ events, onComplete, onSkip }: TrueFalseGameProps) {
  // Générer les affirmations basées sur tous les événements disponibles
  const statements = useMemo<Statement[]>(() => {
    // On utilise tous les événements reçus (maximum 10)
    const shuffledEvents = [...events].sort(() => Math.random() - 0.5).slice(0, 10)

    return shuffledEvents.map((event, index) => {
      // Alterner vrai/faux
      const isTrue = index % 2 === 0

      if (isTrue) {
        return {
          id: index,
          text: `"${event.prompt}" a eu lieu en ${event.year_correct}.`,
          isTrue: true,
          event
        }
      } else {
        // Générer une fausse année
        const offsets = [-20, -10, -5, 5, 10, 20, 30]
        const fakeYear = event.year_correct + offsets[Math.floor(Math.random() * offsets.length)]
        return {
          id: index,
          text: `"${event.prompt}" a eu lieu en ${fakeYear}.`,
          isTrue: false,
          event,
          fakeYear
        }
      }
    }).sort(() => Math.random() - 0.5) // Re-mélanger
  }, [events])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; statement: Statement } | null>(null)

  const currentStatement = statements[currentIndex]
  const correctCount = answers.reduce((acc, answer, idx) => {
    return acc + (answer === statements[idx].isTrue ? 1 : 0)
  }, 0)

  const handleAnswer = useCallback((userAnswer: boolean) => {
    const isCorrect = userAnswer === currentStatement.isTrue
    setAnswers(prev => [...prev, userAnswer])
    setLastAnswer({ correct: isCorrect, statement: currentStatement })

    // Passer à la question suivante après un délai
    setTimeout(() => {
      if (currentIndex < statements.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setLastAnswer(null)
      } else {
        // Fin du jeu
        setShowResult(true)

        // Calculer les points
        const finalCorrect = [...answers, userAnswer].reduce((acc, answer, idx) => {
          return acc + (answer === statements[idx].isTrue ? 1 : 0)
        }, 0)

        // Bonus basé sur les réponses correctes
        const bonusPoints = finalCorrect * 20 // 20 points par bonne réponse

        setTimeout(() => {
          onComplete(bonusPoints)
        }, 2000)
      }
    }, 1500)
  }, [currentIndex, currentStatement, statements, answers, onComplete])

  if (showResult) {
    const finalScore = answers.reduce((acc, answer, idx) => {
      return acc + (answer === statements[idx].isTrue ? 1 : 0)
    }, 0)

    return (
      <Card variant="glass" padding="lg" className="tf-game">
        <div className={`tf-result ${finalScore >= (statements.length * 0.7) ? 'success' : 'partial'}`}>
          <div className="result-icon">
            <CheckIcon size={48} color={finalScore >= 7 ? 'var(--aa-success)' : 'var(--aa-warning)'} />
          </div>
          <h2>{finalScore}/{statements.length} bonnes réponses</h2>
          <p>
            {finalScore >= (statements.length * 0.8)
              ? 'Excellent ! Tu connais bien l\'histoire de l\'IA !'
              : finalScore >= (statements.length * 0.6)
                ? 'Bien joué ! Continue à apprendre !'
                : 'Pas mal ! Tu peux t\'améliorer !'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" padding="lg" className="tf-game">
      <div className="game-header">
        <Badge variant="purple" size="lg" glow>
          Vrai ou Faux
        </Badge>
        <div className="tf-progress">
          <span>{currentIndex + 1} / {statements.length}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / statements.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="tf-content">
        {lastAnswer ? (
          <div className={`tf-feedback ${lastAnswer.correct ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              {lastAnswer.correct
                ? <CheckIcon size={32} color="var(--aa-success)" />
                : <CrossIcon size={32} color="var(--aa-error)" />}
            </div>
            <p className="feedback-text">
              {lastAnswer.correct ? 'Correct !' : 'Faux !'}
            </p>
            {!lastAnswer.correct && (
              <p className="feedback-correction">
                La bonne réponse était : {lastAnswer.statement.event.year_correct}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="tf-statement">
              <p>{currentStatement.text}</p>
            </div>

            <div className="tf-buttons">
              <Button
                variant="success"
                size="lg"
                onClick={() => handleAnswer(true)}
                className="tf-btn-true"
              >
                <CheckIcon size={20} /> Vrai
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => handleAnswer(false)}
                className="tf-btn-false"
              >
                <CrossIcon size={20} /> Faux
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="tf-score">
        Score actuel : {correctCount}/{currentIndex} correct
      </div>

      {!lastAnswer && (
        <Button variant="ghost" onClick={onSkip} className="skip-btn">
          Passer le mini-jeu
        </Button>
      )}
    </Card>
  )
}

