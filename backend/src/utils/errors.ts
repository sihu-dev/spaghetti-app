export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // Domain Errors
  INVALID_IMAGE = 'INVALID_IMAGE',
  SSRF_BLOCKED = 'SSRF_BLOCKED',
  THEME_EXTRACTION_FAILED = 'THEME_EXTRACTION_FAILED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  ASSEMBLY_GENERATION_FAILED = 'ASSEMBLY_GENERATION_FAILED',
}

export interface AppErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  isOperational: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): AppErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      isOperational: this.isOperational,
    };
  }
}

// Factory functions for common errors
export const Errors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.BAD_REQUEST, message, 400, true, details),

  validationError: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, true, details),

  unauthorized: (message = 'Authentication required') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Access denied') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource = 'Resource') =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  rateLimitExceeded: () =>
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, 'Too many requests, please try again later', 429),

  internal: (message = 'Internal server error') =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500, false),

  externalApi: (service: string, message: string) =>
    new AppError(ErrorCode.EXTERNAL_API_ERROR, `${service}: ${message}`, 502),

  ssrfBlocked: (url: string) =>
    new AppError(ErrorCode.SSRF_BLOCKED, 'Request to this URL is not allowed', 400, true, { blockedUrl: url }),

  invalidImage: (reason: string) =>
    new AppError(ErrorCode.INVALID_IMAGE, `Invalid image: ${reason}`, 400),

  themeExtractionFailed: (reason: string) =>
    new AppError(ErrorCode.THEME_EXTRACTION_FAILED, `Theme extraction failed: ${reason}`, 500),

  templateNotFound: (id: string) =>
    new AppError(ErrorCode.TEMPLATE_NOT_FOUND, `Template not found: ${id}`, 404),

  assemblyFailed: (reason: string) =>
    new AppError(ErrorCode.ASSEMBLY_GENERATION_FAILED, `Assembly generation failed: ${reason}`, 500),
};
