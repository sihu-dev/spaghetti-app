import { Router, Request, Response } from 'express';
import { publicCache } from '../middleware/cacheControl';

const router = Router();

// Track server start time
const serverStartTime = Date.now();

// Track readiness state
let isReady = true;

/**
 * Set server readiness state
 */
export function setReadiness(ready: boolean): void {
  isReady = ready;
}

/**
 * GET /health
 * Basic health check - always returns ok if server is running
 */
router.get('/', publicCache(10), (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * GET /health/live
 * Liveness probe - returns 200 if the server is running
 * Used by Kubernetes to determine if the container should be restarted
 */
router.get('/live', publicCache(5), (_req: Request, res: Response) => {
  res.json({
    status: 'alive',
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Readiness probe - returns 200 if the server is ready to accept traffic
 * Used by Kubernetes to determine if the pod should receive traffic
 */
router.get('/ready', publicCache(5), (_req: Request, res: Response) => {
  if (!isReady) {
    res.status(503).json({
      status: 'not_ready',
      message: 'Server is not ready to accept traffic',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Check critical dependencies here
  const checks = {
    memory: checkMemory(),
    eventLoop: checkEventLoop(),
  };

  const allHealthy = Object.values(checks).every(check => check.healthy);

  if (!allHealthy) {
    res.status(503).json({
      status: 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.json({
    status: 'ready',
    checks,
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/details
 * Detailed health information (should be protected in production)
 */
router.get('/details', (_req: Request, res: Response) => {
  const memUsage = process.memoryUsage();

  res.json({
    status: isReady ? 'healthy' : 'not_ready',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor((Date.now() - serverStartTime) / 1000),
      formatted: formatUptime(Date.now() - serverStartTime),
    },
    memory: {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      rss: formatBytes(memUsage.rss),
      external: formatBytes(memUsage.external),
      heapUsedPercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Check memory health
 */
function checkMemory(): { healthy: boolean; message: string } {
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  if (heapUsedPercent > 90) {
    return { healthy: false, message: `High memory usage: ${heapUsedPercent.toFixed(1)}%` };
  }

  return { healthy: true, message: `Memory usage: ${heapUsedPercent.toFixed(1)}%` };
}

/**
 * Check event loop health
 */
function checkEventLoop(): { healthy: boolean; message: string } {
  // Simple check - in production, you'd use more sophisticated metrics
  return { healthy: true, message: 'Event loop responsive' };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format uptime to human readable
 */
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export default router;
