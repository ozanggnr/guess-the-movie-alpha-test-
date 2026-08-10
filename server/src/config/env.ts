import 'dotenv/config'

/**
 * Validated environment configuration.
 * Throws at startup if required variables are missing in production.
 */

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || ''
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: requireEnv('DATABASE_URL'),
  youtubeApiKey: requireEnv('YOUTUBE_API_KEY'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development'
  },
  get isProduction(): boolean {
    return this.nodeEnv === 'production'
  },
} as const
