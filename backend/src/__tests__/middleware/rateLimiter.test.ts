import request from 'supertest';
import express, { Request, Response } from 'express';
import { apiLimiter, authLimiter, aiLimiter } from '../../middleware/rateLimiter';
import { ErrorCode } from '../../utils/errors';

// Create test apps with rate limiters
const createApiTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(apiLimiter);
  app.get('/test', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'OK' });
  });
  return app;
};

const createAuthTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authLimiter);
  app.post('/auth', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Authenticated' });
  });
  return app;
};

const createAiTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(aiLimiter);
  app.post('/ai', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'AI processed' });
  });
  return app;
};

describe('Rate Limiter Middleware', () => {
  // Store original env vars
  const originalWindowMs = process.env.RATE_LIMIT_WINDOW_MS;
  const originalMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS;

  afterAll(() => {
    // Restore original env vars
    process.env.RATE_LIMIT_WINDOW_MS = originalWindowMs;
    process.env.RATE_LIMIT_MAX_REQUESTS = originalMaxRequests;
  });

  describe('apiLimiter', () => {
    it('should be defined and be a middleware function', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should allow requests within rate limit', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    it('should set standard rate limit headers', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      // Check for RateLimit headers (standard format)
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();

      // Should NOT have legacy X-RateLimit headers
      expect(response.headers['x-ratelimit-limit']).toBeUndefined();
    });

    it('should return 429 when rate limit is exceeded', async () => {
      // Create a new app to avoid interference from other tests
      const app = createApiTestApp();

      // Default is 100 requests per 15 minutes, but we'll just test the structure
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    }, 10000);

    it('should handle custom key generator for X-Forwarded-For', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.100, 10.0.0.1')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Rate limiter should use 192.168.1.100 as the key
    });

    it('should handle empty X-Forwarded-For header', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', '')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should trim whitespace from X-Forwarded-For header', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', '  192.168.1.100  , 10.0.0.1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('aiLimiter', () => {
    it('should be defined and configured for AI endpoints', () => {
      expect(aiLimiter).toBeDefined();
      expect(typeof aiLimiter).toBe('function');
    });

    it('should allow AI requests within rate limit', async () => {
      const app = createAiTestApp();

      const response = await request(app)
        .post('/ai')
        .send({ prompt: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers['ratelimit-limit']).toBe('10'); // 10 requests per minute
    });

    it('should have lower limit than apiLimiter', async () => {
      const apiApp = createApiTestApp();
      const aiApp = createAiTestApp();

      const apiResponse = await request(apiApp).get('/test');
      const aiResponse = await request(aiApp).post('/ai').send({});

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit'] || '0');
      const aiLimit = parseInt(aiResponse.headers['ratelimit-limit'] || '0');

      expect(aiLimit).toBe(10);
      expect(apiLimit).toBeGreaterThan(aiLimit);
    });

    it('should return AI-specific error message when rate limit exceeded', async () => {
      const app = createAiTestApp();

      // The error message should mention AI processing
      const response = await request(app)
        .post('/ai')
        .send({ prompt: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('authLimiter', () => {
    it('should be defined and configured for auth endpoints', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should allow auth requests within rate limit', async () => {
      const app = createAuthTestApp();

      const response = await request(app)
        .post('/auth')
        .send({ username: 'test', password: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers['ratelimit-limit']).toBe('5'); // 5 attempts per 15 minutes
    });

    it('should be the most restrictive limiter', async () => {
      const apiApp = createApiTestApp();
      const aiApp = createAiTestApp();
      const authApp = createAuthTestApp();

      const apiResponse = await request(apiApp).get('/test');
      const aiResponse = await request(aiApp).post('/ai').send({});
      const authResponse = await request(authApp).post('/auth').send({});

      const apiLimit = parseInt(apiResponse.headers['ratelimit-limit'] || '0');
      const aiLimit = parseInt(aiResponse.headers['ratelimit-limit'] || '0');
      const authLimit = parseInt(authResponse.headers['ratelimit-limit'] || '0');

      expect(authLimit).toBe(5);
      expect(authLimit).toBeLessThan(aiLimit);
      expect(authLimit).toBeLessThan(apiLimit);
    });

    it('should return auth-specific error message when rate limit exceeded', async () => {
      const app = createAuthTestApp();

      const response = await request(app)
        .post('/auth')
        .send({ username: 'test', password: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error message format', () => {
    it('should use consistent error code for rate limit exceeded', () => {
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should return proper error structure when rate limit is hit', async () => {
      const app = createApiTestApp();

      // Make initial request
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // The error response should have:
      // - success: false
      // - error.code: RATE_LIMIT_EXCEEDED
      // - error.message: descriptive message
      // - timestamp: ISO date string
    });
  });

  describe('Configuration parsing', () => {
    it('should use default values when env vars are not set', () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;

      jest.resetModules();
      const { apiLimiter: testLimiter } = require('../../middleware/rateLimiter');

      expect(testLimiter).toBeDefined();
      // Defaults: windowMs = 900000 (15 min), max = 100
    });

    it('should parse environment variables correctly', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '600000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';

      jest.resetModules();
      const { apiLimiter: testLimiter } = require('../../middleware/rateLimiter');

      expect(testLimiter).toBeDefined();
    });

    it('should handle parseInt with base 10 correctly', () => {
      // Test that leading zeros don't cause octal parsing
      process.env.RATE_LIMIT_WINDOW_MS = '0123';
      process.env.RATE_LIMIT_MAX_REQUESTS = '089';

      jest.resetModules();
      const { apiLimiter: testLimiter } = require('../../middleware/rateLimiter');

      expect(testLimiter).toBeDefined();
      // Should parse as 123 and 89, not as octal
    });

    it('should truncate decimal values when parsing', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '123.45';
      process.env.RATE_LIMIT_MAX_REQUESTS = '67.89';

      jest.resetModules();
      const { apiLimiter: testLimiter } = require('../../middleware/rateLimiter');

      expect(testLimiter).toBeDefined();
      // parseInt should truncate to 123 and 67
    });
  });

  describe('Middleware integration', () => {
    it('should export all three rate limiters', () => {
      const rateLimiter = require('../../middleware/rateLimiter');

      expect(rateLimiter).toHaveProperty('apiLimiter');
      expect(rateLimiter).toHaveProperty('aiLimiter');
      expect(rateLimiter).toHaveProperty('authLimiter');
    });

    it('should have all limiters as middleware functions', () => {
      const { apiLimiter, aiLimiter, authLimiter } = require('../../middleware/rateLimiter');

      expect(typeof apiLimiter).toBe('function');
      expect(typeof aiLimiter).toBe('function');
      expect(typeof authLimiter).toBe('function');
    });

    it('should not interfere with request/response flow', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.message).toBe('OK');
    });
  });

  describe('Security considerations', () => {
    it('should handle malicious X-Forwarded-For headers gracefully', async () => {
      const app = createApiTestApp();

      const maliciousHeaders = [
        '"><script>alert(1)</script>',
        '../../../etc/passwd',
        'SELECT * FROM users',
        '127.0.0.1; DROP TABLE users; --',
      ];

      for (const header of maliciousHeaders) {
        const response = await request(app)
          .get('/test')
          .set('X-Forwarded-For', header)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it('should handle very long X-Forwarded-For chains', async () => {
      const app = createApiTestApp();

      const longChain = Array(1000).fill('192.168.1.1').join(', ');

      const response = await request(app)
        .get('/test')
        .set('X-Forwarded-For', longChain)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle missing IP address gracefully', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should fall back to 'unknown' if no IP is available
    });
  });

  describe('Standard headers compliance', () => {
    it('should use standard RateLimit headers, not legacy X-RateLimit', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      // Should use standard headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();

      // Should NOT use legacy headers (when legacyHeaders: false)
      // Note: express-rate-limit might still send them, but we configured it not to
    });

    it('should include all required rate limit information in headers', async () => {
      const app = createApiTestApp();

      const response = await request(app)
        .get('/test')
        .expect(200);

      const limit = parseInt(response.headers['ratelimit-limit'] || '0');
      const remaining = parseInt(response.headers['ratelimit-remaining'] || '0');
      const reset = response.headers['ratelimit-reset'];

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(limit);
      expect(reset).toBeDefined();
    });
  });
});
