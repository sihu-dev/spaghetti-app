import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Encode HTML entities to prevent XSS
 */
function encodeHtmlEntities(str: string): string {
  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Recursively sanitize object values
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove null bytes
    let sanitized = value.replace(/\0/g, '');
    // Encode HTML entities
    sanitized = encodeHtmlEntities(sanitized);
    // Trim whitespace
    sanitized = sanitized.trim();
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Sanitize the key as well
      const sanitizedKey = encodeHtmlEntities(key);
      sanitized[sanitizedKey] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
}

/**
 * Input sanitization middleware
 * Sanitizes request body, query, and params to prevent XSS
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as typeof req.query;
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as typeof req.params;
  }

  next();
}

/**
 * Selective sanitization - only sanitize specific fields
 */
export function sanitizeFields(...fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      const body = req.body as Record<string, unknown>;
      for (const field of fields) {
        const value = body[field];
        if (field in body && typeof value === 'string') {
          body[field] = encodeHtmlEntities(value.trim());
        }
      }
    }
    next();
  };
}

/**
 * SQL injection prevention - basic pattern detection
 * Note: This is a basic check. Always use parameterized queries!
 */
export function detectSqlInjection(value: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(-{2}|\/\*|\*\/|;)/,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
    /'\s*(OR|AND)\s+'/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(value));
}

/**
 * Middleware to log potential SQL injection attempts
 */
export function sqlInjectionDetector(req: Request, _res: Response, next: NextFunction): void {
  const checkValue = (value: unknown, path: string): void => {
    if (typeof value === 'string' && detectSqlInjection(value)) {
      logger.warn({
        path,
        value: value.substring(0, 100), // Log only first 100 chars
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }, 'Potential SQL injection attempt detected');
    }

    if (Array.isArray(value)) {
      value.forEach((v, i) => checkValue(v, `${path}[${i}]`));
    } else if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => checkValue(v, `${path}.${k}`));
    }
  };

  if (req.body) checkValue(req.body, 'body');
  if (req.query) checkValue(req.query, 'query');
  if (req.params) checkValue(req.params, 'params');

  next();
}
