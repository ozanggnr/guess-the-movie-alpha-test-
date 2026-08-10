import { GameStatus, RoundResult } from '@prisma/client'
import prisma from '../config/database'
import { getRandomMovie } from './movie.service'
import { isCorrectGuess, validateGuess } from '../utils/normalizeGuess'
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  GoneError,
  ServiceUnavailableError,
} from '../utils/gameErrors'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Seconds of trailer revealed per round */
export const ROUND_DURATIONS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 5,
  4: 10,
} as const

export const MAX_ROUNDS = 4

/**
 * Points awarded for a correct guess per round.
 * Backend is the sole authority — frontend must never calculate score.
 */
export const ROUND_SCORES: Record<number, number> = {
  1: 1000,
  2: 700,
  3: 400,
  4: 200,
} as const

/** How long an abandoned game stays ACTIVE before being auto-expired (ms) */
export const GAME_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

// ─── Response types ───────────────────────────────────────────────────────────

export interface StartGameResponse {
  gameId: string
  trailerYoutubeId: string
  round: number
  revealDuration: number
}

export interface GuessCorrectResponse {
  correct: true
  status: 'WON'
  score: number
}

export interface GuessWrongActiveResponse {
  correct: false
  status: 'ACTIVE'
  nextRound: number
  revealDuration: number
}

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

// ─── Start game ───────────────────────────────────────────────────────────────

/**
 * Start a new game:
 *   1. Pick a random available movie.
 *   2. Create a Game record (ACTIVE, round 1) with an expiry timestamp.
 *   3. Return the safe start payload — never the movie title.
 */
export async function startGame(): Promise<StartGameResponse> {
  const movie = await getRandomMovie()
  if (!movie) {
    throw new ServiceUnavailableError(
      'No movies available. Please seed the database before starting a game.'
    )
  }

  const expiresAt = new Date(Date.now() + GAME_TTL_MS)

  const game = await prisma.game.create({
    data: {
      movieId: movie.movieId,
      currentRound: 1,
      status: GameStatus.ACTIVE,
      expiresAt,
    },
    select: { id: true },
  })

  return {
    gameId: game.id,
    trailerYoutubeId: movie.trailerYoutubeId,
    round: 1,
    revealDuration: ROUND_DURATIONS[1],
  }
}

// ─── Submit guess ─────────────────────────────────────────────────────────────

/**
 * Process a player's guess for the current round of a game.
 *
 * Security rules enforced here (backend is authoritative):
 *   - Game must exist
 *   - Game must be ACTIVE (not WON, LOST, or expired)
 *   - Guess must be non-empty and ≤ 200 chars
 *   - No duplicate submissions for the same round
 *   - Score is always calculated server-side
 *   - Answer is ONLY revealed on final loss
 */
export async function submitGuess(
  gameId: string,
  rawGuess: unknown
): Promise<GuessResponse> {
  // 1. Validate guess input
  const guessError = validateGuess(rawGuess)
  if (guessError) throw new ValidationError(guessError)
  const guess = (rawGuess as string).trim()

  // 2. Load game with movie (need movie title for comparison)
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      movie: {
        select: {
          title: true,
          originalTitle: true,
          // NOTE: these are loaded server-side only for comparison — never sent to client
        },
      },
      rounds: true,
    },
  })

  if (!game) throw new NotFoundError('Game')

  // 3. Check game is still active
  if (game.status === GameStatus.WON || game.status === GameStatus.LOST) {
    throw new ConflictError(
      `Game is already ${game.status.toLowerCase()}. No further guesses accepted.`
    )
  }

  // 4. Check expiry
  if (game.expiresAt < new Date()) {
    // Auto-expire the game before rejecting
    await prisma.game.update({
      where: { id: gameId },
      data: { status: GameStatus.LOST, score: 0, completedAt: new Date() },
    })
    throw new GoneError('This game has expired. Start a new game.')
  }

  const currentRound = game.currentRound

  // 5. Check for duplicate submission on current round
  const existingRound = game.rounds.find(r => r.roundNumber === currentRound)
  if (existingRound && existingRound.result !== null) {
    throw new ConflictError(
      `Round ${currentRound} has already been submitted. Wait for the next round.`
    )
  }

  // 6. Evaluate the guess
  const correct = isCorrectGuess(guess, game.movie.title, game.movie.originalTitle)
  const roundResult: RoundResult = correct ? RoundResult.CORRECT : RoundResult.INCORRECT

  // 7. Persist the round record
  await prisma.round.upsert({
    where: { gameId_roundNumber: { gameId, roundNumber: currentRound } },
    create: {
      gameId,
      roundNumber: currentRound,
      durationSeconds: ROUND_DURATIONS[currentRound],
      guess,
      result: roundResult,
      guessedAt: new Date(),
    },
    update: {
      guess,
      result: roundResult,
      guessedAt: new Date(),
    },
  })

  // 8a. Correct guess → WON
  if (correct) {
    const score = ROUND_SCORES[currentRound] ?? 0
    await prisma.game.update({
      where: { id: gameId },
      data: { status: GameStatus.WON, score, completedAt: new Date() },
    })
    return { correct: true, status: 'WON', score }
  }

  // 8b. Wrong guess, rounds remain → advance round
  if (currentRound < MAX_ROUNDS) {
    const nextRound = currentRound + 1
    await prisma.game.update({
      where: { id: gameId },
      data: { currentRound: nextRound },
    })
    return {
      correct: false,
      status: 'ACTIVE',
      nextRound,
      revealDuration: ROUND_DURATIONS[nextRound],
    }
  }

  // 8c. Wrong guess on final round → LOST, reveal answer
  await prisma.game.update({
    where: { id: gameId },
    data: { status: GameStatus.LOST, score: 0, completedAt: new Date() },
  })
  return {
    correct: false,
    status: 'LOST',
    answer: game.movie.title, // Only revealed after permanent loss
    score: 0,
  }
}

