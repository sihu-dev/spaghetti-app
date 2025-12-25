import {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyAccessToken,
  getUserById,
  getUserResponseById,
} from '../../services/auth.service';
import { AppError, ErrorCode } from '../../utils/errors';

describe('Auth Service', () => {
  const testUser = {
    email: 'service-test@example.com',
    password: 'TestPassword123',
    name: 'Service Test User',
  };

  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const result = await register(testUser);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');

      expect(result.user.email).toBe(testUser.email);
      expect(result.user.name).toBe(testUser.name);
      expect(result.user.role).toBe('user');
      expect(result.user).not.toHaveProperty('password');

      userId = result.user.id;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
    });

    it('should hash the password', async () => {
      const user = getUserById(userId);
      expect(user).not.toBeNull();
      expect(user!.password).not.toBe(testUser.password);
      expect(user!.password.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    it('should throw error for duplicate email', async () => {
      await expect(register(testUser)).rejects.toThrow(AppError);
      await expect(register(testUser)).rejects.toMatchObject({
        code: ErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await login({
        email: testUser.email,
        password: testUser.password,
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(testUser.email);
    });

    it('should throw error for wrong password', async () => {
      await expect(
        login({ email: testUser.email, password: 'WrongPassword123' })
      ).rejects.toThrow(AppError);

      await expect(
        login({ email: testUser.email, password: 'WrongPassword123' })
      ).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        login({ email: 'nonexistent@example.com', password: 'Password123' })
      ).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const payload = verifyAccessToken(accessToken);

      expect(payload).toHaveProperty('userId', userId);
      expect(payload).toHaveProperty('email', testUser.email);
      expect(payload).toHaveProperty('role', 'user');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow(AppError);
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyAccessToken('')).toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const result = await refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).not.toBe(accessToken);
      expect(result.refreshToken).not.toBe(refreshToken);

      // Update for subsequent tests
      refreshToken = result.refreshToken;
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(refreshAccessToken('invalid-token')).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    });

    it('should throw error for used refresh token (after refresh)', async () => {
      // Capture the current token before refreshing
      const oldToken = refreshToken;

      // Refresh once to get new token - this should invalidate the old token
      const result = await refreshAccessToken(oldToken);
      refreshToken = result.refreshToken;

      // Old token should now be invalid (already used)
      await expect(refreshAccessToken(oldToken)).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token', async () => {
      logout(refreshToken);

      await expect(refreshAccessToken(refreshToken)).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
      });
    });

    it('should not throw for invalid token', () => {
      expect(() => logout('invalid-token')).not.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', () => {
      const user = getUserById(userId);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(userId);
      expect(user!.email).toBe(testUser.email);
    });

    it('should return null for non-existent id', () => {
      const user = getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserResponseById', () => {
    it('should return user response without password', () => {
      const user = getUserResponseById(userId);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(userId);
      expect(user!.email).toBe(testUser.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent id', () => {
      const user = getUserResponseById('non-existent-id');
      expect(user).toBeNull();
    });
  });
});
