import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterInput, LoginInput, UserResponse, AuthResponse } from '../schemas/auth.schema';
import { Errors } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// In-memory user storage (replace with database in production)
const users = new Map<string, User>();
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// JWT configuration - using validated environment variables
const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const ACCESS_TOKEN_EXPIRES_SECONDS = 15 * 60; // 15 minutes

interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate access and refresh tokens
 */
function generateTokens(user: User): { accessToken: string; refreshToken: string; expiresIn: number } {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Add jti (JWT ID) to make each token unique even if generated at same timestamp
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    jwtid: uuidv4(),
  });
  const refreshToken = jwt.sign(
    { userId: user.id, jti: uuidv4() },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  refreshTokens.set(refreshToken, { userId: user.id, expiresAt });

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
  };
}

/**
 * Convert User to UserResponse (without password)
 */
function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, name } = input;

  // Check if user already exists
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    throw Errors.badRequest('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user: User = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    name,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  logger.info({ userId: user.id, email: user.email }, 'User registered');

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: toUserResponse(user),
    ...tokens,
  };
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user by email
  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user) {
    throw Errors.unauthorized('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw Errors.unauthorized('Invalid email or password');
  }

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user: toUserResponse(user),
    ...tokens,
  };
}

/**
 * Refresh access token
 */
export function refreshAccessToken(refreshToken: string): AuthResponse {
  const storedToken = refreshTokens.get(refreshToken);

  if (!storedToken) {
    throw Errors.unauthorized('Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    refreshTokens.delete(refreshToken);
    throw Errors.unauthorized('Refresh token expired');
  }

  const user = users.get(storedToken.userId);
  if (!user) {
    throw Errors.unauthorized('User not found');
  }

  // Invalidate old refresh token
  refreshTokens.delete(refreshToken);

  // Generate new tokens
  const tokens = generateTokens(user);

  return {
    user: toUserResponse(user),
    ...tokens,
  };
}

/**
 * Logout user (invalidate refresh token)
 */
export function logout(refreshToken: string): void {
  refreshTokens.delete(refreshToken);
}

/**
 * Verify access token and return payload
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw Errors.unauthorized('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw Errors.unauthorized('Invalid access token');
    }
    throw error;
  }
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | null {
  return users.get(userId) || null;
}

/**
 * Get user response by ID
 */
export function getUserResponseById(userId: string): UserResponse | null {
  const user = users.get(userId);
  return user ? toUserResponse(user) : null;
}
