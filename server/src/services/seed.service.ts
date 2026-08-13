import prisma from '../config/database'
import { SEED_MOVIES } from '../data/moviesData'

export async function ensureMoviesSeeded(): Promise<number> {
  try {
    const currentCount = await prisma.movie.count({
      where: { isTrailerAvailable: true },
    })

    if (currentCount >= SEED_MOVIES.length) {
      return 0
    }

    console.log(`[db] Current movies count (${currentCount}) is below seed target (${SEED_MOVIES.length}). Seeding/updating movies...`)

    let added = 0
    for (const movie of SEED_MOVIES) {
      try {
        const existing = await prisma.movie.findFirst({
          where: {
            OR: [
              { imdbId: movie.imdbId },
              { title: movie.title, year: movie.year },
            ],
          },
        })

        if (!existing) {
          await prisma.movie.create({ data: movie })
          added++
        } else if (movie.videoUrl && !(existing as any).videoUrl) {
          // Update existing movie record with new videoUrl if available
          await prisma.movie.update({
            where: { id: existing.id },
            data: { videoUrl: movie.videoUrl },
          })
        }
      } catch (err) {
        console.error(`[db] Auto-seed error for "${movie.title}":`, err)
      }
    }

    const finalCount = await prisma.movie.count({ where: { isTrailerAvailable: true } })
    console.log(`[db] Auto-seed complete. Total movies in DB: ${finalCount} (added ${added}) ✓`)
    return added
  } catch (err) {
    console.error('[ensureMoviesSeeded failed]', err)
    return 0
  }
}
