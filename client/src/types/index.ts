/**
 * Shared TypeScript types for MovieGuess.
 * These interfaces mirror the server-side Prisma models for consistency.
 */

// ─── Movie ────────────────────────────────────────────────────────────────────

/** Full movie record — internal use only. Never sent to frontend during a game. */
export interface Movie {
  id: string
  imdbId: string | null
  title: string
  originalTitle: string | null
  year: number
  overview: string | null
  posterUrl: string | null
  genres: string[]
  trailerYoutubeId: string | null
  trailerTitle: string | null
  trailerChannel: string | null
  trailerDuration: number | null
  isTrailerAvailable: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Safe movie payload — the ONLY movie data ever returned to the frontend
 * during active gameplay. Contains NO title, imdbId, or answer.
 */
export interface SafeMoviePayload {
  movieId: string
  trailerYoutubeId: string
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export type GameStatus = 'ACTIVE' | 'WON' | 'LOST'

export interface Game {
  id: string
  movieId: string
  currentRound: number
  status: GameStatus
  score: number | null
  startedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
  rounds: Round[]
}

// ─── Round ────────────────────────────────────────────────────────────────────

export type RoundResult = 'CORRECT' | 'INCORRECT' | 'SKIPPED'

export interface Round {
  id: string
  gameId: string
  roundNumber: number
  durationSeconds: number
  guess: string | null
  result: RoundResult | null
  guessedAt: string | null
  createdAt: string
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export const ROUND_DURATIONS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 5,
  4: 10,
} as const

export const ROUND_SCORES: Record<number, number> = {
  1: 1000,
  2: 750,
  3: 500,
  4: 250,
} as const

export const MAX_ROUNDS = 4

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface HealthResponse {
  status: 'ok'
}

export interface MovieCountResponse {
  availableMovies: number
}

// ─── Game API response shapes ─────────────────────────────────────────────────

/** Response from POST /api/game/start */
export interface GameStartResponse {
  gameId: string
  trailerYoutubeId: string
  trailerDuration: number | null
  round: number
  revealDuration: number
}

/** Correct guess response */
export interface GuessCorrectResponse {
  correct: true
  status: 'WON'
  score: number
}

/** Wrong guess, more rounds remaining */
export interface GuessWrongActiveResponse {
  correct: false
  status: 'ACTIVE'
  nextRound: number
  revealDuration: number
}

/** Wrong guess on final round — game over, answer revealed */
export interface GuessWrongLostResponse {
  correct: false
  status: 'LOST'
  answer: string
  score: 0
}

export type GuessResponse =
  | GuessCorrectResponse
  | GuessWrongActiveResponse
  | GuessWrongLostResponse

/** Safe game state (no answer, no title) */
export interface SafeGameState {
  gameId: string
  status: GameStatus
  currentRound: number
  score: number | null
  revealDuration: number
  startedAt: string
  completedAt: string | null
  expiresAt: string
}

