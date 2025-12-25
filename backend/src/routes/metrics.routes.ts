import { Router, Request, Response } from 'express';
import { register } from '../utils/metrics';

const router = Router();

/**
 * GET /metrics
 * Prometheus metrics endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error instanceof Error ? error.message : 'Unknown error');
  }
});

export default router;
