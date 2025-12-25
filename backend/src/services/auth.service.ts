import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, TokenPayload, RegisterData, LoginCredentials } from '../types';
import { ApiError } from '../middleware/errorHandler';

// In-memory user storage (replace with database in production)
const users: Map<string, User> = new Map();

/**
 * JWT configuration
 */
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
    }
    throw ApiError.unauthorized('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<User> {
  const { email, username, password } = data;

  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists', 'USER_EXISTS');
  }

  // Check if username is taken
  const existingUsername = findUserByUsername(username);
  if (existingUsername) {
    throw ApiError.badRequest('Username is already taken', 'USERNAME_TAKEN');
  }

  // Validate password strength
  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters', 'WEAK_PASSWORD');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user: User = {
    id: generateUserId(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Store user
  users.set(user.id, user);

  return user;
}

/**
 * Authenticate user and return token
 */
export async function loginUser(credentials: LoginCredentials): Promise<{
  user: User;
  token: string;
}> {
  const { email, password } = credentials;

  // Find user by email
  const user = findUserByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate token
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };

  const token = generateToken(tokenPayload);

  return { user, token };
}

/**
 * Find user by ID
 */
export function findUserById(userId: string): User | undefined {
  return users.get(userId);
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find(user => user.email === email);
}

/**
 * Find user by username
 */
export function findUserByUsername(username: string): User | undefined {
  return Array.from(users.values()).find(user => user.username === username);
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const user = findUserById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  // Hash password if it's being updated
  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date()
  };

  users.set(userId, updatedUser);
  return updatedUser;
}

/**
 * Delete user
 */
export function deleteUser(userId: string): boolean {
  const user = findUserById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return users.delete(userId);
}

/**
 * Get all users (admin only - should be protected)
 */
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * Generate unique user ID
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Remove password from user object
 */
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}

/**
 * Refresh token
 */
export function refreshToken(oldToken: string): string {
  const payload = verifyToken(oldToken);

  // Generate new token with same payload
  const newTokenPayload: TokenPayload = {
    userId: payload.userId,
    email: payload.email,
    username: payload.username
  };

  return generateToken(newTokenPayload);
}
