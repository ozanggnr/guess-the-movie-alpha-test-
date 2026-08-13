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
 * Includes fail-safe fallbacks if database migration is pending.
 */
export async function getRandomMovie(): Promise<SafeMoviePayload | null> {
  try {
    const count = await prisma.movie.count({
      where: { isTrailerAvailable: true },
    })

    if (count === 0) return null

    const skip = Math.floor(Math.random() * count)

    // Primary query with videoUrl
    try {
      const movie = await prisma.movie.findFirst({
        where: { isTrailerAvailable: true },
        skip,
        select: {
          id: true,
          trailerYoutubeId: true,
          videoUrl: true,
        },
      })

      if (!movie) return null

      return {
        movieId: movie.id,
        trailerYoutubeId: movie.trailerYoutubeId || '',
        videoUrl: movie.videoUrl || null,
      }
    } catch {
      // Fallback query if videoUrl column is pending on production DB
      const movie = await prisma.movie.findFirst({
        where: { isTrailerAvailable: true },
        skip,
        select: {
          id: true,
          trailerYoutubeId: true,
        },
      })

      if (!movie) return null

      return {
        movieId: movie.id,
        trailerYoutubeId: movie.trailerYoutubeId || '',
        videoUrl: null,
      }
    }
  } catch (err) {
    console.error('[getRandomMovie error]', err)
    return null
  }
}

/**
 * Retrieve full movie details — for internal use only.
 */
export async function getMovieById(id: string) {
  try {
    return await prisma.movie.findUnique({ where: { id } })
  } catch {
    return null
  }
}

/**
 * List all movies.
 */
export async function listMovies(page = 1, perPage = 20) {
  const skip = (page - 1) * perPage
  try {
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
  } catch {
    return { movies: [], total: 0, page, perPage }
  }
}

/**
 * Count available movies.
 */
export async function countAvailableMovies(): Promise<number> {
  try {
    return await prisma.movie.count({ where: { isTrailerAvailable: true } })
  } catch {
    return 0
  }
}

/**
 * Get all movie titles (for autocomplete).
 */
export async function getMovieTitles(): Promise<string[]> {
  try {
    const movies = await prisma.movie.findMany({
      where: { isTrailerAvailable: true },
      select: { title: true },
      orderBy: { title: 'asc' },
    })
    return movies.map(m => m.title)
  } catch {
    return []
  }
}

/**
 * Get full duration for a movie by ID or YouTube ID.
 */
export async function getTrailerDuration(trailerYoutubeId?: string | null): Promise<number | null> {
  if (!trailerYoutubeId || typeof trailerYoutubeId !== 'string' || !trailerYoutubeId.trim()) {
    return null
  }
  try {
    const movie = await prisma.movie.findFirst({
      where: {
        OR: [
          { trailerYoutubeId: trailerYoutubeId.trim() },
          { id: trailerYoutubeId.trim() },
        ],
      },
      select: { trailerDuration: true },
    })
    return movie?.trailerDuration ?? null
  } catch {
    return null
  }
}
