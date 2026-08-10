/**
 * MovieGuess Seed Script
 *
 * Seeds the database with 10 well-known movies and their verified
 * official YouTube trailer IDs.
 *
 * Pre-populated trailer IDs avoid YouTube API quota usage during seeding.
 * Use the ingestion service (movie.ingestion.service.ts) when you need to
 * add new movies and auto-discover trailers via the YouTube API.
 *
 * Run with: npm run db:seed (from the /server directory)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
})

// ─── Seed data ────────────────────────────────────────────────────────────────
// trailerYoutubeId values are verified official trailers from major channels.

const movies = [
  {
    imdbId: 'tt4154796',
    title: 'Avengers: Endgame',
    originalTitle: 'Avengers: Endgame',
    year: 2019,
    overview:
      'After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to undo Thanos\'s actions.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    genres: ['Action', 'Adventure', 'Science Fiction'],
    trailerYoutubeId: 'TcMBFSGVi1c',
    trailerTitle: 'Marvel Studios\' Avengers: Endgame | Official Trailer',
    trailerChannel: 'Marvel Entertainment',
    trailerDuration: 149,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt1375666',
    title: 'Inception',
    originalTitle: 'Inception',
    year: 2010,
    overview:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    genres: ['Action', 'Science Fiction', 'Adventure'],
    trailerYoutubeId: 'YoHD9XEInc0',
    trailerTitle: 'Inception - Official Trailer [HD]',
    trailerChannel: 'Warner Bros. Pictures',
    trailerDuration: 148,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt0816692',
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    year: 2014,
    overview:
      'Earth\'s future has been riddled by disasters, famines, and droughts. A group of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    trailerYoutubeId: 'zSWdZVtXT7E',
    trailerTitle: 'Interstellar - Official Trailer (HD)',
    trailerChannel: 'Paramount Pictures',
    trailerDuration: 151,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt0468569',
    title: 'The Dark Knight',
    originalTitle: 'The Dark Knight',
    year: 2008,
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    trailerYoutubeId: 'EXeTwQWrcwY',
    trailerTitle: 'The Dark Knight (2008) Official Trailer - Batman Movie HD',
    trailerChannel: 'Movieclips Classic Trailers',
    trailerDuration: 149,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt6751668',
    title: 'Parasite',
    originalTitle: '기생충',
    year: 2019,
    overview:
      'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Park family. They find themselves intertwined in an unexpected incident.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    genres: ['Comedy', 'Thriller', 'Drama'],
    trailerYoutubeId: '5xH0HfJHsaY',
    trailerTitle: 'Parasite [Official Trailer] – In Theaters October 11, 2019',
    trailerChannel: 'NEON',
    trailerDuration: 122,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt2582802',
    title: 'Whiplash',
    originalTitle: 'Whiplash',
    year: 2014,
    overview:
      'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    genres: ['Drama', 'Music'],
    trailerYoutubeId: '7d_jQycdQGo',
    trailerTitle: 'Whiplash - Official Trailer (HD)',
    trailerChannel: 'Sony Pictures Entertainment',
    trailerDuration: 147,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt1375670',
    title: 'The Grand Budapest Hotel',
    originalTitle: 'The Grand Budapest Hotel',
    year: 2014,
    overview:
      'A writer encounters the owner of an aging high-class hotel. He tells him of his early years serving as a lobby boy in the hotel\'s glorious years.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    genres: ['Comedy', 'Drama'],
    trailerYoutubeId: '1Fg5iWmQjwk',
    trailerTitle: 'The Grand Budapest Hotel Official Trailer (2014) - Wes Anderson Movie HD',
    trailerChannel: 'Movieclips Trailers',
    trailerDuration: 155,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt1392190',
    title: 'Mad Max: Fury Road',
    originalTitle: 'Mad Max: Fury Road',
    year: 2015,
    overview:
      'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
    genres: ['Action', 'Adventure', 'Science Fiction'],
    trailerYoutubeId: 'hEJnMQG9ev8',
    trailerTitle: 'Mad Max: Fury Road - Official Main Trailer [HD]',
    trailerChannel: 'Warner Bros. Pictures',
    trailerDuration: 210,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt4633694',
    title: 'Spider-Man: Into the Spider-Verse',
    originalTitle: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    overview:
      'Miles Morales is juggling his life between being a high school student and being Spider-Man. However, when Wilson "Kingpin" Fisk uses a super collider, others from across the Spider-Verse are transported to this dimension.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    genres: ['Action', 'Adventure', 'Animation', 'Science Fiction'],
    trailerYoutubeId: 'g4Hbz2jLxvQ',
    trailerTitle: 'SPIDER-MAN: INTO THE SPIDER-VERSE - Official Trailer (HD)',
    trailerChannel: 'Sony Pictures Entertainment',
    trailerDuration: 148,
    isTrailerAvailable: true,
  },
  {
    imdbId: 'tt0993846',
    title: 'The Wolf of Wall Street',
    originalTitle: 'The Wolf of Wall Street',
    year: 2013,
    overview:
      'Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg',
    genres: ['Comedy', 'Crime', 'Drama'],
    trailerYoutubeId: 'iszwuX1AK6A',
    trailerTitle: 'The Wolf of Wall Street - Official Trailer (HD)',
    trailerChannel: 'Paramount Pictures',
    trailerDuration: 185,
    isTrailerAvailable: true,
  },
]

// ─── Seed function ────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('\n🌱 Starting MovieGuess database seed...\n')

  let created = 0
  let skipped = 0
  let errors = 0

  for (const movie of movies) {
    try {
      // Upsert by imdbId (or title+year if no imdbId)
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
