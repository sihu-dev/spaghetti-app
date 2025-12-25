import { Router } from 'express';
import authRoutes from '../auth.routes';
import themeRoutes from '../theme.routes';
import { noCache } from '../../middleware/cacheControl';

const router = Router();

/**
 * API v1 Routes
 *
 * All routes are prefixed with /api/v1
 */

// Auth routes (no cache for security)
router.use('/auth', noCache, authRoutes);

// Theme extraction routes
router.use('/theme', themeRoutes);

export default router;
