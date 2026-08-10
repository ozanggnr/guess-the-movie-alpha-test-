/**
 * Game Service Tests
 *
 * These tests are fully self-contained — they mock Prisma and the movie service
 * so no real database connection is needed.
 *
 * Run with: npm test (from /server)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameStatus, RoundResult } from '@prisma/client'

// ── Mock Prisma ──────────────────────────────────────────────────────────────
vi.mock('../config/database', () => ({
  default: {
    game: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    round: {
      upsert: vi.fn(),
    },
  },
}))

// ── Mock movie service ───────────────────────────────────────────────────────
vi.mock('../services/movie.service', () => ({
  getRandomMovie: vi.fn(),
}))

import prisma from '../config/database'
import { getRandomMovie } from '../services/movie.service'
import {
  startGame,
  submitGuess,
  getGameState,
  expireStaleGames,
  ROUND_DURATIONS,
  ROUND_SCORES,
  MAX_ROUNDS,
  GAME_TTL_MS,
} from '../services/game.service'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MOCK_MOVIE_ID = 'movie_cuid_1'
const MOCK_GAME_ID = 'game_cuid_1'
const MOCK_TRAILER_ID = 'TcMBFSGVi1c'
const FUTURE = new Date(Date.now() + GAME_TTL_MS)
const PAST = new Date(Date.now() - 1000)

function makeGame(overrides: Record<string, unknown> = {}) {
  return {
    id: MOCK_GAME_ID,
    movieId: MOCK_MOVIE_ID,
    currentRound: 1,
    status: GameStatus.ACTIVE,
    score: null,
    startedAt: new Date(),
    expiresAt: FUTURE,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    movie: { title: 'Inception', originalTitle: 'Inception' },
    rounds: [],
    ...overrides,
  }
}

// ─── startGame ───────────────────────────────────────────────────────────────

describe('startGame()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a new ACTIVE game and returns safe payload', async () => {
    vi.mocked(getRandomMovie).mockResolvedValue({
      movieId: MOCK_MOVIE_ID,
      trailerYoutubeId: MOCK_TRAILER_ID,
    })
    vi.mocked(prisma.game.create).mockResolvedValue({ id: MOCK_GAME_ID } as never)

    const result = await startGame()

    expect(result.gameId).toBe(MOCK_GAME_ID)
    expect(result.trailerYoutubeId).toBe(MOCK_TRAILER_ID)
    expect(result.round).toBe(1)
    expect(result.revealDuration).toBe(ROUND_DURATIONS[1]) // 1 second

    // Must NOT contain movie title or answer
    expect(result).not.toHaveProperty('title')
    expect(result).not.toHaveProperty('imdbId')
    expect(result).not.toHaveProperty('answer')
    expect(result).not.toHaveProperty('overview')
  })

  it('throws ServiceUnavailableError when no movies are available', async () => {
    vi.mocked(getRandomMovie).mockResolvedValue(null)

    await expect(startGame()).rejects.toMatchObject({
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE',
    })
  })
})

// ─── submitGuess — correct guess ─────────────────────────────────────────────

describe('submitGuess() — correct guess', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns WON with 1000 points on round 1 correct guess', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame() as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Inception')

    expect(result).toEqual({ correct: true, status: 'WON', score: 1000 })
    expect(prisma.game.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: GameStatus.WON, score: 1000 }),
      })
    )
  })

  it('is case-insensitive', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame() as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'INCEPTION')
    expect(result).toMatchObject({ correct: true, status: 'WON' })
  })

  it('trims whitespace from guess', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame() as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, '  inception  ')
    expect(result).toMatchObject({ correct: true, status: 'WON' })
  })

  it('returns correct score for round 2 win (700 pts)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 2 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Inception')
    expect(result).toMatchObject({ correct: true, status: 'WON', score: 700 })
  })

  it('returns correct score for round 3 win (400 pts)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 3 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Inception')
    expect(result).toMatchObject({ correct: true, status: 'WON', score: 400 })
  })

  it('returns correct score for round 4 win (200 pts)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 4 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Inception')
    expect(result).toMatchObject({ correct: true, status: 'WON', score: 200 })
  })
})

// ─── submitGuess — incorrect guess / round progression ───────────────────────

describe('submitGuess() — incorrect guess & round progression', () => {
  beforeEach(() => vi.clearAllMocks())

  it('advances to round 2 with correct revealDuration on wrong guess', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame() as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Wrong Title')

    expect(result).toEqual({
      correct: false,
      status: 'ACTIVE',
      nextRound: 2,
      revealDuration: ROUND_DURATIONS[2], // 3 seconds
    })
    expect(prisma.game.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { currentRound: 2 } })
    )
  })

  it('round 2 → 3 progression with correct revealDuration (5s)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 2 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Wrong')
    expect(result).toMatchObject({ nextRound: 3, revealDuration: 5 })
  })

  it('round 3 → 4 progression with correct revealDuration (10s)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 3 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Wrong')
    expect(result).toMatchObject({ nextRound: 4, revealDuration: 10 })
  })
})

// ─── submitGuess — final loss ─────────────────────────────────────────────────

describe('submitGuess() — final loss', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns LOST with answer and score 0 after round 4 wrong guess', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 4 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Completely Wrong')

    expect(result).toEqual({
      correct: false,
      status: 'LOST',
      answer: 'Inception',
      score: 0,
    })
    expect(prisma.game.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: GameStatus.LOST, score: 0 }),
      })
    )
  })

  it('answer is ONLY returned on final loss (not on earlier wrong guesses)', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(makeGame({ currentRound: 2 }) as never)
    vi.mocked(prisma.round.upsert).mockResolvedValue({} as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    const result = await submitGuess(MOCK_GAME_ID, 'Wrong')
    expect(result).not.toHaveProperty('answer')
  })
})

// ─── submitGuess — validation errors ─────────────────────────────────────────

describe('submitGuess() — validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws ValidationError on empty guess', async () => {
    await expect(submitGuess(MOCK_GAME_ID, '')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('throws ValidationError on whitespace-only guess', async () => {
    await expect(submitGuess(MOCK_GAME_ID, '   ')).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('throws ValidationError on guess exceeding 200 chars', async () => {
    const tooLong = 'a'.repeat(201)
    await expect(submitGuess(MOCK_GAME_ID, tooLong)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('throws ValidationError when guess is null', async () => {
    await expect(submitGuess(MOCK_GAME_ID, null)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('throws ValidationError when guess is a number', async () => {
    await expect(submitGuess(MOCK_GAME_ID, 42)).rejects.toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    })
  })
})

// ─── submitGuess — invalid game ID ───────────────────────────────────────────

describe('submitGuess() — invalid game ID', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws NotFoundError for non-existent game ID', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null)

    await expect(submitGuess('nonexistent_id', 'Inception')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  })
})

// ─── submitGuess — guessing after completion ──────────────────────────────────

describe('submitGuess() — guessing after completion', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws ConflictError when game is already WON', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(
      makeGame({ status: GameStatus.WON }) as never
    )

    await expect(submitGuess(MOCK_GAME_ID, 'Inception')).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    })
  })

  it('throws ConflictError when game is already LOST', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(
      makeGame({ status: GameStatus.LOST }) as never
    )

    await expect(submitGuess(MOCK_GAME_ID, 'Inception')).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    })
  })
})

// ─── submitGuess — duplicate submission ──────────────────────────────────────

describe('submitGuess() — duplicate round submission', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws ConflictError on duplicate submission for same round', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(
      makeGame({
        rounds: [
          {
            id: 'r1',
            gameId: MOCK_GAME_ID,
            roundNumber: 1,
            durationSeconds: 1,
            guess: 'Some guess',
            result: RoundResult.INCORRECT,
            guessedAt: new Date(),
            createdAt: new Date(),
          },
        ],
      }) as never
    )

    await expect(submitGuess(MOCK_GAME_ID, 'Another guess')).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    })
  })
})

// ─── Game expiration ──────────────────────────────────────────────────────────

describe('submitGuess() — game expiration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws GoneError when game has expired', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(
      makeGame({ expiresAt: PAST }) as never
    )
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    await expect(submitGuess(MOCK_GAME_ID, 'Inception')).rejects.toMatchObject({
      statusCode: 410,
      code: 'GONE',
    })
  })

  it('auto-marks expired game as LOST when guessed', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(
      makeGame({ expiresAt: PAST }) as never
    )
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    await expect(submitGuess(MOCK_GAME_ID, 'Inception')).rejects.toThrow()

    expect(prisma.game.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: GameStatus.LOST }),
      })
    )
  })
})

// ─── expireStaleGames ─────────────────────────────────────────────────────────

describe('expireStaleGames()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marks all expired ACTIVE games as LOST', async () => {
    vi.mocked(prisma.game.updateMany).mockResolvedValue({ count: 3 } as never)

    const count = await expireStaleGames()
    expect(count).toBe(3)

    expect(prisma.game.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: GameStatus.ACTIVE,
          expiresAt: expect.objectContaining({ lt: expect.any(Date) }),
        }),
        data: expect.objectContaining({ status: GameStatus.LOST, score: 0 }),
      })
    )
  })

  it('returns 0 when no stale games exist', async () => {
    vi.mocked(prisma.game.updateMany).mockResolvedValue({ count: 0 } as never)
    const count = await expireStaleGames()
    expect(count).toBe(0)
  })
})

// ─── Constants verification ───────────────────────────────────────────────────

describe('Game constants', () => {
  it('ROUND_DURATIONS match spec (1, 3, 5, 10)', () => {
    expect(ROUND_DURATIONS[1]).toBe(1)
    expect(ROUND_DURATIONS[2]).toBe(3)
    expect(ROUND_DURATIONS[3]).toBe(5)
    expect(ROUND_DURATIONS[4]).toBe(10)
  })

  it('ROUND_SCORES match spec (1000, 700, 400, 200)', () => {
    expect(ROUND_SCORES[1]).toBe(1000)
    expect(ROUND_SCORES[2]).toBe(700)
    expect(ROUND_SCORES[3]).toBe(400)
    expect(ROUND_SCORES[4]).toBe(200)
  })

  it('MAX_ROUNDS is 4', () => {
    expect(MAX_ROUNDS).toBe(4)
  })
})

// ─── getGameState ─────────────────────────────────────────────────────────────

describe('getGameState()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns safe state without movie title or answer', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: MOCK_GAME_ID,
      status: GameStatus.ACTIVE,
      currentRound: 2,
      score: null,
      startedAt: new Date(),
      completedAt: null,
      expiresAt: FUTURE,
    } as never)

    const state = await getGameState(MOCK_GAME_ID)

    expect(state.gameId).toBe(MOCK_GAME_ID)
    expect(state.status).toBe(GameStatus.ACTIVE)
    expect(state.currentRound).toBe(2)
    expect(state.revealDuration).toBe(ROUND_DURATIONS[2])

    // Must not contain answer
    expect(state).not.toHaveProperty('title')
    expect(state).not.toHaveProperty('answer')
    expect(state).not.toHaveProperty('imdbId')
  })

  it('throws NotFoundError for non-existent game', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null)

    await expect(getGameState('bad_id')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    })
  })

  it('throws GoneError and expires game on state fetch if expired', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: MOCK_GAME_ID,
      status: GameStatus.ACTIVE,
      currentRound: 1,
      score: null,
      startedAt: new Date(),
      completedAt: null,
      expiresAt: PAST,
    } as never)
    vi.mocked(prisma.game.update).mockResolvedValue({} as never)

    await expect(getGameState(MOCK_GAME_ID)).rejects.toMatchObject({
      statusCode: 410,
      code: 'GONE',
    })
  })
})
