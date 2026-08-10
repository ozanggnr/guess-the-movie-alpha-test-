import { Request, Response, NextFunction } from 'express'
import { getRandomMovie, countAvailableMovies } from '../services/movie.service'

/**
 * GET /api/movies/random
 *
 * Selects a random movie with isTrailerAvailable = true.
 *
 * SECURITY: Response contains ONLY movieId and trailerYoutubeId.
 * title, imdbId, overview, and all answer-revealing fields are excluded.
 */
export async function randomMovie(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const movie = await getRandomMovie()

    if (!movie) {
      res.status(404).json({
        error: 'NoMoviesAvailable',
        message: 'No movies with trailers are available. Please seed the database.',
        statusCode: 404,
      })
      return
    }

    res.status(200).json({
      movieId: movie.movieId,
      trailerYoutubeId: movie.trailerYoutubeId,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/movies/count
 *
 * Returns the count of available (trailer-ready) movies.
 * Useful for health checks and admin dashboards.
 */
export async function movieCount(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await countAvailableMovies()
    res.status(200).json({ availableMovies: count })
  } catch (err) {
    next(err)
  }
}
