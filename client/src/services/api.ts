import axios from 'axios'
import type {
  HealthResponse,
  SafeMoviePayload,
  MovieCountResponse,
  GameStartResponse,
  GuessResponse,
  SafeGameState,
} from '@/types'

/**
 * Base Axios instance. All API calls go through this client.
 * VITE_API_URL is set at build time — never hardcode the backend URL.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  config => {
    // Auth token injection will be added in Phase 2
    return config
  },
  error => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized — will redirect to login in Phase 2
    }
    return Promise.reject(error)
  }
)

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => apiClient.get<HealthResponse>('/api/health'),
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export const moviesApi = {
  getRandom: () => apiClient.get<SafeMoviePayload>('/api/movies/random'),
  getCount: () => apiClient.get<MovieCountResponse>('/api/movies/count'),
  getTitles: () => apiClient.get<{ titles: string[] }>('/api/movies/titles'),
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export const gameApi = {
  /** Start a new game — returns safe payload (no title/answer) */
  start: () => apiClient.post<GameStartResponse>('/api/game/start'),

  /** Submit a guess for the current round */
  guess: (gameId: string, guess: string) =>
    apiClient.post<GuessResponse>(`/api/game/${gameId}/guess`, { guess }),

  /** Get current game state (no answer/title) */
  getState: (gameId: string) =>
    apiClient.get<SafeGameState>(`/api/game/${gameId}/state`),
}

export default apiClient
