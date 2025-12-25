import request from 'supertest';
import express, { Router } from 'express';
import cors from 'cors';
import {
  generateAssembly,
  getAssembly,
} from '../../controllers/assembly.controller';
import { authenticate } from '../../middleware/auth';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import {
  registerUser,
  loginUser,
} from '../../controllers/auth.controller';

// Create test app WITHOUT rate limiting to avoid 429 errors in tests
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Create auth routes for authentication tests
  const testAuthRouter = Router();
  testAuthRouter.post('/register', registerUser);
  testAuthRouter.post('/login', loginUser);

  // Create assembly routes without rate limiter for testing
  const testAssemblyRouter = Router();

  // Public routes (no authentication required)
  testAssemblyRouter.post('/generate', generateAssembly);
  testAssemblyRouter.get('/:id', getAssembly);

  app.use('/api/auth', testAuthRouter);
  app.use('/api/assembly', testAssemblyRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

// Create test app WITH authentication required
const createAuthProtectedApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Create auth routes
  const testAuthRouter = Router();
  testAuthRouter.post('/register', registerUser);
  testAuthRouter.post('/login', loginUser);

  // Create assembly routes WITH authentication
  const testAssemblyRouter = Router();
  testAssemblyRouter.post('/generate', authenticate, generateAssembly);
  testAssemblyRouter.get('/:id', authenticate, getAssembly);

  app.use('/api/auth', testAuthRouter);
  app.use('/api/assembly', testAssemblyRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Assembly API Integration Tests', () => {
  const app = createTestApp();

  let createdAssemblyId: string;

  describe('POST /api/assembly/generate', () => {
    it('should create assembly with valid templateId and themeId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('templateId', 'hero-1');
      expect(response.body.data).toHaveProperty('themeId', 'theme-123');
      expect(response.body.data).toHaveProperty('generatedCode');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data.generatedCode).toContain('Generated Component');

      // Save for later tests
      createdAssemblyId = response.body.data.id;
    });

    it('should create assembly with customizations', async () => {
      const customizations = {
        backgroundColor: '#FF5733',
        padding: '24px',
        borderRadius: '12px',
      };

      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'card-1',
          themeId: 'theme-456',
          customizations,
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('customizations');
      expect(response.body.data.customizations).toEqual(customizations);
      expect(response.body.data.generatedCode).toContain(customizations.backgroundColor);
      expect(response.body.data.generatedCode).toContain(customizations.padding);
      expect(response.body.data.generatedCode).toContain(customizations.borderRadius);
    });

    it('should create assembly with different valid templates', async () => {
      const templates = ['navbar-1', 'footer-1', 'form-1'];

      for (const templateId of templates) {
        const response = await request(app)
          .post('/api/assembly/generate')
          .send({
            templateId,
            themeId: 'theme-test',
          })
          .expect(201);

        expect(response.body.data.templateId).toBe(templateId);
        expect(response.body.data.generatedCode).toContain('Generated Component');
      }
    });

    it('should reject request without templateId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          themeId: 'theme-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('templateId');
    });

    it('should reject request without themeId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('themeId');
    });

    it('should reject request with both templateId and themeId missing', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid templateId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'non-existent-template',
          themeId: 'theme-123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to generate assembly');
      expect(response.body.message).toContain('not found');
    });

    it('should reject request with empty strings', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: '',
          themeId: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle complex customizations object', async () => {
      const complexCustomizations = {
        backgroundColor: '#FF5733',
        padding: '24px',
        borderRadius: '12px',
        nested: {
          color: '#333',
          fontSize: '16px',
        },
        array: ['value1', 'value2'],
      };

      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-complex',
          customizations: complexCustomizations,
        })
        .expect(201);

      expect(response.body.data.customizations).toEqual(complexCustomizations);
    });

    it('should generate unique IDs for different assemblies', async () => {
      const response1 = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-1',
        })
        .expect(201);

      const response2 = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-1',
        })
        .expect(201);

      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });
  });

  describe('GET /api/assembly/:id', () => {
    it('should retrieve assembly by valid ID', async () => {
      const response = await request(app)
        .get(`/api/assembly/${createdAssemblyId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', createdAssemblyId);
      expect(response.body.data).toHaveProperty('templateId');
      expect(response.body.data).toHaveProperty('themeId');
      expect(response.body.data).toHaveProperty('generatedCode');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent assembly ID', async () => {
      const response = await request(app)
        .get('/api/assembly/non-existent-id-12345')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/assembly/invalid-uuid')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should retrieve the correct assembly data', async () => {
      // Create a specific assembly
      const createResponse = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'navbar-1',
          themeId: 'theme-navbar-test',
          customizations: { color: 'blue' },
        })
        .expect(201);

      const assemblyId = createResponse.body.data.id;

      // Retrieve it
      const getResponse = await request(app)
        .get(`/api/assembly/${assemblyId}`)
        .expect(200);

      expect(getResponse.body.data.templateId).toBe('navbar-1');
      expect(getResponse.body.data.themeId).toBe('theme-navbar-test');
      expect(getResponse.body.data.customizations).toEqual({ color: 'blue' });
    });
  });

  describe('Assembly Data Integrity', () => {
    it('should maintain assembly data after creation', async () => {
      const assemblyData = {
        templateId: 'form-1',
        themeId: 'theme-form',
        customizations: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        },
      };

      const createResponse = await request(app)
        .post('/api/assembly/generate')
        .send(assemblyData)
        .expect(201);

      const assemblyId = createResponse.body.data.id;

      // Retrieve immediately
      const getResponse1 = await request(app)
        .get(`/api/assembly/${assemblyId}`)
        .expect(200);

      expect(getResponse1.body.data.templateId).toBe(assemblyData.templateId);
      expect(getResponse1.body.data.themeId).toBe(assemblyData.themeId);
      expect(getResponse1.body.data.customizations).toEqual(assemblyData.customizations);

      // Retrieve again after some time
      await new Promise(resolve => setTimeout(resolve, 100));

      const getResponse2 = await request(app)
        .get(`/api/assembly/${assemblyId}`)
        .expect(200);

      expect(getResponse2.body.data).toEqual(getResponse1.body.data);
    });

    it('should store generated code correctly', async () => {
      const createResponse = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'card-1',
          themeId: 'theme-card',
        })
        .expect(201);

      const generatedCode = createResponse.body.data.generatedCode;
      const assemblyId = createResponse.body.data.id;

      const getResponse = await request(app)
        .get(`/api/assembly/${assemblyId}`)
        .expect(200);

      expect(getResponse.body.data.generatedCode).toBe(generatedCode);
      expect(generatedCode).toContain('import React from');
      expect(generatedCode).toContain('export default Component');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'invalid-template-causing-error',
          themeId: 'theme-test',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should validate request content-type', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .set('Content-Type', 'text/plain')
        .send('invalid body')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Assembly API with Authentication', () => {
  const authApp = createAuthProtectedApp();

  // Use unique email with timestamp to avoid conflicts
  const uniqueId = Date.now();
  const validUser = {
    email: `assembly-test-${uniqueId}@example.com`,
    password: 'TestPassword123',
    name: 'Assembly Test User',
  };

  let accessToken: string;

  beforeAll(async () => {
    // Register and login to get access token
    await request(authApp)
      .post('/api/auth/register')
      .send(validUser)
      .expect(201);

    const loginResponse = await request(authApp)
      .post('/api/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password,
      })
      .expect(200);

    accessToken = loginResponse.body.data.accessToken;
  });

  describe('Authentication Requirements', () => {
    it('should reject POST /api/assembly/generate without authentication', async () => {
      const response = await request(authApp)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject GET /api/assembly/:id without authentication', async () => {
      const response = await request(authApp)
        .get('/api/assembly/some-id')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow POST /api/assembly/generate with valid token', async () => {
      const response = await request(authApp)
        .post('/api/assembly/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          templateId: 'hero-1',
          themeId: 'theme-auth-test',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should allow GET /api/assembly/:id with valid token', async () => {
      // Create assembly
      const createResponse = await request(authApp)
        .post('/api/assembly/generate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          templateId: 'card-1',
          themeId: 'theme-auth-test-2',
        })
        .expect(201);

      const assemblyId = createResponse.body.data.id;

      // Retrieve assembly
      const getResponse = await request(authApp)
        .get(`/api/assembly/${assemblyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getResponse.body.data.id).toBe(assemblyId);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(authApp)
        .post('/api/assembly/generate')
        .set('Authorization', 'Bearer invalid-token-12345')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(authApp)
        .post('/api/assembly/generate')
        .set('Authorization', 'NotBearer token')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});

describe('Assembly Validation', () => {
  const app = createTestApp();

  describe('Input Validation', () => {
    it('should reject null templateId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: null,
          themeId: 'theme-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject null themeId', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: null,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject undefined fields', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: undefined,
          themeId: undefined,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject extremely long templateId', async () => {
      const longId = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: longId,
          themeId: 'theme-123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Customization Validation', () => {
    it('should accept empty customizations object', async () => {
      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
          customizations: {},
        })
        .expect(201);

      expect(response.body.data.customizations).toEqual({});
    });

    it('should preserve customization data types', async () => {
      const customizations = {
        stringValue: 'test',
        numberValue: 42,
        booleanValue: true,
        nullValue: null,
      };

      const response = await request(app)
        .post('/api/assembly/generate')
        .send({
          templateId: 'hero-1',
          themeId: 'theme-123',
          customizations,
        })
        .expect(201);

      expect(response.body.data.customizations).toEqual(customizations);
    });
  });
});
