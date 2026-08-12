/**
 * MovieGuess Seed Script
 *
 * Seeds the database with 60 well-known movies and their verified
 * official YouTube trailer IDs.
 *
 * Pre-populated trailer IDs avoid YouTube API quota usage during seeding.
 *
 * Run with: npm run db:seed (from the /server directory)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { SEED_MOVIES } from '../src/data/moviesData'

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
})

async function seed(): Promise<void> {
  console.log('\n🌱 Starting MovieGuess database seed...\n')

  let created = 0
  let skipped = 0
  let errors = 0

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

      if (existing) {
        console.log(`  ⏩ Skipped (already exists): "${movie.title}" (${movie.year})`)
        skipped++
        continue
      }

      await prisma.movie.create({ data: movie })
      console.log(`  ✓ Created: "${movie.title}" (${movie.year}) — trailer: ${movie.trailerYoutubeId}`)
      created++
    } catch (err) {
      console.error(`  ✗ Failed: "${movie.title}" —`, err)
      errors++
    }
  }

  const available = await prisma.movie.count({ where: { isTrailerAvailable: true } })

  console.log('\n─────────────────────────────────────────')
  console.log(`  Created : ${created}`)
  console.log(`  Skipped : ${skipped}`)
  console.log(`  Errors  : ${errors}`)
  console.log(`  Total available movies: ${available}`)
  console.log('─────────────────────────────────────────')
  console.log('✅ Seed complete!\n')
}

seed()
  .catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
