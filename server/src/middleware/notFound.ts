import { Request, Response } from 'express'

/**
 * 404 Not Found handler.
 * Registered after all routes — catches unmatched requests.
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  })
}
