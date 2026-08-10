import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/gameErrors'

/**
 * Global Express error handler.
 * Handles both typed AppErrors (operational) and unexpected errors.
 * Must be the last middleware registered in app.ts.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Typed operational errors (ValidationError, NotFoundError, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      statusCode: err.statusCode,
    })
    return
  }

  // Unexpected errors — don't leak internals in production
  const isDev = process.env.NODE_ENV === 'development'
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err)

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred',
    statusCode: 500,
    ...(isDev && { stack: err.stack }),
  })
}

// Re-export AppError interface for backwards compatibility with existing consumers
export type { AppError }
