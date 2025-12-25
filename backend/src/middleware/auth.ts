import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, getUserById } from '../services/auth.service';
import { Errors } from '../utils/errors';
import { User } from '../schemas/auth.schema';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw Errors.unauthorized('No authorization header provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw Errors.unauthorized('Invalid authorization header format');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw Errors.unauthorized('No token provided');
    }

    const payload = verifyAccessToken(token);
    const user = getUserById(payload.userId);

    if (!user) {
      throw Errors.unauthorized('User not found');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if not
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);
    const user = getUserById(payload.userId);

    if (user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...allowedRoles: ('user' | 'admin')[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(Errors.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(Errors.forbidden('Insufficient permissions'));
    }

    next();
  };
}
