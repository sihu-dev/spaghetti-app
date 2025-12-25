import { Request, Response, NextFunction } from 'express';
import { register, login, refreshAccessToken, logout, getUserResponseById } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { asyncHandler } from '../middleware/errorHandler';
import { Errors } from '../utils/errors';

interface SuccessResponse<T> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

function createSuccessResponse<T>(data: T, requestId?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * POST /api/auth/register
 * Register a new user
 */
export const registerUser = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const validatedInput = registerSchema.parse(req.body);
  const result = await register(validatedInput);

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(201).json(createSuccessResponse(result, requestId));
});

/**
 * POST /api/auth/login
 * Login user
 */
export const loginUser = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const validatedInput = loginSchema.parse(req.body);
  const result = await login(validatedInput);

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(200).json(createSuccessResponse(result, requestId));
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const validatedInput = refreshTokenSchema.parse(req.body);
  const result = await refreshAccessToken(validatedInput.refreshToken);

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(200).json(createSuccessResponse(result, requestId));
});

/**
 * POST /api/auth/logout
 * Logout user
 */
export const logoutUser = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    logout(refreshToken);
  }

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(200).json(createSuccessResponse({ message: 'Logged out successfully' }, requestId));
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getCurrentUser = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    throw Errors.unauthorized('Not authenticated');
  }

  const user = getUserResponseById(req.userId);

  if (!user) {
    throw Errors.notFound('User');
  }

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(200).json(createSuccessResponse(user, requestId));
});
