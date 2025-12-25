import { Request, Response } from 'express';
import compression from 'compression';

/**
 * Compression middleware options
 */
export interface CompressionOptions {
  level?: number; // 0-9, where 9 is maximum compression
  threshold?: number; // Minimum response size to compress (in bytes)
  filter?: (req: Request, res: Response) => boolean;
}

/**
 * Default compression filter
 * Only compress responses that are compressible
 */
function defaultFilter(req: Request, res: Response): boolean {
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Use compression's default filter
  return compression.filter(req, res);
}

/**
 * Filter to compress only JSON responses
 */
export function jsonOnlyFilter(_req: Request, res: Response): boolean {
  const contentType = res.getHeader('Content-Type');
  return typeof contentType === 'string' && contentType.includes('application/json');
}

/**
 * Filter to compress text-based responses
 */
export function textOnlyFilter(_req: Request, res: Response): boolean {
  const contentType = res.getHeader('Content-Type');
  if (typeof contentType !== 'string') {
    return false;
  }

  return (
    contentType.includes('text/') ||
    contentType.includes('application/json') ||
    contentType.includes('application/javascript') ||
    contentType.includes('application/xml')
  );
}

/**
 * Compression middleware factory
 * Returns configured compression middleware
 */
export function compressionMiddleware(options: CompressionOptions = {}) {
  const {
    level = 6,
    threshold = 1024, // 1KB default
    filter = defaultFilter,
  } = options;

  return compression({
    level,
    threshold,
    filter,
  });
}

/**
 * Default compression middleware
 * Uses standard compression settings
 */
export const defaultCompression = compressionMiddleware();

/**
 * Aggressive compression middleware
 * Maximum compression level for bandwidth-sensitive scenarios
 */
export const aggressiveCompression = compressionMiddleware({
  level: 9,
  threshold: 512, // 512 bytes
});

/**
 * Light compression middleware
 * Faster compression for CPU-sensitive scenarios
 */
export const lightCompression = compressionMiddleware({
  level: 3,
  threshold: 2048, // 2KB
});

/**
 * JSON-only compression middleware
 * Only compresses JSON responses
 */
export const jsonCompression = compressionMiddleware({
  level: 6,
  threshold: 1024,
  filter: jsonOnlyFilter,
});
