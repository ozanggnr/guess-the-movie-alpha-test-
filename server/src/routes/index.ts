import { Router } from 'express'
import healthRouter from './health.routes'
import movieRouter from './movie.routes'
import gameRouter from './game.routes'

const router = Router()

/**
 * API route aggregator.
 * All routes are prefixed with /api (set in app.ts).
 */
router.use('/health', healthRouter)
router.use('/movies', movieRouter)       // Phase 2: Movie system
router.use('/game', gameRouter)          // Phase 3: Game engine

// Future phases will add:
// router.use('/auth', authRouter)              // Phase 4
// router.use('/scores', scoresRouter)          // Phase 5
// router.use('/leaderboard', leaderboardRouter) // Phase 7
// router.use('/admin', adminRouter)            // Phase 9

export default router
