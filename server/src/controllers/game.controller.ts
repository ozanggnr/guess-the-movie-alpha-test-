import { Request, Response, NextFunction } from 'express'
import { startGame, submitGuess, getGameState } from '../services/game.service'
import { ValidationError } from '../utils/gameErrors'

/**
 * POST /api/game/start
 *
 * Create a new game with a random movie.
 * Response NEVER includes: movie title, imdbId, overview, or answer.
 */
export async function handleStartGame(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await startGame()
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/game/:gameId/guess
 *
 * Submit a guess for the current round.
 * Backend is the sole authority on correctness and scoring.
 */
export async function handleSubmitGuess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { gameId } = req.params

    if (!gameId || typeof gameId !== 'string' || gameId.trim().length === 0) {
      throw new ValidationError('Invalid game ID')
    }

    const result = await submitGuess(gameId, req.body?.guess)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/game/:gameId/state
 *
 * Retrieve current game state (round, status, score).
 * Never includes movie title or answer.
 */
export async function handleGetGameState(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { gameId } = req.params

    if (!gameId || typeof gameId !== 'string') {
      throw new ValidationError('Invalid game ID')
    }

    const state = await getGameState(gameId)
    res.status(200).json(state)
  } catch (err) {
    next(err)
  }
}
