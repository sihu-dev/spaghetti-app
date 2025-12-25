import request from 'supertest';
import express, { Router } from 'express';
import cors from 'cors';
import multer from 'multer';
import { aiLimiter } from '../../middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { Errors } from '../../utils/errors';

// Mock the Anthropic SDK before importing any services
const mockMessagesCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      messages: {
        create: (...args: any[]) => mockMessagesCreate(...args),
      },
    };
  });
});

// Mock fetch globally
global.fetch = jest.fn();

// Import controller after mocks are set up
import { extractTheme } from '../../controllers/theme.controller';

// Create test app WITHOUT rate limiting to avoid 429 errors in most tests
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
      } else {
        cb(Errors.invalidImage(`Unsupported file type: ${file.mimetype}`));
      }
    },
  });

  // Create theme routes without rate limiter for testing
  const testThemeRouter = Router();
  testThemeRouter.post('/extract', upload.single('image'), extractTheme);

  app.use('/api/theme', testThemeRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

// Create test app WITH rate limiting for rate limit tests
const createRateLimitedApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
      } else {
        cb(Errors.invalidImage(`Unsupported file type: ${file.mimetype}`));
      }
    },
  });

  // Create theme routes WITH rate limiter
  const testThemeRouter = Router();
  testThemeRouter.post('/extract', aiLimiter, upload.single('image'), extractTheme);

  app.use('/api/theme', testThemeRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Theme API Integration Tests', () => {
  const app = createTestApp();

  const validThemeResponse = {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
          primary: '#FF5733',
          secondary: '#33FF57',
          accent: '#3357FF',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          text: '#000000',
          mood: 'Vibrant and energetic color scheme',
          suggestion: 'Great for modern, dynamic web applications',
        }),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  describe('POST /api/theme/extract - Missing Body', () => {
    it('should return 400 when no image file or URL is provided', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error.message).toContain('Image file or URL is required');
    });

    it('should return 400 when sending empty body', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });

    it('should return 400 when sending empty JSON', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .set('Content-Type', 'application/json')
        .send('{}')
        .expect(400);

      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('POST /api/theme/extract - SSRF Protection', () => {
    it('should block localhost URL', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://localhost/image.png' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
      expect(response.body.error.message).toContain('not allowed');
    });

    it('should block 127.0.0.1 URL', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://127.0.0.1:8080/image.jpg' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should block private IP address 192.168.x.x', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://192.168.1.1/image.png' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should block private IP address 10.x.x.x', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://10.0.0.1/image.jpg' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should block private IP address 172.16.x.x', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://172.16.0.1/image.png' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should block link-local address 169.254.x.x', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://169.254.169.254/latest/meta-data' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SSRF_BLOCKED');
    });

    it('should block metadata endpoints', async () => {
      const metadataUrls = [
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://metadata.google.com/computeMetadata/v1/',
      ];

      for (const url of metadataUrls) {
        const response = await request(app)
          .post('/api/theme/extract')
          .send({ imageUrl: url })
          .expect(400);

        expect(response.body.error.code).toBe('SSRF_BLOCKED');
      }
    });

    it('should block file:// protocol', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'file:///etc/passwd' })
        .expect(400);

      expect(response.body.error.code).toBe('SSRF_BLOCKED');
    });

    it('should block ftp:// protocol', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'ftp://example.com/image.png' })
        .expect(400);

      expect(response.body.error.code).toBe('SSRF_BLOCKED');
    });
  });

  describe('POST /api/theme/extract - Validation Errors', () => {
    it('should reject unsupported file type (text/plain)', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('test'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('INVALID_IMAGE');
      expect(response.body.error.message).toContain('Unsupported file type');
    });

    it('should reject unsupported file type (application/pdf)', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake pdf content'), {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('INVALID_IMAGE');
    });

    it('should reject file exceeding 10MB limit', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', largeBuffer, {
          filename: 'large.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('success', false);
      // Multer returns a specific error for file size
      expect(response.body.error.message).toBeDefined();
    });

    it('should reject invalid URL format', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(response.body.error.message).toContain('Invalid URL');
    });

    it('should handle invalid image URL with missing protocol', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'example.com/image.jpg' })
        .expect(400);

      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should reject URL with unsupported content type', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Map([
          ['content-type', 'text/html'],
          ['content-length', '1024'],
        ]),
        arrayBuffer: async () => new ArrayBuffer(1024),
      });

      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'https://example.com/page.html' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_IMAGE');
      expect(response.body.error.message).toContain('Unsupported content type');
    });

    it('should reject URL returning 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'https://example.com/notfound.jpg' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_IMAGE');
      expect(response.body.error.message).toContain('HTTP 404');
    });

    it('should reject URL with image exceeding 10MB', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Map([
          ['content-type', 'image/jpeg'],
          ['content-length', `${11 * 1024 * 1024}`],
        ]),
      });

      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'https://example.com/huge.jpg' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_IMAGE');
      expect(response.body.error.message).toContain('exceeds 10MB');
    });

    it('should handle fetch timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          })
      );

      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'https://example.com/slow.jpg' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_IMAGE');
      expect(response.body.error.message).toContain('timed out');
    });
  });

  describe('POST /api/theme/extract - Success Cases', () => {
    it('should successfully extract theme from JPEG file', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-jpeg-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('colors');
      expect(response.body.data).toHaveProperty('primary', '#FF5733');
      expect(response.body.data).toHaveProperty('secondary', '#33FF57');
      expect(response.body.data).toHaveProperty('accent', '#3357FF');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data.colors).toHaveLength(5);
    });

    it('should successfully extract theme from PNG file', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-png-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('colors');
    });

    it('should successfully extract theme from WebP file', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-webp-data'), {
          filename: 'test.webp',
          contentType: 'image/webp',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('colors');
    });

    it('should successfully extract theme from GIF file', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-gif-data'), {
          filename: 'test.gif',
          contentType: 'image/gif',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('colors');
    });

    it('should successfully extract theme from valid image URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: new Map([
          ['content-type', 'image/jpeg'],
          ['content-length', '1024000'],
        ]),
        arrayBuffer: async () => new ArrayBuffer(1024),
      });

      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'https://example.com/image.jpg' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('colors');
      expect(response.body.data.colors).toHaveLength(5);
    });

    it('should accept case-insensitive MIME types', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'IMAGE/JPEG',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/theme/extract - Claude API Error Handling', () => {
    it('should handle Claude API errors gracefully', async () => {
      mockMessagesCreate.mockRejectedValue(new Error('API rate limit exceeded'));

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(502);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('EXTERNAL_API_ERROR');
      expect(response.body.error.message).toContain('Claude AI');
    });

    it('should handle malformed Claude API response', async () => {
      mockMessagesCreate.mockResolvedValue({
        content: [
          {
            type: 'text' as const,
            text: 'This is not JSON',
          },
        ],
      });

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(500);

      expect(response.body.error.code).toBe('THEME_EXTRACTION_FAILED');
      expect(response.body.error.message).toContain('JSON');
    });

    it('should handle Claude API response without text content', async () => {
      mockMessagesCreate.mockResolvedValue({
        content: [],
      });

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(500);

      expect(response.body.error.code).toBe('THEME_EXTRACTION_FAILED');
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response structure', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should include error code in all error responses', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .send({ imageUrl: 'http://localhost/test.jpg' })
        .expect(400);

      expect(response.body.error).toHaveProperty('code');
      expect(typeof response.body.error.code).toBe('string');
    });

    it('should include descriptive error message', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect(400);

      expect(response.body.error).toHaveProperty('message');
      expect(typeof response.body.error.message).toBe('string');
      expect(response.body.error.message.length).toBeGreaterThan(0);
    });

    it('should include ISO timestamp in error responses', async () => {
      const response = await request(app)
        .post('/api/theme/extract')
        .expect(400);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return success: false for all errors', async () => {
      const testCases = [
        { send: {} },
        { send: { imageUrl: 'http://localhost/test.jpg' } },
        { attach: true },
      ];

      for (const testCase of testCases) {
        let req = request(app).post('/api/theme/extract');

        if (testCase.send) {
          req = req.send(testCase.send);
        } else if (testCase.attach) {
          req = req.attach('image', Buffer.from('test'), {
            filename: 'test.txt',
            contentType: 'text/plain',
          });
        }

        const response = await req.expect(400);
        expect(response.body).toHaveProperty('success', false);
      }
    });
  });

  describe('Success Response Format', () => {
    it('should return consistent success response structure', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should include request ID if provided in headers', async () => {
      mockMessagesCreate.mockResolvedValue(validThemeResponse);

      const response = await request(app)
        .post('/api/theme/extract')
        .set('X-Request-Id', 'test-request-123')
        .attach('image', Buffer.from('fake-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(200);

      expect(response.body).toHaveProperty('requestId', 'test-request-123');
    });
  });
});

