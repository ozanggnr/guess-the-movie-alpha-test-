import { Router } from 'express'
import { randomMovie, movieCount, movieTitles } from '../controllers/movie.controller'

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

/**
 * @route  GET /api/movies/titles
 * @desc   Get all movie titles for autocomplete suggestions
 * @access Public
 */
router.get('/titles', movieTitles)

export default router
