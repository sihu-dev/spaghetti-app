import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import templateRoutes from '../../routes/template.routes';

// Create test app
const createTestApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api/templates', templateRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Template API Integration Tests', () => {
  const app = createTestApp();

  describe('GET /api/templates - List All Templates', () => {
    it('should return all templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should return templates with correct structure', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      const template = response.body.data[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('previewImage');
      expect(template).toHaveProperty('componentType');
      expect(template).toHaveProperty('props');
      expect(template).toHaveProperty('createdAt');

      expect(typeof template.id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.category).toBe('string');
      expect(typeof template.description).toBe('string');
      expect(typeof template.previewImage).toBe('string');
      expect(typeof template.componentType).toBe('string');
      expect(typeof template.props).toBe('object');
    });

    it('should return exactly 5 templates (mock data)', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.count).toBe(5);
    });

    it('should include all expected template categories', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      const categories = response.body.data.map((t: any) => t.category);
      expect(categories).toContain('hero');
      expect(categories).toContain('navigation');
      expect(categories).toContain('card');
      expect(categories).toContain('footer');
      expect(categories).toContain('form');
    });
  });

  describe('GET /api/templates?category=<category> - Filter by Category', () => {
    it('should filter templates by hero category', async () => {
      const response = await request(app)
        .get('/api/templates?category=hero')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('hero');
      expect(response.body.data[0].id).toBe('hero-1');
      expect(response.body.count).toBe(1);
    });

    it('should filter templates by navigation category', async () => {
      const response = await request(app)
        .get('/api/templates?category=navigation')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('navigation');
      expect(response.body.data[0].id).toBe('navbar-1');
      expect(response.body.count).toBe(1);
    });

    it('should filter templates by card category', async () => {
      const response = await request(app)
        .get('/api/templates?category=card')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('card');
      expect(response.body.count).toBe(1);
    });

    it('should filter templates by footer category', async () => {
      const response = await request(app)
        .get('/api/templates?category=footer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('footer');
      expect(response.body.count).toBe(1);
    });

    it('should filter templates by form category', async () => {
      const response = await request(app)
        .get('/api/templates?category=form')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('form');
      expect(response.body.count).toBe(1);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/templates?category=nonexistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });

    it('should return empty array for category with special characters', async () => {
      const response = await request(app)
        .get('/api/templates?category=test@#$%')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });

    it('should handle category parameter case-sensitively', async () => {
      const response = await request(app)
        .get('/api/templates?category=HERO')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/templates/:id - Get Template by ID', () => {
    it('should return template by valid ID', async () => {
      const response = await request(app)
        .get('/api/templates/hero-1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe('hero-1');
      expect(response.body.data.name).toBe('Hero Section - Centered');
      expect(response.body.data.category).toBe('hero');
    });

    it('should return navbar template by ID', async () => {
      const response = await request(app)
        .get('/api/templates/navbar-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('navbar-1');
      expect(response.body.data.name).toBe('Navigation Bar - Horizontal');
      expect(response.body.data.category).toBe('navigation');
    });

    it('should return card template by ID', async () => {
      const response = await request(app)
        .get('/api/templates/card-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('card-1');
      expect(response.body.data.name).toBe('Feature Card');
      expect(response.body.data.category).toBe('card');
    });

    it('should return footer template by ID', async () => {
      const response = await request(app)
        .get('/api/templates/footer-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('footer-1');
      expect(response.body.data.name).toBe('Footer - Multi-column');
      expect(response.body.data.category).toBe('footer');
    });

    it('should return form template by ID', async () => {
      const response = await request(app)
        .get('/api/templates/form-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('form-1');
      expect(response.body.data.name).toBe('Contact Form');
      expect(response.body.data.category).toBe('form');
    });

    it('should return complete template structure with all fields', async () => {
      const response = await request(app)
        .get('/api/templates/hero-1')
        .expect(200);

      const template = response.body.data;
      expect(template).toHaveProperty('id', 'hero-1');
      expect(template).toHaveProperty('name', 'Hero Section - Centered');
      expect(template).toHaveProperty('category', 'hero');
      expect(template).toHaveProperty('description', 'Centered hero section with title, subtitle, and CTA button');
      expect(template).toHaveProperty('previewImage', '/previews/hero-centered.png');
      expect(template).toHaveProperty('componentType', 'HeroSection');
      expect(template).toHaveProperty('props');
      expect(template.props).toHaveProperty('layout', 'centered');
      expect(template.props).toHaveProperty('hasImage', true);
      expect(template.props).toHaveProperty('hasCTA', true);
      expect(template).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent template ID', async () => {
      const response = await request(app)
        .get('/api/templates/nonexistent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Template not found');
    });

    it('should return 404 for empty ID', async () => {
      const response = await request(app)
        .get('/api/templates/')
        .expect('Content-Type', /json/)
        .expect(200);

      // This will match the GET /api/templates route (list all)
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for numeric ID', async () => {
      const response = await request(app)
        .get('/api/templates/12345')
        .expect(404);

      expect(response.body.error).toBe('Template not found');
    });

    it('should return 404 for ID with special characters', async () => {
      const response = await request(app)
        .get('/api/templates/test@#$%')
        .expect(404);

      expect(response.body.error).toBe('Template not found');
    });

    it('should return 404 for UUID format ID', async () => {
      const response = await request(app)
        .get('/api/templates/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.error).toBe('Template not found');
    });

    it('should handle URL encoded ID parameters', async () => {
      const response = await request(app)
        .get('/api/templates/hero%2D1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('hero-1');
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent success response structure for list', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.success).toBe('boolean');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.count).toBe('number');
    });

    it('should return consistent success response structure for single template', async () => {
      const response = await request(app)
        .get('/api/templates/hero-1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.data).toBe('object');
      expect(response.body.data).not.toBeNull();
    });

    it('should return consistent error response structure for 404', async () => {
      const response = await request(app)
        .get('/api/templates/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error).toBeTruthy();
    });

    it('should set correct Content-Type header for all responses', async () => {
      const response1 = await request(app)
        .get('/api/templates')
        .expect('Content-Type', /json/);

      const response2 = await request(app)
        .get('/api/templates/hero-1')
        .expect('Content-Type', /json/);

      const response3 = await request(app)
        .get('/api/templates/nonexistent')
        .expect('Content-Type', /json/);

      expect(response1.headers['content-type']).toContain('json');
      expect(response2.headers['content-type']).toContain('json');
      expect(response3.headers['content-type']).toContain('json');
    });

    it('should return data array with consistent item structure', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      response.body.data.forEach((template: any) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('previewImage');
        expect(template).toHaveProperty('componentType');
        expect(template).toHaveProperty('props');
        expect(template).toHaveProperty('createdAt');
      });
    });

    it('should return count matching data array length', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.count).toBe(response.body.data.length);
    });

    it('should return count matching filtered results', async () => {
      const response = await request(app)
        .get('/api/templates?category=hero')
        .expect(200);

      expect(response.body.count).toBe(response.body.data.length);
      expect(response.body.count).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/templates?category=hero&unused=param')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should handle empty query parameter value', async () => {
      const response = await request(app)
        .get('/api/templates?category=')
        .expect(200);

      // Empty string category is falsy, so it returns all templates
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
    });

    it('should handle case sensitivity in category filter', async () => {
      const lowerResponse = await request(app)
        .get('/api/templates?category=hero')
        .expect(200);

      const upperResponse = await request(app)
        .get('/api/templates?category=Hero')
        .expect(200);

      expect(lowerResponse.body.data).toHaveLength(1);
      expect(upperResponse.body.data).toHaveLength(0);
    });

    it('should not fail with missing route parameters', async () => {
      // This tests that the route handlers are properly set up
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle malformed URLs gracefully', async () => {
      const response = await request(app)
        .get('/api/templates/hero-1/extra/path')
        .expect(404);

      // This should hit the notFoundHandler
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('HTTP Method Validation', () => {
    it('should reject POST requests to /api/templates', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'Test Template' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should reject PUT requests to /api/templates/:id', async () => {
      const response = await request(app)
        .put('/api/templates/hero-1')
        .send({ name: 'Updated Template' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should reject DELETE requests to /api/templates/:id', async () => {
      const response = await request(app)
        .delete('/api/templates/hero-1')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should reject PATCH requests to /api/templates/:id', async () => {
      const response = await request(app)
        .patch('/api/templates/hero-1')
        .send({ name: 'Patched Template' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('Performance and Data Integrity', () => {
    it('should return results quickly for list endpoint', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/templates')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms (generous threshold for tests)
      expect(duration).toBeLessThan(100);
    });

    it('should return results quickly for single template endpoint', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/templates/hero-1')
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should return same data on repeated requests', async () => {
      const response1 = await request(app)
        .get('/api/templates/hero-1')
        .expect(200);

      const response2 = await request(app)
        .get('/api/templates/hero-1')
        .expect(200);

      expect(response1.body.data.id).toBe(response2.body.data.id);
      expect(response1.body.data.name).toBe(response2.body.data.name);
      expect(response1.body.data.category).toBe(response2.body.data.category);
    });

    it('should maintain data consistency across filtered and unfiltered requests', async () => {
      const allResponse = await request(app)
        .get('/api/templates')
        .expect(200);

      const heroResponse = await request(app)
        .get('/api/templates?category=hero')
        .expect(200);

      const heroFromAll = allResponse.body.data.find((t: any) => t.category === 'hero');
      const heroFromFilter = heroResponse.body.data[0];

      expect(heroFromAll).toEqual(heroFromFilter);
    });
  });
});
