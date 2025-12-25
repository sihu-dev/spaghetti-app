import request from 'supertest';
import app from '../index';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return API documentation', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'AI Spaghetti API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/templates', () => {
    it('should return list of templates', async () => {
      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const response = await request(app).get('/api/templates?category=hero');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((t: { category: string }) => t.category === 'hero')).toBe(true);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return template by id', async () => {
      const response = await request(app).get('/api/templates/hero-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('hero-1');
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app).get('/api/templates/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Template not found');
    });
  });

  describe('POST /api/assembly/generate', () => {
    it('should generate assembly with valid input', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'test-theme-id'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('generatedCode');
    });

    it('should return 400 for missing templateId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          themeId: 'test-theme-id'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing themeId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/assembly/:id', () => {
    it('should return 404 for non-existent assembly', async () => {
      const response = await request(app).get('/api/assembly/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Assembly not found');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('POST /api/theme/extract', () => {
    it('should return 400 without image', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
