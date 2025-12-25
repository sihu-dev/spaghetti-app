import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  ErrorResponse,
} from '../../middleware/errorHandler';
import { AppError, ErrorCode, Errors } from '../../utils/errors';

// Mock Express objects
const createMockRequest = (
  headers?: Record<string, string>,
  method = 'GET',
  path = '/test'
): Partial<Request> => ({
  headers: headers || {},
  method,
  path,
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('Error Handler Middleware', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'));
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  describe('errorHandler', () => {
    describe('AppError handling', () => {
      it('should handle AppError with 400 status code', () => {
        const error = Errors.badRequest('Invalid input data', {
          field: 'email',
          reason: 'invalid format',
        });
        const mockReq = createMockRequest({ 'x-request-id': 'req-123' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid input data',
            details: {
              field: 'email',
              reason: 'invalid format',
            },
          },
          requestId: 'req-123',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should handle AppError with 401 unauthorized', () => {
        const error = Errors.unauthorized('Token expired');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Token expired',
            details: undefined,
          },
          requestId: undefined,
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should handle AppError with 403 forbidden', () => {
        const error = Errors.forbidden('Insufficient permissions');
        const mockReq = createMockRequest({ 'x-request-id': 'test-req' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.FORBIDDEN,
            message: 'Insufficient permissions',
            details: undefined,
          },
          requestId: 'test-req',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should handle AppError with 404 not found', () => {
        const error = Errors.notFound('User with ID 123');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'User with ID 123 not found',
            details: undefined,
          },
          requestId: undefined,
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should handle AppError with 500 internal error', () => {
        const error = Errors.internal('Database connection failed');
        const mockReq = createMockRequest({ 'x-request-id': 'internal-error-req' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Database connection failed',
            details: undefined,
          },
          requestId: 'internal-error-req',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[CRITICAL ERROR]',
          expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Database connection failed',
            requestId: 'internal-error-req',
            timestamp: '2024-01-15T10:30:00.000Z',
          })
        );
      });

      it('should log critical errors for non-operational AppErrors', () => {
        const error = new AppError(
          ErrorCode.INTERNAL_ERROR,
          'Critical system failure',
          500,
          false // non-operational
        );
        const mockReq = createMockRequest({ 'x-request-id': 'critical-123' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[CRITICAL ERROR]',
          expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Critical system failure',
            requestId: 'critical-123',
            timestamp: '2024-01-15T10:30:00.000Z',
          })
        );
      });

      it('should not log errors for operational AppErrors', () => {
        const error = Errors.badRequest('Invalid email format');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should handle AppError without request ID', () => {
        const error = Errors.notFound('Resource');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0];
        expect(response.requestId).toBeUndefined();
      });
    });

    describe('ZodError handling', () => {
      it('should handle ZodError with single validation error', () => {
        const schema = z.object({
          email: z.string().email(),
        });

        let zodError: ZodError | null = null;
        try {
          schema.parse({ email: 'invalid-email' });
        } catch (error) {
          zodError = error as ZodError;
        }

        const mockReq = createMockRequest({ 'x-request-id': 'zod-123' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: {
              fields: {
                email: ['Invalid email'],
              },
            },
          },
          requestId: 'zod-123',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should handle ZodError with multiple validation errors', () => {
        const schema = z.object({
          email: z.string().email(),
          age: z.number().min(18),
          name: z.string().min(2),
        });

        let zodError: ZodError | null = null;
        try {
          schema.parse({ email: 'bad', age: 15, name: 'A' });
        } catch (error) {
          zodError = error as ZodError;
        }

        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.error.details?.fields).toBeDefined();
        expect(Object.keys(response.error.details!.fields as object).length).toBeGreaterThan(1);
      });

      it('should handle ZodError with nested path', () => {
        const schema = z.object({
          user: z.object({
            profile: z.object({
              email: z.string().email(),
            }),
          }),
        });

        let zodError: ZodError | null = null;
        try {
          schema.parse({ user: { profile: { email: 'invalid' } } });
        } catch (error) {
          zodError = error as ZodError;
        }

        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        const fields = response.error.details?.fields as Record<string, string[]>;
        expect(fields['user.profile.email']).toBeDefined();
      });

      it('should handle ZodError with empty path (root-level error)', () => {
        const schema = z.string();

        let zodError: ZodError | null = null;
        try {
          schema.parse(123); // Invalid type at root level
        } catch (error) {
          zodError = error as ZodError;
        }

        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        const fields = response.error.details?.fields as Record<string, string[]>;
        expect(fields['root']).toBeDefined();
        expect(fields['root'][0]).toContain('Expected string');
      });
    });

    describe('Unknown error handling', () => {
      it('should handle standard Error in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Something went wrong');
        const mockReq = createMockRequest({ 'x-request-id': 'unknown-123' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Something went wrong',
          },
          requestId: 'unknown-123',
          timestamp: '2024-01-15T10:30:00.000Z',
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[UNHANDLED ERROR]',
          expect.objectContaining({
            name: 'Error',
            message: 'Something went wrong',
            requestId: 'unknown-123',
            timestamp: '2024-01-15T10:30:00.000Z',
          })
        );
      });

      it('should handle standard Error in production mode with generic message', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Internal database error');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
          },
          requestId: undefined,
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should log unknown errors with stack trace', () => {
        const error = new Error('Unexpected error');
        error.stack = 'Error: Unexpected error\n    at Test.fn';
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[UNHANDLED ERROR]',
          expect.objectContaining({
            stack: expect.stringContaining('Error: Unexpected error'),
          })
        );
      });

      it('should handle TypeError', () => {
        const error = new TypeError('Cannot read property of undefined');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[UNHANDLED ERROR]',
          expect.objectContaining({
            name: 'TypeError',
          })
        );
      });

      it('should handle ReferenceError', () => {
        const error = new ReferenceError('Variable is not defined');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[UNHANDLED ERROR]',
          expect.objectContaining({
            name: 'ReferenceError',
          })
        );
      });
    });

    describe('Request ID and timestamp handling', () => {
      it('should include request ID when provided', () => {
        const error = Errors.badRequest('Test error');
        const mockReq = createMockRequest({ 'x-request-id': 'custom-request-id' });
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.requestId).toBe('custom-request-id');
      });

      it('should not include request ID when not provided', () => {
        const error = Errors.badRequest('Test error');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.requestId).toBeUndefined();
      });

      it('should include ISO timestamp', () => {
        const error = Errors.badRequest('Test error');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const response = (mockRes.json as jest.Mock).mock.calls[0][0] as ErrorResponse;
        expect(response.timestamp).toBe('2024-01-15T10:30:00.000Z');
      });
    });

    describe('Domain-specific errors', () => {
      it('should handle SSRF blocked error', () => {
        const error = Errors.ssrfBlocked('http://localhost:3000/admin');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: ErrorCode.SSRF_BLOCKED,
            message: 'Request to this URL is not allowed',
            details: {
              blockedUrl: 'http://localhost:3000/admin',
            },
          },
          requestId: undefined,
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should handle invalid image error', () => {
        const error = Errors.invalidImage('Unsupported format');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: ErrorCode.INVALID_IMAGE,
              message: 'Invalid image: Unsupported format',
            }),
          })
        );
      });

      it('should handle theme extraction failed error', () => {
        const error = Errors.themeExtractionFailed('AI service unavailable');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: ErrorCode.THEME_EXTRACTION_FAILED,
            }),
          })
        );
      });

      it('should handle template not found error', () => {
        const error = Errors.templateNotFound('template-123');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: ErrorCode.TEMPLATE_NOT_FOUND,
              message: 'Template not found: template-123',
            }),
          })
        );
      });

      it('should handle assembly generation failed error', () => {
        const error = Errors.assemblyFailed('Invalid template data');
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: ErrorCode.ASSEMBLY_GENERATION_FAILED,
            }),
          })
        );
      });
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async operation failed');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should catch AppError and pass to next', async () => {
      const error = Errors.unauthorized();
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle promise that throws synchronously', async () => {
      const error = new Error('Sync error in async function');
      const asyncFn = async () => {
        throw error;
      };
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should preserve function context', async () => {
      const asyncFn = async (req: Request, res: Response, _next: NextFunction) => {
        expect(req).toBeDefined();
        expect(res).toBeDefined();
        return 'result';
      };
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle async function with no return value', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);
      const mockReq = createMockRequest() as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should create not found error for GET request', () => {
      const mockReq = createMockRequest({}, 'GET', '/api/users/123') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ErrorCode.NOT_FOUND,
          message: 'Route GET /api/users/123 not found',
          statusCode: 404,
        })
      );
    });

    it('should create not found error for POST request', () => {
      const mockReq = createMockRequest({}, 'POST', '/api/products') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route POST /api/products not found',
        })
      );
    });

    it('should create not found error for DELETE request', () => {
      const mockReq = createMockRequest({}, 'DELETE', '/api/items/456') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route DELETE /api/items/456 not found',
        })
      );
    });

    it('should create not found error for PUT request', () => {
      const mockReq = createMockRequest({}, 'PUT', '/api/settings') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route PUT /api/settings not found',
        })
      );
    });

    it('should create not found error for PATCH request', () => {
      const mockReq = createMockRequest({}, 'PATCH', '/api/users/update') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route PATCH /api/users/update not found',
        })
      );
    });

    it('should pass AppError instance to next', () => {
      const mockReq = createMockRequest({}, 'GET', '/unknown') as Request;
      const mockRes = createMockResponse() as Response;
      const mockNext = createMockNext();

      notFoundHandler(mockReq, mockRes, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });
});
