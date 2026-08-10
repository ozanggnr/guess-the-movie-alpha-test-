import { Router } from 'express'
import { randomMovie, movieCount } from '../controllers/movie.controller'

const router = Router()

/**
 * @route  GET /api/movies/random
 * @desc   Get a random movie (safe payload — no title, no answer)
 * @access Public
 */
router.get('/random', randomMovie)

/**
 * @route  GET /api/movies/count
 * @desc   Count of movies with trailers available
 * @access Public
 */
router.get('/count', movieCount)

export default router
