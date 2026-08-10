import { Request, Response } from 'express'

/**
 * GET /api/health
 * Simple health check endpoint used by Railway and load balancers.
 */
export function healthCheck(_req: Request, res: Response): void {
  res.status(200).json({ status: 'ok' })
}
