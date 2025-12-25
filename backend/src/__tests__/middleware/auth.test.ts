import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, authorize } from '../../middleware/auth';
import * as authService from '../../services/auth.service';
import { User } from '../../schemas/auth.schema';

// Mock the auth service
jest.mock('../../services/auth.service');

// Mock Express objects
const createMockRequest = (
  authHeader?: string
): Partial<Request> => ({
  headers: authHeader ? { authorization: authHeader } : {},
  user: undefined,
  userId: undefined,
});

const createMockResponse = (): Partial<Response> => ({});

describe('Auth Middleware', () => {
  let mockNext: NextFunction;
  let mockVerifyAccessToken: jest.MockedFunction<typeof authService.verifyAccessToken>;
  let mockGetUserById: jest.MockedFunction<typeof authService.getUserById>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockAdminUser: User = {
    id: 'admin-456',
    email: 'admin@example.com',
    password: 'hashed-password',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockNext = jest.fn();
    mockVerifyAccessToken = authService.verifyAccessToken as jest.MockedFunction<typeof authService.verifyAccessToken>;
    mockGetUserById = authService.getUserById as jest.MockedFunction<typeof authService.getUserById>;
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    describe('with valid token', () => {
      it('should attach user and userId to request and call next()', () => {
        const mockReq = createMockRequest('Bearer valid-token-123');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockReturnValue({
          userId: 'user-123',
          email: 'test@example.com',
          role: 'user',
        });
        mockGetUserById.mockReturnValue(mockUser);

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token-123');
        expect(mockGetUserById).toHaveBeenCalledWith('user-123');
        expect(mockReq.user).toEqual(mockUser);
        expect(mockReq.userId).toBe('user-123');
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should work with different user roles', () => {
        const mockReq = createMockRequest('Bearer admin-token-456');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockReturnValue({
          userId: 'admin-456',
          email: 'admin@example.com',
          role: 'admin',
        });
        mockGetUserById.mockReturnValue(mockAdminUser);

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual(mockAdminUser);
        expect(mockReq.user?.role).toBe('admin');
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('with missing token', () => {
      it('should call next with unauthorized error when no authorization header', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'No authorization header provided',
            statusCode: 401,
          })
        );
        expect(mockReq.user).toBeUndefined();
        expect(mockReq.userId).toBeUndefined();
      });

      it('should call next with unauthorized error when token is empty', () => {
        const mockReq = createMockRequest('Bearer ');
        const mockRes = createMockResponse();

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'No token provided',
            statusCode: 401,
          })
        );
      });
    });

    describe('with invalid token', () => {
      it('should call next with error when token verification fails', () => {
        const mockReq = createMockRequest('Bearer invalid-token');
        const mockRes = createMockResponse();

        const tokenError = new Error('Invalid token');
        mockVerifyAccessToken.mockImplementation(() => {
          throw tokenError;
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid-token');
        expect(mockNext).toHaveBeenCalledWith(tokenError);
        expect(mockReq.user).toBeUndefined();
      });

      it('should call next with error when token is expired', () => {
        const mockReq = createMockRequest('Bearer expired-token');
        const mockRes = createMockResponse();

        const expiredError = new Error('Token expired');
        mockVerifyAccessToken.mockImplementation(() => {
          throw expiredError;
        });

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expiredError);
      });

      it('should call next with unauthorized error when user not found', () => {
        const mockReq = createMockRequest('Bearer valid-token-deleted-user');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockReturnValue({
          userId: 'deleted-user-123',
          email: 'deleted@example.com',
          role: 'user',
        });
        mockGetUserById.mockReturnValue(null);

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockGetUserById).toHaveBeenCalledWith('deleted-user-123');
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'User not found',
            statusCode: 401,
          })
        );
        expect(mockReq.user).toBeUndefined();
      });
    });

    describe('with malformed header', () => {
      it('should call next with error when authorization header does not start with "Bearer "', () => {
        const mockReq = createMockRequest('Basic dXNlcjpwYXNz');
        const mockRes = createMockResponse();

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Invalid authorization header format',
            statusCode: 401,
          })
        );
        expect(mockVerifyAccessToken).not.toHaveBeenCalled();
      });

      it('should call next with error when authorization header has wrong case', () => {
        const mockReq = createMockRequest('bearer token-123');
        const mockRes = createMockResponse();

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Invalid authorization header format',
            statusCode: 401,
          })
        );
      });

      it('should call next with error when authorization header is just a token without Bearer', () => {
        const mockReq = createMockRequest('just-a-token');
        const mockRes = createMockResponse();

        authenticate(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Invalid authorization header format',
            statusCode: 401,
          })
        );
      });
    });
  });

  describe('optionalAuth', () => {
    describe('with valid token', () => {
      it('should attach user and userId to request when token is valid', () => {
        const mockReq = createMockRequest('Bearer valid-token-123');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockReturnValue({
          userId: 'user-123',
          email: 'test@example.com',
          role: 'user',
        });
        mockGetUserById.mockReturnValue(mockUser);

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token-123');
        expect(mockGetUserById).toHaveBeenCalledWith('user-123');
        expect(mockReq.user).toEqual(mockUser);
        expect(mockReq.userId).toBe('user-123');
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('with missing token', () => {
      it('should call next without error when no authorization header', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).not.toHaveBeenCalled();
        expect(mockGetUserById).not.toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
        expect(mockReq.userId).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next without error when token is empty', () => {
        const mockReq = createMockRequest('Bearer ');
        const mockRes = createMockResponse();

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).not.toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('with invalid token', () => {
      it('should call next without error when token verification fails', () => {
        const mockReq = createMockRequest('Bearer invalid-token');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).toHaveBeenCalledWith('invalid-token');
        expect(mockReq.user).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should not attach user when user is not found', () => {
        const mockReq = createMockRequest('Bearer valid-token-deleted-user');
        const mockRes = createMockResponse();

        mockVerifyAccessToken.mockReturnValue({
          userId: 'deleted-user-123',
          email: 'deleted@example.com',
          role: 'user',
        });
        mockGetUserById.mockReturnValue(null);

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockGetUserById).toHaveBeenCalledWith('deleted-user-123');
        expect(mockReq.user).toBeUndefined();
        expect(mockReq.userId).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('with malformed header', () => {
      it('should call next without error when authorization header does not start with "Bearer "', () => {
        const mockReq = createMockRequest('Basic dXNlcjpwYXNz');
        const mockRes = createMockResponse();

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).not.toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next without error when authorization header is just a token', () => {
        const mockReq = createMockRequest('just-a-token');
        const mockRes = createMockResponse();

        optionalAuth(mockReq as Request, mockRes as Response, mockNext);

        expect(mockVerifyAccessToken).not.toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
        expect(mockNext).toHaveBeenCalledWith();
      });
    });
  });

  describe('authorize (requireRole)', () => {
    describe('for user role', () => {
      it('should call next when user has required role', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockUser;
        const mockRes = createMockResponse();

        const middleware = authorize('user');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next with forbidden error when user is admin but only user is allowed', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockAdminUser;
        const mockRes = createMockResponse();

        const middleware = authorize('user');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            statusCode: 403,
          })
        );
      });
    });

    describe('for admin role', () => {
      it('should call next when user is admin', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockAdminUser;
        const mockRes = createMockResponse();

        const middleware = authorize('admin');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next with forbidden error when user is not admin', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockUser;
        const mockRes = createMockResponse();

        const middleware = authorize('admin');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            statusCode: 403,
          })
        );
      });
    });

    describe('for multiple roles', () => {
      it('should call next when user has one of the allowed roles (user)', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockUser;
        const mockRes = createMockResponse();

        const middleware = authorize('user', 'admin');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should call next when user has one of the allowed roles (admin)', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = mockAdminUser;
        const mockRes = createMockResponse();

        const middleware = authorize('user', 'admin');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('without authenticated user', () => {
      it('should call next with unauthorized error when user is not authenticated', () => {
        const mockReq = createMockRequest() as Request;
        const mockRes = createMockResponse();

        const middleware = authorize('user');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401,
          })
        );
      });

      it('should call next with unauthorized error when user is undefined', () => {
        const mockReq = createMockRequest() as Request;
        mockReq.user = undefined;
        const mockRes = createMockResponse();

        const middleware = authorize('admin');
        middleware(mockReq, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            statusCode: 401,
          })
        );
      });
    });
  });
});
