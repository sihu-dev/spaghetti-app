import { Request, Response, NextFunction } from 'express';
import {
  httpRequestsTotal,
  httpRequestDurationMs,
  activeConnections,
} from '../utils/metrics';

/**
 * Middleware to collect HTTP metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();

  // Track active connections
  activeConnections.inc();

  // Normalize route for metrics (avoid high cardinality)
  const getRoute = (): string => {
    // Use the matched route pattern if available
    if (req.route?.path) {
      return req.baseUrl + req.route.path;
    }
    // Otherwise, normalize the path
    return normalizeRoute(req.path);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = getRoute();
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDurationMs.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration
    );

    activeConnections.dec();
  });

  res.on('close', () => {
    // Ensure we decrement if connection closes unexpectedly
    if (!res.writableEnded) {
      activeConnections.dec();
    }
  });

  next();
}

/**
 * Normalize route paths to avoid high cardinality
 * e.g., /api/users/123 -> /api/users/:id
 */
function normalizeRoute(path: string): string {
  return path
    // Replace UUIDs
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    // Replace numeric IDs
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    // Replace base64-like strings
    .replace(/\/[A-Za-z0-9_-]{20,}(?=\/|$)/g, '/:token');
}
