import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import router from './routes'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

const app = express()

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'))

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', router)

// ─── 404 & Error handlers (must be last) ─────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
