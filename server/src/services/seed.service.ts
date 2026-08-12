import prisma from '../config/database'
import { SEED_MOVIES } from '../data/moviesData'

export async function ensureMoviesSeeded(): Promise<number> {
  const currentCount = await prisma.movie.count({
    where: { isTrailerAvailable: true },
  })

  if (currentCount >= 50) {
    return 0
  }

  console.log(`[db] Available movies count (${currentCount}) is below target (50). Auto-seeding movies...`)

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
      }
    } catch (err) {
      console.error(`[db] Auto-seed failed for "${movie.title}":`, err)
    }
  }

  const finalCount = await prisma.movie.count({ where: { isTrailerAvailable: true } })
  console.log(`[db] Auto-seed complete. Total movies in DB: ${finalCount} (added ${added}) ✓`)
  return added
}
