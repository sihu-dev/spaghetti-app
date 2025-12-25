import { Request, Response, NextFunction } from 'express';
import { logger, createRequestLogger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}`;

  // Create child logger with request context
  const reqLogger = createRequestLogger({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log request start
  reqLogger.info('Request started');

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    reqLogger[level]({
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    }, 'Request completed');
  });

  // Capture response error
  res.on('error', (error) => {
    reqLogger.error({
      error: error.message,
      stack: error.stack,
    }, 'Request error');
  });

  next();
}

// Performance logging middleware
export function performanceLogger(threshold: number = 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > threshold) {
        logger.warn({
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
        }, 'Slow request detected');
      }
    });

    next();
  };
}
