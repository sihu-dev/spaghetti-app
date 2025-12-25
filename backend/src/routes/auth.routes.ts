import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (with stricter rate limiting)
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logoutUser);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
