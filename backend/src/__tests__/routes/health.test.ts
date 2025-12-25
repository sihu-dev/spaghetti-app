import request from 'supertest';
import express from 'express';
import healthRoutes, { setReadiness } from '../../routes/health.routes';

const createTestApp = () => {
  const app = express();
  app.use('/health', healthRoutes);
  return app;
};

describe('Health Routes', () => {
  const app = createTestApp();

  beforeEach(() => {
    // Reset readiness state before each test
    setReadiness(true);
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status when ready', async () => {
      setReadiness(true);

      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('eventLoop');
    });

    it('should return not ready status when not ready', async () => {
      setReadiness(false);

      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/)
        .expect(503);

      expect(response.body).toHaveProperty('status', 'not_ready');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /health/details', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/details')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.uptime).toHaveProperty('seconds');
      expect(response.body.uptime).toHaveProperty('formatted');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsedPercent');
      expect(response.body).toHaveProperty('process');
      expect(response.body.process).toHaveProperty('pid');
      expect(response.body.process).toHaveProperty('nodeVersion');
    });
  });
});
