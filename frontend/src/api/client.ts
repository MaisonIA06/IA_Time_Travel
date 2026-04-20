/**
 * Client API pour communiquer avec le backend Django.
 */

import type {
  Chapter,
  Event,
  QuizResponse,
  QuizCheckResponse,
  ChapterId,
  GameMode,
  MuseumSheet,
  MuseumSheetsResponse,
} from '../types'

/**
 * Détermine l'URL de l'API dynamiquement :
 * - Si VITE_API_URL est défini, on l'utilise.
 * - Sinon, on reprend le hostname courant + port 8000, pour que les
 *   appareils distants (LAN) atteignent l'API via l'IP de la machine hôte.
 */
function getApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
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

/**
 * Vérifie la réponse d'un joueur côté serveur.
 * La bonne année n'est révélée qu'après soumission (anti-triche).
 */
export async function checkQuizAnswer(
  eventId: number,
  year: number
): Promise<QuizCheckResponse> {
  return request<QuizCheckResponse>('/quiz/check/', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId, year }),
  })
}

// === Musée virtuel ===

export async function getMuseumSheets(): Promise<MuseumSheet[]> {
  const page = await request<MuseumSheetsResponse>('/museum/sheets/')
  return page.results
}

export async function getMuseumSheet(eventId: number): Promise<MuseumSheet> {
  return request<MuseumSheet>(`/museum/sheets/${eventId}/`)
}
