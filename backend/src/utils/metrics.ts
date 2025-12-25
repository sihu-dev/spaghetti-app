import client from 'prom-client';

// Create a Registry to register metrics
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics

/**
 * HTTP request counter
 */
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * HTTP request duration histogram
 */
export const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

/**
 * Active connections gauge
 */
export const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

/**
 * Authentication metrics
 */
export const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'success'],
  registers: [register],
});

/**
 * Theme extraction metrics
 */
export const themeExtractionDuration = new client.Histogram({
  name: 'theme_extraction_duration_ms',
  help: 'Duration of theme extraction in milliseconds',
  buckets: [100, 500, 1000, 2500, 5000, 10000, 30000],
  registers: [register],
});

export const themeExtractionTotal = new client.Counter({
  name: 'theme_extraction_total',
  help: 'Total number of theme extractions',
  labelNames: ['success'],
  registers: [register],
});

/**
 * Error counter
 */
export const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'],
  registers: [register],
});

/**
 * Rate limit hits
 */
export const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
  registers: [register],
});

export default {
  register,
  httpRequestsTotal,
  httpRequestDurationMs,
  activeConnections,
  authAttempts,
  themeExtractionDuration,
  themeExtractionTotal,
  errorsTotal,
  rateLimitHits,
};
