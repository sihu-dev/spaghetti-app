import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class with status codes and error codes
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string, code: string = 'BAD_REQUEST'): ApiError {
    return new ApiError(message, 400, code);
  }

  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): ApiError {
    return new ApiError(message, 401, code);
  }

  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN'): ApiError {
    return new ApiError(message, 403, code);
  }

  /**
   * Create a 404 Not Found error
   */
  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): ApiError {
    return new ApiError(message, 404, code);
  }

  /**
   * Create a 422 Unprocessable Entity error
   */
  static validationError(message: string, code: string = 'VALIDATION_ERROR'): ApiError {
    return new ApiError(message, 422, code);
  }

  /**
   * Create a 500 Internal Server error
   */
  static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(message, 500, code);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.get('/path', asyncHandler(myAsyncController))
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * Must be used after all routes
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  // Check if error is an ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from express-validator)
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'MulterError') {
    // Handle Multer file upload errors
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    message = err.message;
  } else if (err.message) {
    // Generic error with message
    message = err.message;
  }

  // Log error for debugging (in production, use proper logging service)
  if (statusCode >= 500) {
    console.error('Server error:', {
      message: err.message,
      stack: err.stack,
      code,
      statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('Client error:', {
      message,
      code,
      statusCode,
      path: req.path,
      method: req.method
    });
  }

  // Send error response in consistent format
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    statusCode
  });
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Route ${req.method} ${req.path} not found`, 'ROUTE_NOT_FOUND');
  next(error);
};
