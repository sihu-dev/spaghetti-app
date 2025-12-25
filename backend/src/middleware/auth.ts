import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../services/auth.service';
import { ApiError } from './errorHandler';

/**
 * Extract token from Authorization header
 * Supports "Bearer <token>" format
 */
function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authentication middleware - requires valid JWT token
 * Attaches user payload to request.user
 *
 * Usage:
 * router.get('/protected', authenticate, controller)
 */
export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      throw ApiError.unauthorized(
        'No token provided. Please include Authorization header with Bearer token',
        'NO_TOKEN'
      );
    }

    // Verify token and extract payload
    const payload = verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    // If error is already an ApiError, pass it through
    if (error instanceof ApiError) {
      next(error);
    } else {
      // Otherwise, create a generic unauthorized error
      next(ApiError.unauthorized('Authentication failed', 'AUTH_FAILED'));
    }
  }
}

/**
 * Optional authentication middleware - doesn't require token but attaches user if present
 * Useful for routes that work both authenticated and unauthenticated
 *
 * Usage:
 * router.get('/public-or-private', optionalAuthenticate, controller)
 *
 * In controller:
 * if (req.user) {
 *   // User is authenticated
 * } else {
 *   // User is not authenticated
 * }
 */
export function optionalAuthenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      // Token exists, try to verify it
      const payload = verifyToken(token);
      req.user = payload;
    }
    // No token is fine for optional auth
    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    // Just proceed without user
    next();
  }
}

/**
 * Check if user is authenticated (helper for use in controllers)
 */
export function isAuthenticated(req: AuthRequest): boolean {
  return !!req.user;
}

/**
 * Get authenticated user from request (helper for use in controllers)
 * Throws error if user is not authenticated
 */
export function getAuthenticatedUser(req: AuthRequest) {
  if (!req.user) {
    throw ApiError.unauthorized('User is not authenticated', 'NOT_AUTHENTICATED');
  }
  return req.user;
}
