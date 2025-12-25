import { Router } from 'express';
import {
  register,
  login,
  me,
  refresh,
  logout
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// POST /api/auth/register - Register new user
router.post('/register', asyncHandler(register));

// POST /api/auth/login - Login user
router.post('/login', asyncHandler(login));

/**
 * Protected routes (authentication required)
 */

// GET /api/auth/me - Get current user profile
router.get('/me', asyncHandler(authenticate), asyncHandler(me));

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', asyncHandler(refresh));

// POST /api/auth/logout - Logout user (optional, for client-side token removal)
router.post('/logout', asyncHandler(logout));

export default router;
