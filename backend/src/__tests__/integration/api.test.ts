import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { apiLimiter } from '../../middleware/rateLimiter';
import themeRoutes from '../../routes/theme.routes';

// Create test app
const createTestApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes (without rate limiting for tests)
  app.use('/api/theme', themeRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('API Integration Tests', () => {
  const app = createTestApp();

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/theme/extract', () => {
    it('should return 400 when no image is provided', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });

    it('should return 400 for invalid image URL (SSRF blocked)', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://localhost/image.png' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should return 400 for private IP URL', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://192.168.1.1/image.png' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should reject unsupported file types', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('test'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should include route info in error message', async () => {
      const response = await request(app)
        .post('/api/nonexistent')
        .expect(404);

      expect(response.body.error.message).toContain('POST');
      expect(response.body.error.message).toContain('/api/nonexistent');
    });
  });

  describe('Error Response Format', () => {
    it('should have consistent error response structure', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});

describe('Rate Limiter', () => {
  it('should export rate limiters', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });
});
