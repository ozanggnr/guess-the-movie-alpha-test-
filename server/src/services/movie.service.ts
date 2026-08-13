import prisma from '../config/database'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The safe public payload returned to the frontend for a random movie.
 * MUST NOT contain: title, imdbId, overview, or any answer-revealing fields.
 */
export interface SafeMoviePayload {
  movieId: string
  trailerYoutubeId: string
  videoUrl?: string | null
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Select a random movie that has a trailer/video available.
 *
 * Returns only the fields safe to expose to the frontend.
 * The movie's title, imdbId, and overview are NEVER returned.
 */
export async function getRandomMovie(): Promise<SafeMoviePayload | null> {
  const count = await prisma.movie.count({
    where: { isTrailerAvailable: true },
  })

  if (count === 0) return null

  const skip = Math.floor(Math.random() * count)

  const movie = await prisma.movie.findFirst({
    where: { isTrailerAvailable: true },
    skip,
    select: {
      id: true,
      trailerYoutubeId: true,
      videoUrl: true,
    },
  })

  if (!movie || (!movie.trailerYoutubeId && !movie.videoUrl)) return null

  return {
    movieId: movie.id,
    trailerYoutubeId: movie.trailerYoutubeId || '',
    videoUrl: movie.videoUrl || null,
  }
}

/**
 * Retrieve full movie details — for internal use only.
 */
export async function getMovieById(id: string) {
  return prisma.movie.findUnique({ where: { id } })
}

/**
 * List all movies.
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
        videoUrl: true,
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
 * Count available movies.
 */
export async function countAvailableMovies(): Promise<number> {
  return prisma.movie.count({ where: { isTrailerAvailable: true } })
}

/**
 * Get all movie titles (for autocomplete).
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
 * Get full duration for a movie.
 */
export async function getTrailerDuration(trailerYoutubeId: string): Promise<number | null> {
  const movie = await prisma.movie.findFirst({
    where: { OR: [{ trailerYoutubeId }, { id: trailerYoutubeId }] },
    select: { trailerDuration: true },
  })
  return movie?.trailerDuration ?? null
}
