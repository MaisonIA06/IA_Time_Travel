/**
 * Store Zustand pour l'état global du jeu.
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

// === Mini-jeux ===
// Types des mini-jeux disponibles dans le jeu (en plus d'order / trueFalse legacy).
export type MiniGameType =
  | 'order'
  | 'trueFalse'
  | 'duelDates'
  | 'decennieRush'
  | 'avantApres'
  | 'courseContreTemps'

// Ordre des mini-jeux centrés sur les dates. Les trois premiers sont déclenchés
// en cours de quiz (après la 3e, 6e, 9e question) ; le dernier (speed-quiz)
// clôt la partie comme récompense.
const MINI_GAME_SEQUENCE: MiniGameType[] = [
  'duelDates',
  'decennieRush',
  'avantApres',
  'courseContreTemps',
]
const MINI_GAME_INLINE_COUNT = 3

interface GameState {
  // Configuration
  chapter: ChapterId | null
  chapterName: string
  phase: GamePhase

  // État du quiz
  quizItems: QuizItem[]
  // Map event_id -> année. Utilisée par la phase découverte et les mini-jeux
  // qui ont légitimement besoin de l'année (à l'inverse du QCM où l'année
  // n'est pas exposée pour éviter la triche).
  yearByEventId: Record<number, number>
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
  miniGameType: MiniGameType | null
  miniGamesCompleted: number

  // Actions
  setChapter: (chapter: ChapterId, name: string) => void
  setPhase: (phase: GamePhase) => void
  setQuizItems: (items: QuizItem[]) => void
  setYearByEventId: (map: Record<number, number>) => void
  setIsLoading: (isLoading: boolean) => void

  startGame: () => void
  startQuestion: () => void

  answerQuestion: (userAnswer: number) => {
    isCorrect: boolean
    pointsEarned: number
    bonusTime: number
    streakBonus: number
    correctYear: number
  }

  nextQuestion: () => void
  nextDiscovery: () => void
  prevDiscovery: () => void

  triggerMiniGame: (type: MiniGameType) => void
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
  chapter: null,
  chapterName: '',
  phase: 'discovery',

  quizItems: [],
  yearByEventId: {},
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

  setChapter: (chapter, name) => set({ chapter, chapterName: name }),
  setPhase: (phase) => set({ phase }),
  setQuizItems: (items) => set({ quizItems: items, currentIndex: 0, isLoading: false }),
  setYearByEventId: (map) => set({ yearByEventId: map }),
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
    if (!item) {
      return { isCorrect: false, pointsEarned: 0, bonusTime: 0, streakBonus: 0, correctYear: 0 }
    }

    const correctYear = item.year_correct
    const isCorrect = userAnswer === correctYear
    const timeTaken = Date.now() - (state.questionStartTime || Date.now())

    let pointsEarned = 0
    let bonusTime = 0
    let streakBonus = 0

    if (isCorrect) {
      pointsEarned = POINTS_CORRECT

      if (timeTaken < BONUS_TIME_THRESHOLD) {
        bonusTime = Math.round(
          BONUS_TIME_MAX * (1 - timeTaken / BONUS_TIME_THRESHOLD)
        )
        pointsEarned += bonusTime
      }

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
          correctYear,
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
          correctYear,
          timeTaken,
        }],
        phase: 'feedback'
      }))
    }

    return { isCorrect, pointsEarned, bonusTime, streakBonus, correctYear }
  },

  nextQuestion: () => {
    const state = get()
    const newIndex = state.currentIndex + 1
    const quizDone = newIndex >= state.quizItems.length

    // Fin du quiz : déclenche la Course contre le temps si pas encore jouée,
    // sinon termine la partie.
    if (quizDone) {
      const finalGame = MINI_GAME_SEQUENCE[MINI_GAME_SEQUENCE.length - 1]
      if (state.miniGamesCompleted < MINI_GAME_SEQUENCE.length) {
        set({
          currentIndex: newIndex,
          miniGamePending: true,
          miniGameType: finalGame,
          questionStartTime: Date.now(),
          phase: 'minigame',
        })
      } else {
        get().finishGame()
      }
      return
    }

    // Déclencher un mini-jeu toutes les 3 questions (jusqu'à MINI_GAME_INLINE_COUNT).
    const inlineDue = newIndex > 0
      && newIndex % 3 === 0
      && state.miniGamesCompleted < MINI_GAME_INLINE_COUNT
    if (inlineDue) {
      const type = MINI_GAME_SEQUENCE[state.miniGamesCompleted]
      set({
        currentIndex: newIndex,
        miniGamePending: true,
        miniGameType: type,
        questionStartTime: Date.now(),
        phase: 'minigame',
      })
    } else {
      set({
        currentIndex: newIndex,
        questionStartTime: Date.now(),
        phase: 'quiz',
      })
    }
  },

  nextDiscovery: () => {
    const state = get()
    const newIndex = state.currentIndex + 1

    if (newIndex >= state.quizItems.length) {
      set({
        currentIndex: 0,
        phase: 'quiz',
        startTime: Date.now(),
        questionStartTime: Date.now(),
      })
    } else {
      set({ currentIndex: newIndex })
    }
  },

  prevDiscovery: () => {
    set(s => ({ currentIndex: Math.max(0, s.currentIndex - 1) }))
  },

  triggerMiniGame: (type) => set({
    miniGamePending: true,
    miniGameType: type,
    phase: 'minigame',
  }),

  completeMiniGame: (bonusPoints) => {
    const state = get()
    const completed = state.miniGamesCompleted + 1
    const quizDone = state.currentIndex >= state.quizItems.length
    // Si on était dans le mini-jeu final (post-quiz), on termine la partie.
    if (quizDone) {
      set(s => ({
        miniGamePending: false,
        miniGameType: null,
        miniGamesCompleted: completed,
        score: s.score + bonusPoints,
      }))
      get().finishGame()
    } else {
      set(s => ({
        miniGamePending: false,
        miniGameType: null,
        miniGamesCompleted: completed,
        score: s.score + bonusPoints,
        phase: 'quiz',
      }))
    }
  },

  skipMiniGame: () => {
    const state = get()
    const quizDone = state.currentIndex >= state.quizItems.length
    if (quizDone) {
      set({ miniGamePending: false, miniGameType: null })
      get().finishGame()
    } else {
      set({ miniGamePending: false, miniGameType: null, phase: 'quiz' })
    }
  },

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
    yearByEventId: {},
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
