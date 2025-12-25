import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCode, Errors } from '../utils/errors';

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
  timestamp: string;
}

function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] as string | undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = Errors.validationError('Validation failed', {
      fields: formatZodError(err),
    });

    const response: ErrorResponse = {
      success: false,
      error: {
        code: validationError.code,
        message: validationError.message,
        details: validationError.details,
      },
      requestId,
      timestamp,
    };

    res.status(400).json(response);
    return;
  }

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    // Log non-operational errors (programming errors)
    if (!err.isOperational) {
      console.error('[CRITICAL ERROR]', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        requestId,
        timestamp,
      });
    }

    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      requestId,
      timestamp,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  console.error('[UNHANDLED ERROR]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    requestId,
    timestamp,
  });

  const response: ErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
    requestId,
    timestamp,
  };

  res.status(500).json(response);
}

// Async handler wrapper to catch promise rejections
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(Errors.notFound(`Route ${req.method} ${req.path}`));
}
