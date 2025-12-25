import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  sanitizeUser,
  findUserById,
  refreshToken as refreshAuthToken
} from '../services/auth.service';
import { RegisterData, LoginCredentials, AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';

/**
 * Register a new user
 * POST /api/auth/register
 *
 * Body: { email, username, password }
 * Response: { user, token, expiresIn }
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, username, password } = req.body;

  // Validation
  if (!email || !username || !password) {
    throw ApiError.badRequest(
      'Email, username, and password are required',
      'MISSING_FIELDS'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ApiError.badRequest('Invalid email format', 'INVALID_EMAIL');
  }

  // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw ApiError.badRequest(
      'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
      'INVALID_USERNAME'
    );
  }

  const registerData: RegisterData = { email, username, password };
  const user = await registerUser(registerData);

  // Generate token
  const { token } = await loginUser({ email, password });

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token,
      expiresIn
    },
    message: 'User registered successfully'
  });
}

/**
 * Login user
 * POST /api/auth/login
 *
 * Body: { email, password }
 * Response: { user, token, expiresIn }
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required', 'MISSING_FIELDS');
  }

  const credentials: LoginCredentials = { email, password };
  const { user, token } = await loginUser(credentials);

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token,
      expiresIn
    },
    message: 'Login successful'
  });
}

/**
 * Get current user profile
 * GET /api/auth/me
 *
 * Headers: Authorization: Bearer <token>
 * Response: { user }
 */
export async function me(req: AuthRequest, res: Response): Promise<void> {
  // User is attached by authenticate middleware
  if (!req.user) {
    throw ApiError.unauthorized('User not authenticated', 'NOT_AUTHENTICATED');
  }

  const user = findUserById(req.user.userId);
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user)
    }
  });
}

/**
 * Refresh JWT token
 * POST /api/auth/refresh
 *
 * Headers: Authorization: Bearer <token>
 * Response: { token, expiresIn }
 */
export async function refresh(req: AuthRequest, res: Response): Promise<void> {
  // Extract token from header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw ApiError.unauthorized('No token provided', 'NO_TOKEN');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw ApiError.unauthorized('Invalid authorization header format', 'INVALID_AUTH_HEADER');
  }

  const oldToken = parts[1];
  const newToken = refreshAuthToken(oldToken);

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  res.status(200).json({
    success: true,
    data: {
      token: newToken,
      expiresIn
    },
    message: 'Token refreshed successfully'
  });
}

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 *
 * Note: Since we're using stateless JWT, logout is handled client-side
 * by removing the token. This endpoint is optional and just returns success.
 * In a production app with token blacklisting, you would add the token to a blacklist here.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
}
