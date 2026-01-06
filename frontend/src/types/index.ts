/**
 * Types TypeScript pour l'application
 */

// Chapitres
export type ChapterId = 'chapter_1' | 'chapter_2' | 'chapter_3' | 'chapter_4'

export interface Chapter {
  id: ChapterId
  name: string
  event_count: number
}

// Événements
export interface Event {
  id: number
  year: number
  title: string
  description_short: string
  chapter: ChapterId
  chapter_display?: string
  difficulty: 1 | 2 | 3
  tags: string[]
  people: string[]
  image_url: string | null
}

// Quiz
export type GamePhase = 'discovery' | 'quiz' | 'feedback' | 'minigame' | 'result'
export type GameMode = 'mcq' | 'dnd'

export interface QuizItem {
  event_id: number
  prompt: string
  year_correct: number
  options_years?: number[]
  description_short: string
  difficulty: number
  people: string[]
  image_url?: string | null
  explanation?: string // Nouvelle explication pédagogique
}

export interface QuizResponse {
  chapter: ChapterId
  chapter_display: string
  count: number
  items: QuizItem[]
}

// Runs / Parties
export interface PlayerRun {
  id: string
  nickname: string
  chapter: ChapterId
  chapter_display: string
  score: number
  correct_count: number
  total_questions: number
  duration_sec: number
  streak_max: number
  created_at: string
  finished_at: string | null
}

// État du jeu côté client
export interface AnsweredEvent {
  event: QuizItem
  isCorrect: boolean
  userAnswer: number
  timeTaken: number
}

// Réponse finish run
export interface FinishRunResponse {
  success: boolean
  run: PlayerRun
}

