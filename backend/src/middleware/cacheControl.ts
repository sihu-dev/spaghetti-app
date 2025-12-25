import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Cache control middleware options
 */
interface CacheOptions {
  maxAge?: number; // seconds
  private?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

/**
 * Generate ETag for response body
 */
function generateETag(body: string | Buffer): string {
  const hash = crypto.createHash('md5').update(body).digest('hex');
  return `"${hash}"`;
}

/**
 * No cache middleware - for dynamic/sensitive routes
 */
export function noCache(_req: Request, res: Response, next: NextFunction): void {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  next();
}

/**
 * Private cache middleware - for authenticated user-specific content
 */
export function privateCache(maxAge: number = 60) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.set({
      'Cache-Control': `private, max-age=${maxAge}, must-revalidate`,
    });
    next();
  };
}

/**
 * Public cache middleware - for static/public content
 */
export function publicCache(maxAge: number = 3600) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
    });
    next();
  };
}

/**
 * Configurable cache control middleware
 */
export function cacheControl(options: CacheOptions) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const directives: string[] = [];

    if (options.noStore) {
      directives.push('no-store');
    } else {
      directives.push(options.private ? 'private' : 'public');

      if (options.maxAge !== undefined) {
        directives.push(`max-age=${options.maxAge}`);
      }

      if (options.mustRevalidate) {
        directives.push('must-revalidate');
      }
    }

    res.set('Cache-Control', directives.join(', '));
    next();
  };
}

/**
 * ETag middleware - adds ETag header and handles conditional requests
 */
export function etag() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      const bodyString = JSON.stringify(body);
      const etagValue = generateETag(bodyString);

      res.set('ETag', etagValue);

      // Check If-None-Match header for conditional requests
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etagValue) {
        return res.status(304).end();
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Security headers for API responses
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
}
