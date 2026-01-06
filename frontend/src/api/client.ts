/**
 * Client API pour communiquer avec le backend Django
 */

import type {
  Chapter,
  Event,
  QuizResponse,
  ChapterId,
  GameMode,
} from '../types'

/**
 * Détermine l'URL de l'API dynamiquement
 * - En production ou avec variable d'env : utilise VITE_API_URL
 * - En local : utilise le même hostname que le frontend mais port 8000
 */
function getApiUrl(): string {
  // Si une URL est explicitement définie, l'utiliser
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Sinon, utiliser le même host que le frontend mais port 8000
  // Cela permet aux appareils distants d'accéder à l'API
  const protocol = window.location.protocol
  const hostname = window.location.hostname

  return `${protocol}//${hostname}:8000`
}

const API_URL = getApiUrl()

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}/api/v1${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new ApiError(response.status, error.error || 'Erreur serveur')
  }

  return response.json()
}

// === Chapitres ===

export async function getChapters(): Promise<Chapter[]> {
  return request<Chapter[]>('/chapters/')
}

// === Événements ===

export async function getEvents(chapter?: ChapterId): Promise<Event[]> {
  const params = chapter ? `?chapter=${chapter}` : ''
  return request<Event[]>(`/events/${params}`)
}

export async function getEvent(id: number): Promise<Event> {
  return request<Event>(`/events/${id}/`)
}

// === Quiz ===

export interface GetQuizParams {
  chapter: ChapterId
  count?: number
  mode?: GameMode
}

export async function getQuiz(params: GetQuizParams): Promise<QuizResponse> {
  const searchParams = new URLSearchParams({
    chapter: params.chapter,
    count: String(params.count || 10),
    mode: params.mode || 'mcq',
  })
  return request<QuizResponse>(`/quiz/?${searchParams}`)
}

