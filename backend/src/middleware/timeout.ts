import { Request, Response, NextFunction } from 'express';
import { Errors } from '../utils/errors';

/**
 * Request timeout middleware
 * Automatically responds with 408 if request takes too long
 */
export function requestTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set timeout for the request
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        const error = Errors.internal('Request timeout');
        error.statusCode = 408;
        next(error);
      }
    });

    // Also set response timeout
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        const error = Errors.internal('Response timeout');
        error.statusCode = 408;
        next(error);
      }
    });

    next();
  };
}

/**
 * Slow request detector middleware
 * Logs warnings for requests that take longer than threshold
 */
export function slowRequestDetector(thresholdMs: number = 5000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        const logger = require('../utils/logger').logger;
        logger.warn({
          method: req.method,
          url: req.originalUrl,
          duration,
          threshold: thresholdMs,
        }, 'Slow request detected');
      }
    });

    next();
  };
}
