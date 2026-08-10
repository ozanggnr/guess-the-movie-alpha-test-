import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  handleStartGame,
  handleSubmitGuess,
  handleGetGameState,
} from '../controllers/game.controller'

const router = Router()

// Prevent spamming game creations (max 10 per hour per IP)
const startGameLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many games started. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Prevent brute-force guessing (max 20 guesses per 15 minutes per IP)
const guessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many guesses. Please take a break.' },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * @route  POST /api/game/start
 * @desc   Create a new game with a random available movie
 * @access Public (anonymous)
 */
router.post('/start', startGameLimiter, handleStartGame)

/**
 * @route  POST /api/game/:gameId/guess
 * @desc   Submit a guess for the current round
 * @access Public (anonymous)
 */
router.post('/:gameId/guess', guessLimiter, handleSubmitGuess)

/**
 * @route  GET /api/game/:gameId/state
 * @desc   Get safe current game state (no answer/title)
 * @access Public (anonymous)
 */
router.get('/:gameId/state', handleGetGameState)

export default router
