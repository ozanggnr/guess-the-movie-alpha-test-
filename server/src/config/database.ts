import { PrismaClient } from '@prisma/client'
import { env } from './env'

/**
 * Prisma client singleton.
 * Re-uses the same instance across hot reloads in development.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  })

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma
}

export default prisma
