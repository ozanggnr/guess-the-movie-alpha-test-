import { ingestMovies, type MovieInput } from '../services/movie.ingestion.service'
import prisma from '../config/database'

// Dummy data source for now. In a real system this could fetch from TMDB, a CSV, etc.
const NEW_MOVIES: MovieInput[] = [
  { title: 'The Matrix', year: 1999, originalTitle: 'The Matrix', imdbId: 'tt0133093' },
  { title: 'Pulp Fiction', year: 1994, originalTitle: 'Pulp Fiction', imdbId: 'tt0110912' },
  { title: 'Forrest Gump', year: 1994, originalTitle: 'Forrest Gump', imdbId: 'tt0109830' },
  { title: 'Fight Club', year: 1999, originalTitle: 'Fight Club', imdbId: 'tt0137523' },
  { title: 'Goodfellas', year: 1990, originalTitle: 'Goodfellas', imdbId: 'tt0099685' },
]

async function main() {
  const args = process.argv.slice(2)
  const forceUpdateTrailer = args.includes('--update-trailers')

  console.log(`[INGEST] Starting movie ingestion process...`)
  if (forceUpdateTrailer) {
    console.log(`[INGEST] Mode: Forced trailer update enabled.`)
  }

  // Add the flag to all inputs
  const inputs = NEW_MOVIES.map(m => ({ ...m, forceUpdateTrailer }))

  try {
    const results = await ingestMovies(inputs)
    
    const success = results.filter(r => r.isTrailerAvailable).length
    const failed = results.filter(r => !r.isTrailerAvailable).length
    
    console.log(`\n[INGEST] Process completed!`)
    console.log(`[INGEST] Successfully ingested with trailers: ${success}`)
    console.log(`[INGEST] Skipped / No trailers found: ${failed}`)
  } catch (error) {
    console.error(`[INGEST] Fatal error during ingestion:`, error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