describe('Rate Limiting', () => {
  const rateLimitedApp = createRateLimitedApp();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            colors: ['#FF5733', '#33FF57', '#3357FF'],
            primary: '#FF5733',
            secondary: '#33FF57',
            accent: '#3357FF',
          }),
        },
      ],
    });
  });

  it('should apply AI rate limiting to theme extraction endpoint', async () => {
    // Make 11 requests (limit is 10 per minute)
    const requests = [];
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(rateLimitedApp)
          .post('/api/theme/extract')
          .attach('image', Buffer.from('fake-data'), {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
          })
      );
    }

    const responses = await Promise.all(requests);

    // First 10 should succeed (or return 200/502 depending on mock)
    const successfulRequests = responses.filter(r => r.status !== 429);
    expect(successfulRequests.length).toBeLessThanOrEqual(10);

    // At least one should be rate limited
    const rateLimitedRequests = responses.filter(r => r.status === 429);
    expect(rateLimitedRequests.length).toBeGreaterThan(0);
  });

  it('should return proper error format for rate limited requests', async () => {
    // Make 11 requests to trigger rate limit
    const requests = [];
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(rateLimitedApp)
          .post('/api/theme/extract')
          .attach('image', Buffer.from('fake-data'), {
            filename: 'test.jpg',
            contentType: 'image/jpeg',
          })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.find(r => r.status === 429);

    if (rateLimited) {
      expect(rateLimited.body).toHaveProperty('success', false);
      expect(rateLimited.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
      expect(rateLimited.body.error.message).toContain('rate limit');
    }
  });

  it('should include rate limit headers in responses', async () => {
    const response = await request(rateLimitedApp)
      .post('/api/theme/extract')
      .attach('image', Buffer.from('fake-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    // Rate limiter should add these headers
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers).toHaveProperty('ratelimit-remaining');
  });
});
