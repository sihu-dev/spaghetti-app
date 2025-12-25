import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /metrics
 * Prometheus metrics endpoint
 */
router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}));

export default router;
