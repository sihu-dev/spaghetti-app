import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import healthRoutes, { setReadiness } from '../../routes/health.routes';

// Create test app with full middleware stack for integration testing
const createTestApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount health routes
  app.use('/health', healthRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Health Routes Integration Tests', () => {
  const app = createTestApp();

  beforeEach(() => {
    // Reset readiness state before each test
    setReadiness(true);
  });

  describe('GET /health', () => {
    it('should return basic health status with all required fields', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return environment from NODE_ENV', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.environment).toBe(process.env.NODE_ENV || 'development');
    });

    it('should include version information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.version).toBeDefined();
      expect(typeof response.body.version).toBe('string');
    });

    it('should set appropriate cache headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Cache control should be set for public caching
      expect(response.headers['cache-control']).toContain('public');
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });

  describe('GET /health/live - Liveness Probe', () => {
    it('should return liveness status with status code 200', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return numeric uptime in seconds', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(response.body.uptime)).toBe(true);
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should always return 200 when server is running', async () => {
      // Make multiple requests to ensure liveness is consistent
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/health/live')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('alive');
      });
    });

    it('should increment uptime over time', async () => {
      const response1 = await request(app)
        .get('/health/live')
        .expect(200);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });

    it('should set appropriate cache headers', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      // Should have short cache time
      expect(response.headers['cache-control']).toBeDefined();
    });

    it('should return consistent response format', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      // Should only have these three properties
      const keys = Object.keys(response.body).sort();
      expect(keys).toEqual(['status', 'timestamp', 'uptime']);
    });
  });

  describe('GET /health/ready - Readiness Probe', () => {
    it('should return ready status when server is ready', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include health checks for critical dependencies', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('eventLoop');

      // Each check should have healthy and message properties
      expect(response.body.checks.memory).toHaveProperty('healthy');
      expect(response.body.checks.memory).toHaveProperty('message');
      expect(response.body.checks.eventLoop).toHaveProperty('healthy');
      expect(response.body.checks.eventLoop).toHaveProperty('message');
    });

    it('should return valid ISO timestamp', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return numeric uptime when ready', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(response.body.uptime)).toBe(true);
    });

    it('should verify all health checks are healthy when ready', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body.checks.memory.healthy).toBe(true);
      expect(response.body.checks.eventLoop.healthy).toBe(true);
    });

    it('should include descriptive messages for health checks', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(typeof response.body.checks.memory.message).toBe('string');
      expect(response.body.checks.memory.message.length).toBeGreaterThan(0);
      expect(typeof response.body.checks.eventLoop.message).toBe('string');
      expect(response.body.checks.eventLoop.message.length).toBeGreaterThan(0);
    });
  });

  describe('GET /health/ready - Not Ready State', () => {
    it('should return 503 when server is not ready', async () => {
      setReadiness(false);

      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/)
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return descriptive message when not ready', async () => {
      setReadiness(false);

      const response = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(response.body.message).toBe('Server is not ready to accept traffic');
    });

    it('should not include health checks when not ready', async () => {
      setReadiness(false);

      const response = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(response.body).not.toHaveProperty('checks');
      expect(response.body).not.toHaveProperty('uptime');
    });

    it('should include valid timestamp even when not ready', async () => {
      setReadiness(false);

      const response = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should transition from ready to not ready state', async () => {
      // First request when ready
      setReadiness(true);
      const readyResponse = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body.status).toBe('ready');

      // Second request when not ready
      setReadiness(false);
      const notReadyResponse = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(notReadyResponse.body.status).toBe('not_ready');
    });

    it('should transition from not ready to ready state', async () => {
      // First request when not ready
      setReadiness(false);
      const notReadyResponse = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(notReadyResponse.body.status).toBe('not_ready');

      // Second request when ready
      setReadiness(true);
      const readyResponse = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body.status).toBe('ready');
    });
  });

  describe('GET /health/details - Detailed Health Information', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('process');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include formatted uptime', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.uptime).toHaveProperty('seconds');
      expect(response.body.uptime).toHaveProperty('formatted');
      expect(typeof response.body.uptime.seconds).toBe('number');
      expect(typeof response.body.uptime.formatted).toBe('string');
    });

    it('should include comprehensive memory information', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('external');
      expect(response.body.memory).toHaveProperty('heapUsedPercent');
    });

    it('should include process information', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.process).toHaveProperty('pid');
      expect(response.body.process).toHaveProperty('nodeVersion');
      expect(response.body.process).toHaveProperty('platform');
      expect(response.body.process).toHaveProperty('arch');
    });

    it('should return correct process ID', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.process.pid).toBe(process.pid);
    });

    it('should return correct Node.js version', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.process.nodeVersion).toBe(process.version);
    });

    it('should return correct platform', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.process.platform).toBe(process.platform);
    });

    it('should return correct architecture', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.process.arch).toBe(process.arch);
    });

    it('should format memory values as human-readable strings', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      // Should include units like MB, GB, etc.
      expect(response.body.memory.heapUsed).toMatch(/\d+\.\d{2}\s+(B|KB|MB|GB)/);
      expect(response.body.memory.heapTotal).toMatch(/\d+\.\d{2}\s+(B|KB|MB|GB)/);
      expect(response.body.memory.rss).toMatch(/\d+\.\d{2}\s+(B|KB|MB|GB)/);
      expect(response.body.memory.external).toMatch(/\d+\.\d{2}\s+(B|KB|MB|GB)/);
    });

    it('should calculate heap usage percentage correctly', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(typeof response.body.memory.heapUsedPercent).toBe('number');
      expect(response.body.memory.heapUsedPercent).toBeGreaterThan(0);
      expect(response.body.memory.heapUsedPercent).toBeLessThanOrEqual(100);
    });

    it('should reflect readiness state in status', async () => {
      setReadiness(true);
      const readyResponse = await request(app)
        .get('/health/details')
        .expect(200);

      expect(readyResponse.body.status).toBe('healthy');

      setReadiness(false);
      const notReadyResponse = await request(app)
        .get('/health/details')
        .expect(200);

      expect(notReadyResponse.body.status).toBe('not_ready');
    });

    it('should include valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should not cache detailed health information', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect(200);

      // Details endpoint should not have aggressive caching
      // since it contains dynamic information
      if (response.headers['cache-control']) {
        expect(response.headers['cache-control']).not.toContain('max-age=3600');
      }
    });
  });

  describe('Response Format Consistency', () => {
    it('should return JSON content type for all endpoints', async () => {
      const endpoints = ['/health', '/health/live', '/health/ready', '/health/details'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['content-type']).toMatch(/json/);
      }
    });

    it('should include timestamp in all responses', async () => {
      const endpoints = ['/health', '/health/live', '/health/ready', '/health/details'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.body).toHaveProperty('timestamp');
        expect(typeof response.body.timestamp).toBe('string');
      }
    });

    it('should return valid JSON for all endpoints', async () => {
      const endpoints = ['/health', '/health/live', '/health/ready', '/health/details'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid health endpoints with 404', async () => {
      const response = await request(app)
        .get('/health/invalid')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle POST requests to health endpoints', async () => {
      const response = await request(app)
        .post('/health')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle PUT requests to health endpoints', async () => {
      const response = await request(app)
        .put('/health/live')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle DELETE requests to health endpoints', async () => {
      const response = await request(app)
        .delete('/health/ready')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('Performance and Reliability', () => {
    it('should respond quickly to health checks', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/health')
        .expect(200);

      const duration = Date.now() - startTime;

      // Health check should respond in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should respond quickly to liveness checks', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/health/live')
        .expect(200);

      const duration = Date.now() - startTime;

      // Liveness check should respond in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should respond quickly to readiness checks', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/health/ready')
        .expect(200);

      const duration = Date.now() - startTime;

      // Readiness check should respond in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent health check requests', async () => {
      const concurrentRequests = 20;
      const requests = Array(concurrentRequests).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(concurrentRequests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });

    it('should handle mixed concurrent requests to different endpoints', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/health/live'),
        request(app).get('/health/ready'),
        request(app).get('/health/details'),
        request(app).get('/health'),
        request(app).get('/health/live'),
        request(app).get('/health/ready'),
        request(app).get('/health/details'),
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([200, 503]).toContain(response.status);
      });
    });
  });

  describe('Kubernetes Readiness Scenarios', () => {
    it('should support graceful shutdown scenario', async () => {
      // Server starts ready
      setReadiness(true);
      const readyResponse = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body.status).toBe('ready');

      // Server prepares for shutdown
      setReadiness(false);
      const notReadyResponse = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(notReadyResponse.body.status).toBe('not_ready');

      // Liveness should still pass during graceful shutdown
      const liveResponse = await request(app)
        .get('/health/live')
        .expect(200);

      expect(liveResponse.body.status).toBe('alive');
    });

    it('should support startup scenario', async () => {
      // Server starts not ready
      setReadiness(false);
      const notReadyResponse = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(notReadyResponse.body.status).toBe('not_ready');

      // Server becomes ready after initialization
      setReadiness(true);
      const readyResponse = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(readyResponse.body.status).toBe('ready');
    });

    it('should allow liveness to pass while readiness fails', async () => {
      setReadiness(false);

      const [liveResponse, readyResponse] = await Promise.all([
        request(app).get('/health/live'),
        request(app).get('/health/ready'),
      ]);

      // Liveness should pass
      expect(liveResponse.status).toBe(200);
      expect(liveResponse.body.status).toBe('alive');

      // Readiness should fail
      expect(readyResponse.status).toBe(503);
      expect(readyResponse.body.status).toBe('not_ready');
    });
  });
});
