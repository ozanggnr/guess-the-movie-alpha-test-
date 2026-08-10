import { Router } from 'express'
import { healthCheck } from '../controllers/health.controller'

const router = Router()

/**
 * @route  GET /api/health
 * @desc   Health check — used by Railway and load balancers
 * @access Public
 */
router.get('/', healthCheck)

export default router
