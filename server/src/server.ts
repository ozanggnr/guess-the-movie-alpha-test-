import app from './app'
import { env } from './config/env'
import prisma from './config/database'
import { expireStaleGames } from './services/game.service'
import { ensureMoviesSeeded } from './services/seed.service'

// ─── Stale game expiry interval ───────────────────────────────────────────────
const EXPIRY_INTERVAL_MS = 5 * 60 * 1000 // every 5 minutes

async function bootstrap(): Promise<void> {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect()
    console.log('[db] Connected to PostgreSQL ✓')

    // Auto-seed database if fewer than 50 movies exist
    await ensureMoviesSeeded()

    // Run expiry cleanup on startup
    const expiredOnStart = await expireStaleGames()
    if (expiredOnStart > 0) {
      console.log(`[game] Expired ${expiredOnStart} stale game(s) on startup`)
    }

    // Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`[server] Running on port ${env.port} (${env.nodeEnv}) ✓`)
      console.log(`[server] Health check → http://localhost:${env.port}/api/health`)
    })

    // Periodic stale game cleanup (every 5 minutes)
    const expiryTimer = setInterval(async () => {
      try {
        const count = await expireStaleGames()
        if (count > 0) {
          console.log(`[game] Expired ${count} stale game(s)`)
        }
      } catch (err) {
        console.error('[game] Expiry cleanup error:', err)
      }
    }, EXPIRY_INTERVAL_MS)

    // ── Graceful shutdown ──────────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n[server] Received ${signal}. Shutting down gracefully...`)
      clearInterval(expiryTimer)
      server.close(async () => {
        await prisma.$disconnect()
        console.log('[db] Disconnected from PostgreSQL')
        console.log('[server] Server closed. Goodbye.')
        process.exit(0)
      })
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    console.error('[server] Failed to start:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

bootstrap()
