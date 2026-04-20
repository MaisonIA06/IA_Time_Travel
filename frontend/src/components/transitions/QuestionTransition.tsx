/**
 * QuestionTransition - Animation entre les questions
 *
 * Effet de glissement 3D avec perspective lors du changement de question.
 */

import { useState, useEffect, useRef } from 'react'
import './QuestionTransition.css'

interface QuestionTransitionProps {
  children: React.ReactNode
  questionKey: string | number
  direction?: 'forward' | 'backward'
}

export function QuestionTransition({
  children,
  questionKey,
  direction = 'forward'
}: QuestionTransitionProps) {
  const [displayContent, setDisplayContent] = useState(children)
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle')
  const previousKey = useRef(questionKey)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousKey.current = questionKey
      return
    }

    if (previousKey.current !== questionKey) {
      // Start exit animation
      setPhase('exit')

      // After exit, swap content and enter
      const exitTimer = setTimeout(() => {
        setDisplayContent(children)
        setPhase('enter')
      }, 300)

      // Return to idle
      const enterTimer = setTimeout(() => {
        setPhase('idle')
        previousKey.current = questionKey
      }, 700)

      return () => {
        clearTimeout(exitTimer)
        clearTimeout(enterTimer)
      }
    } else {
      setDisplayContent(children)
    }
  }, [questionKey, children])

  return (
    <div className={`question-transition question-transition--${direction}`}>
      <div className={`question-content question-content--${phase}`}>
        {displayContent}
      </div>
    </div>
  )
}

