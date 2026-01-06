/**
 * Store Zustand pour l'état global du jeu
 */

import { create } from 'zustand'
import type { ChapterId, GamePhase, QuizItem, AnsweredEvent } from '../types'

// === Constantes de scoring ===
const POINTS_CORRECT = 100
const POINTS_WRONG = -30
const BONUS_TIME_MAX = 50
const BONUS_TIME_THRESHOLD = 5000 // 5 secondes pour bonus max
const STREAK_BONUS = 20
const STREAK_BONUS_CAP = 100

interface GameState {
  // Configuration
  chapter: ChapterId | null
  chapterName: string
  phase: GamePhase

  // État du quiz
  quizItems: QuizItem[]
  currentIndex: number
  isLoading: boolean

  // Scores
  score: number
  streak: number
  streakMax: number
  correctCount: number

  // Historique
  answeredEvents: AnsweredEvent[]

  // Timing
  startTime: number | null
  questionStartTime: number | null
  totalDuration: number

  // Mini-jeux
  miniGamePending: boolean
  miniGameType: 'order' | 'trueFalse' | null
  miniGamesCompleted: number

  // Actions
  setChapter: (chapter: ChapterId, name: string) => void
  setPhase: (phase: GamePhase) => void
  setQuizItems: (items: QuizItem[]) => void
  setIsLoading: (isLoading: boolean) => void

  startGame: () => void
  startQuestion: () => void

  answerQuestion: (userAnswer: number) => {
    isCorrect: boolean
    pointsEarned: number
    bonusTime: number
    streakBonus: number
  }

  nextQuestion: () => void
  nextDiscovery: () => void

  triggerMiniGame: (type: 'order' | 'trueFalse') => void
  completeMiniGame: (bonusPoints: number) => void
  skipMiniGame: () => void

  finishGame: () => void
  resetGame: () => void

  // Computed
  getCurrentItem: () => QuizItem | null
  isGameOver: () => boolean
  getProgress: () => { current: number; total: number; percentage: number }
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  chapter: null,
  chapterName: '',
  phase: 'discovery',

  quizItems: [],
  currentIndex: 0,
  isLoading: false,

  score: 0,
  streak: 0,
  streakMax: 0,
  correctCount: 0,

  answeredEvents: [],

  startTime: null,
  questionStartTime: null,
  totalDuration: 0,

  miniGamePending: false,
  miniGameType: null,
  miniGamesCompleted: 0,

  // Actions
  setChapter: (chapter, name) => set({ chapter, chapterName: name }),
  setPhase: (phase) => set({ phase }),
  setQuizItems: (items) => set({ quizItems: items, currentIndex: 0, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),

  startGame: () => set({
    startTime: Date.now(),
    questionStartTime: Date.now(),
    score: 0,
    streak: 0,
    streakMax: 0,
    correctCount: 0,
    answeredEvents: [],
    currentIndex: 0,
    totalDuration: 0,
    miniGamesCompleted: 0,
    phase: 'discovery',
  }),

  startQuestion: () => set({ questionStartTime: Date.now() }),

  answerQuestion: (userAnswer) => {
    const state = get()
    const item = state.quizItems[state.currentIndex]
    if (!item) return { isCorrect: false, pointsEarned: 0, bonusTime: 0, streakBonus: 0 }

    const isCorrect = userAnswer === item.year_correct
    const timeTaken = Date.now() - (state.questionStartTime || Date.now())

    let pointsEarned = 0
    let bonusTime = 0
    let streakBonus = 0

    if (isCorrect) {
      pointsEarned = POINTS_CORRECT

      // Bonus rapidité
      if (timeTaken < BONUS_TIME_THRESHOLD) {
        bonusTime = Math.round(
          BONUS_TIME_MAX * (1 - timeTaken / BONUS_TIME_THRESHOLD)
        )
        pointsEarned += bonusTime
      }

      // Bonus streak
      const newStreak = state.streak + 1
      streakBonus = Math.min(newStreak * STREAK_BONUS, STREAK_BONUS_CAP)
      pointsEarned += streakBonus

      set(s => ({
        score: s.score + pointsEarned,
        streak: newStreak,
        streakMax: Math.max(s.streakMax, newStreak),
        correctCount: s.correctCount + 1,
        answeredEvents: [...s.answeredEvents, {
          event: item,
          isCorrect: true,
          userAnswer,
          timeTaken,
        }],
        phase: 'feedback'
      }))
    } else {
      pointsEarned = POINTS_WRONG

      set(s => ({
        score: Math.max(0, s.score + pointsEarned),
        streak: 0,
        answeredEvents: [...s.answeredEvents, {
          event: item,
          isCorrect: false,
          userAnswer,
          timeTaken,
        }],
        phase: 'feedback'
      }))
    }

    return { isCorrect, pointsEarned, bonusTime, streakBonus }
  },

  nextQuestion: () => {
    const state = get()
    const newIndex = state.currentIndex + 1

    if (newIndex >= state.quizItems.length) {
      set({ phase: 'result' })
      return
    }

    // Déclencher un mini-jeu après 3 questions
    if (newIndex > 0 && newIndex % 3 === 0 && state.miniGamesCompleted < 2) {
      const type = state.miniGamesCompleted === 0 ? 'order' : 'trueFalse'
      set({
        currentIndex: newIndex,
        miniGamePending: true,
        miniGameType: type,
        questionStartTime: Date.now(),
        phase: 'minigame'
      })
    } else {
      set({
        currentIndex: newIndex,
        questionStartTime: Date.now(),
        phase: 'quiz'
      })
    }
  },

  nextDiscovery: () => {
    const state = get()
    const newIndex = state.currentIndex + 1

    if (newIndex >= state.quizItems.length) {
      // Fin de la découverte, on passe au quiz
      set({
        currentIndex: 0,
        phase: 'quiz',
        questionStartTime: Date.now()
      })
    } else {
      set({
        currentIndex: newIndex
      })
    }
  },

  triggerMiniGame: (type) => set({
    miniGamePending: true,
    miniGameType: type,
    phase: 'minigame'
  }),

  completeMiniGame: (bonusPoints) => set(s => ({
    miniGamePending: false,
    miniGameType: null,
    miniGamesCompleted: s.miniGamesCompleted + 1,
    score: s.score + bonusPoints,
    phase: 'quiz'
  })),

  skipMiniGame: () => set({
    miniGamePending: false,
    miniGameType: null,
    phase: 'quiz'
  }),

  finishGame: () => {
    const state = get()
    const totalDuration = Math.round((Date.now() - (state.startTime || Date.now())) / 1000)
    set({ totalDuration, phase: 'result' })
  },

  resetGame: () => set({
    chapter: null,
    chapterName: '',
    phase: 'discovery',
    quizItems: [],
    currentIndex: 0,
    isLoading: false,
    score: 0,
    streak: 0,
    streakMax: 0,
    correctCount: 0,
    answeredEvents: [],
    startTime: null,
    questionStartTime: null,
    totalDuration: 0,
    miniGamePending: false,
    miniGameType: null,
    miniGamesCompleted: 0,
  }),

  // Computed
  getCurrentItem: () => {
    const { quizItems, currentIndex } = get()
    return quizItems[currentIndex] || null
  },

  isGameOver: () => {
    const { quizItems, currentIndex } = get()
    return currentIndex >= quizItems.length
  },

  getProgress: () => {
    const { quizItems, currentIndex } = get()
    const total = quizItems.length
    return {
      current: Math.min(currentIndex + 1, total),
      total,
      percentage: total > 0 ? Math.round((currentIndex / total) * 100) : 0,
    }
  },
}))

