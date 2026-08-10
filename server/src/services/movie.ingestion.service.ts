import prisma from '../config/database'
import { searchMovieTrailer } from './youtube.service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MovieInput {
  imdbId?: string
  title: string
  originalTitle?: string
  year: number
  overview?: string
  posterUrl?: string
  genres?: string[]
  forceUpdateTrailer?: boolean
}

export interface IngestionResult {
  movieId: string
  title: string
  isTrailerAvailable: boolean
  trailerYoutubeId: string | null
  trailerTitle: string | null
  trailerChannel: string | null
  trailerDuration: number | null
  created: boolean // false = already existed, updated instead
}

// ─── Ingestion service ────────────────────────────────────────────────────────

/**
 * Ingest a movie into the database.
 *
 * Process:
 *   1. Check if movie already exists (by imdbId or title+year).
 *   2. Search YouTube for the best official trailer.
 *   3. Upsert the movie record with trailer metadata.
 *   4. Return a full IngestionResult.
 *
 * YouTube API is ONLY called here — never during gameplay.
 */
export async function ingestMovie(input: MovieInput): Promise<IngestionResult> {
  const { imdbId, title, originalTitle, year, overview, posterUrl, genres = [], forceUpdateTrailer = false } = input

  // 1. Check for existing movie
  const existing = await prisma.movie.findFirst({
    where: {
      OR: [
        ...(imdbId ? [{ imdbId }] : []),
        { title, year },
      ],
    },
  })

  // 2. Search YouTube for best trailer
  let trailerYoutubeId: string | null = existing?.trailerYoutubeId ?? null
  let trailerTitle: string | null = existing?.trailerTitle ?? null
  let trailerChannel: string | null = existing?.trailerChannel ?? null
  let trailerDuration: number | null = existing?.trailerDuration ?? null
  let isTrailerAvailable = existing?.isTrailerAvailable ?? false

  const needsTrailerSearch = !trailerYoutubeId || forceUpdateTrailer

  if (needsTrailerSearch) {
    try {
      console.log(`[YOUTUBE] Searching official trailer for: "${title}" (${year})`)
      const trailer = await searchMovieTrailer(title, year)

      if (trailer) {
        trailerYoutubeId = trailer.videoId
        trailerTitle = trailer.title
        trailerChannel = trailer.channelTitle
        trailerDuration = trailer.duration
        isTrailerAvailable = true
        console.log(`[YOUTUBE] Trailer found: ${trailer.videoId} ("${trailer.title}")`)
      } else {
        console.warn(`[YOUTUBE] No suitable trailer found for "${title}" (${year})`)
      }
    } catch (err) {
      console.error(`[YOUTUBE] Search error for "${title}":`, err)
      // Non-fatal — movie is saved without a trailer
    }
  } else {
    console.log(`[YOUTUBE] Skipping search, trailer already exists: ${trailerYoutubeId}`)
  }

  // 3. Upsert movie
  const data = {
    imdbId: imdbId ?? null,
    title,
    originalTitle: originalTitle ?? null,
    year,
    overview: overview ?? null,
    posterUrl: posterUrl ?? null,
    genres,
    trailerYoutubeId,
    trailerTitle,
    trailerChannel,
    trailerDuration,
    isTrailerAvailable,
  }

  let movie: { id: string; title: string; isTrailerAvailable: boolean; trailerYoutubeId: string | null; trailerTitle: string | null; trailerChannel: string | null; trailerDuration: number | null }
  let created: boolean

  if (existing) {
    movie = await prisma.movie.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        title: true,
        isTrailerAvailable: true,
        trailerYoutubeId: true,
        trailerTitle: true,
        trailerChannel: true,
        trailerDuration: true,
      },
    })
    created = false
    console.log(`[ingestion] Updated existing movie: "${title}" [${movie.id}]`)
  } else {
    movie = await prisma.movie.create({
      data,
      select: {
        id: true,
        title: true,
        isTrailerAvailable: true,
        trailerYoutubeId: true,
        trailerTitle: true,
        trailerChannel: true,
        trailerDuration: true,
      },
    })
    created = true
    console.log(`[ingestion] Created new movie: "${title}" [${movie.id}]`)
  }

  return {
    movieId: movie.id,
    title: movie.title,
    isTrailerAvailable: movie.isTrailerAvailable,
    trailerYoutubeId: movie.trailerYoutubeId,
    trailerTitle: movie.trailerTitle,
    trailerChannel: movie.trailerChannel,
    trailerDuration: movie.trailerDuration,
    created,
  }
}

/**
 * Batch ingest multiple movies sequentially.
 * Delays between requests to respect YouTube API rate limits.
 */
export async function ingestMovies(
  inputs: MovieInput[],
  delayMs = 1000
): Promise<IngestionResult[]> {
  const results: IngestionResult[] = []

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    console.log(`[ingestion] Processing ${i + 1}/${inputs.length}: "${input.title}"`)

    const result = await ingestMovie(input)
    results.push(result)

    // Respect YouTube API quota — 1 second between ingestions
    if (i < inputs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}