// ─── Game state (safe, for status polling) ───────────────────────────────────

export interface SafeGameState {
  gameId: string
  status: GameStatus
  currentRound: number
  score: number | null
  revealDuration: number
  startedAt: Date
  completedAt: Date | null
  expiresAt: Date
}

/**
 * Get a safe snapshot of game state.
 * Never includes movie title, imdbId, or answer.
 */
export async function getGameState(gameId: string): Promise<SafeGameState> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      status: true,
      currentRound: true,
      score: true,
      startedAt: true,
      completedAt: true,
      expiresAt: true,
    },
  })

  if (!game) throw new NotFoundError('Game')

  // Auto-check expiry on state fetch
  if (game.status === GameStatus.ACTIVE && game.expiresAt < new Date()) {
    await prisma.game.update({
      where: { id: gameId },
      data: { status: GameStatus.LOST, score: 0, completedAt: new Date() },
    })
    throw new GoneError('This game has expired. Start a new game.')
  }

  return {
    gameId: game.id,
    status: game.status,
    currentRound: game.currentRound,
    score: game.score,
    revealDuration: ROUND_DURATIONS[game.currentRound] ?? ROUND_DURATIONS[MAX_ROUNDS],
    startedAt: game.startedAt,
    completedAt: game.completedAt,
    expiresAt: game.expiresAt,
  }
}

// ─── Stale game cleanup ───────────────────────────────────────────────────────

/**
 * Expire all ACTIVE games whose expiresAt has passed.
 * Call this periodically (e.g. every 5 min) or on server startup.
 * Returns the count of games expired.
 */
export async function expireStaleGames(): Promise<number> {
  const result = await prisma.game.updateMany({
    where: {
      status: GameStatus.ACTIVE,
      expiresAt: { lt: new Date() },
    },
    data: {
      status: GameStatus.LOST,
      score: 0,
      completedAt: new Date(),
    },
  })
  return result.count
}

// ─── Legacy helpers (kept for compatibility) ─────────────────────────────────

/** @deprecated Use startGame() instead */
export async function createGame(movieId: string) {
  const expiresAt = new Date(Date.now() + GAME_TTL_MS)
  return prisma.game.create({
    data: { movieId, currentRound: 1, status: GameStatus.ACTIVE, expiresAt },
    select: { id: true, movieId: true, currentRound: true, status: true, startedAt: true },
  })
}

/** @deprecated Use getGameState() instead */
export async function getGameById(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: { rounds: { orderBy: { roundNumber: 'asc' } } },
  })
}

/** @deprecated Score is now calculated inside submitGuess() */
export async function winGame(gameId: string, round: number) {
  const score = ROUND_SCORES[round] ?? 0
  return prisma.game.update({
    where: { id: gameId },
    data: { status: GameStatus.WON, score, completedAt: new Date() },
  })
}

/** @deprecated Handled inside submitGuess() */
export async function loseGame(gameId: string) {
  return prisma.game.update({
    where: { id: gameId },
    data: { status: GameStatus.LOST, score: 0, completedAt: new Date() },
  })
}
