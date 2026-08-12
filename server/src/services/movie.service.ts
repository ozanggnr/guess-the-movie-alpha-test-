import prisma from '../config/database'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The safe public payload returned to the frontend for a random movie.
 * MUST NOT contain: title, imdbId, overview, or any answer-revealing fields.
 */
export interface SafeMoviePayload {
  movieId: string
  trailerYoutubeId: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Select a random movie that has a trailer available.
 *
 * Uses PostgreSQL's RANDOM() via a raw query for true randomness at scale.
 * Falls back to a count+offset approach for compatibility.
 *
 * Returns only the fields safe to expose to the frontend.
 * The movie's title, imdbId, and overview are NEVER returned.
 */
export async function getRandomMovie(): Promise<SafeMoviePayload | null> {
  // Count available movies
  const count = await prisma.movie.count({
    where: { isTrailerAvailable: true },
  })

  if (count === 0) return null

  // Pick a random offset
  const skip = Math.floor(Math.random() * count)

  const movie = await prisma.movie.findFirst({
    where: { isTrailerAvailable: true },
    skip,
    select: {
      id: true,
      trailerYoutubeId: true,
      // Explicitly NOT selecting: title, imdbId, overview, originalTitle
    },
  })

  if (!movie || !movie.trailerYoutubeId) return null

  return {
    movieId: movie.id,
    trailerYoutubeId: movie.trailerYoutubeId,
  }
}

/**
 * Retrieve full movie details — for internal use only (never expose to frontend
 * during an active game).
 */
export async function getMovieById(id: string) {
  return prisma.movie.findUnique({ where: { id } })
}

/**
 * List all movies (admin/seed verification use only).
 */
export async function listMovies(page = 1, perPage = 20) {
  const skip = (page - 1) * perPage
  const [movies, total] = await prisma.$transaction([
    prisma.movie.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        year: true,
        genres: true,
        isTrailerAvailable: true,
        trailerYoutubeId: true,
        trailerChannel: true,
        trailerDuration: true,
        createdAt: true,
      },
    }),
    prisma.movie.count(),
  ])
  return { movies, total, page, perPage }
}

/**
 * Count available (trailer-ready) movies.
 */
export async function countAvailableMovies(): Promise<number> {
  return prisma.movie.count({ where: { isTrailerAvailable: true } })
}

/**
 * Get all movie titles (for autocomplete).
 * Safe to expose — titles are only used for the guess input dropdown.
 * Note: this is intentionally a flat list of strings, not full movie objects.
 */
export async function getMovieTitles(): Promise<string[]> {
  const movies = await prisma.movie.findMany({
    where: { isTrailerAvailable: true },
    select: { title: true },
    orderBy: { title: 'asc' },
  })
  return movies.map(m => m.title)
}

/**
 * Get full trailer duration for a movie by its YouTube ID.
 */
export async function getTrailerDuration(trailerYoutubeId: string): Promise<number | null> {
  const movie = await prisma.movie.findFirst({
    where: { trailerYoutubeId },
    select: { trailerDuration: true },
  })
  return movie?.trailerDuration ?? null
}
