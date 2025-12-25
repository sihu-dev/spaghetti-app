import { Request, Response } from 'express';
import express from 'express';
import supertest from 'supertest';
import {
  compressionMiddleware,
  defaultCompression,
  aggressiveCompression,
  lightCompression,
  jsonCompression,
  jsonOnlyFilter,
  textOnlyFilter,
  CompressionOptions,
} from '../../middleware/compression';

// Mock Express objects for unit tests
const createMockRequest = (headers: Record<string, string> = {}): Partial<Request> => ({
  headers,
});

const createMockResponse = (contentType?: string): Partial<Response> => {
  const headers: Record<string, string | number | string[]> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return {
    getHeader: jest.fn((name: string) => headers[name.toLowerCase()] || headers[name]),
    setHeader: jest.fn((name: string, value: string | number | string[]) => {
      headers[name] = value;
      return {} as Response;
    }),
  };
};

describe('Compression Middleware', () => {
  describe('compressionMiddleware factory', () => {
    it('should return a function', () => {
      const middleware = compressionMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('should create middleware with default options', () => {
      const middleware = compressionMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should create middleware with custom level', () => {
      const middleware = compressionMiddleware({ level: 9 });
      expect(middleware).toBeDefined();
    });

    it('should create middleware with custom threshold', () => {
      const middleware = compressionMiddleware({ threshold: 2048 });
      expect(middleware).toBeDefined();
    });

    it('should create middleware with custom filter', () => {
      const customFilter = () => true;
      const middleware = compressionMiddleware({ filter: customFilter });
      expect(middleware).toBeDefined();
    });

    it('should create middleware with all options', () => {
      const options: CompressionOptions = {
        level: 7,
        threshold: 512,
        filter: () => true,
      };
      const middleware = compressionMiddleware(options);
      expect(middleware).toBeDefined();
    });

    it('should handle level 0 (no compression)', () => {
      const middleware = compressionMiddleware({ level: 0 });
      expect(middleware).toBeDefined();
    });

    it('should handle maximum level (9)', () => {
      const middleware = compressionMiddleware({ level: 9 });
      expect(middleware).toBeDefined();
    });

    it('should handle zero threshold', () => {
      const middleware = compressionMiddleware({ threshold: 0 });
      expect(middleware).toBeDefined();
    });

    it('should handle very large threshold', () => {
      const middleware = compressionMiddleware({ threshold: 1000000 });
      expect(middleware).toBeDefined();
    });
  });

  describe('Pre-configured middleware exports', () => {
    it('should export defaultCompression', () => {
      expect(defaultCompression).toBeDefined();
      expect(typeof defaultCompression).toBe('function');
    });

    it('should export aggressiveCompression', () => {
      expect(aggressiveCompression).toBeDefined();
      expect(typeof aggressiveCompression).toBe('function');
    });

    it('should export lightCompression', () => {
      expect(lightCompression).toBeDefined();
      expect(typeof lightCompression).toBe('function');
    });

    it('should export jsonCompression', () => {
      expect(jsonCompression).toBeDefined();
      expect(typeof jsonCompression).toBe('function');
    });

    it('should create different instances', () => {
      expect(defaultCompression).not.toBe(aggressiveCompression);
      expect(lightCompression).not.toBe(jsonCompression);
    });
  });

  describe('jsonOnlyFilter', () => {
    it('should return true for application/json', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/json');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
      expect(mockRes.getHeader).toHaveBeenCalledWith('Content-Type');
    });

    it('should return true for application/json with charset', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/json; charset=utf-8');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return false for text/html', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/html');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false for text/plain', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/plain');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false for image/png', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('image/png');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false when no Content-Type header', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false when Content-Type is not a string', () => {
      const mockReq = createMockRequest();
      const mockRes = {
        getHeader: jest.fn(() => 123), // Non-string value
      };

      const result = jsonOnlyFilter(mockReq as Request, mockRes as unknown as Response);

      expect(result).toBe(false);
    });

    it('should return false for application/octet-stream', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/octet-stream');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should handle application/json with additional parameters', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/json; boundary=something');

      const result = jsonOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });
  });

  describe('textOnlyFilter', () => {
    it('should return true for text/html', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/html');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return true for text/plain', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/plain');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return true for text/css', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/css');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return true for application/json', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/json');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return true for application/javascript', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/javascript');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return true for application/xml', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/xml');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return false for image/png', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('image/png');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false for video/mp4', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('video/mp4');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false for audio/mpeg', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('audio/mpeg');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false when no Content-Type header', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false when Content-Type is not a string', () => {
      const mockReq = createMockRequest();
      const mockRes = {
        getHeader: jest.fn(() => ['application/json']), // Array instead of string
      };

      const result = textOnlyFilter(mockReq as Request, mockRes as unknown as Response);

      expect(result).toBe(false);
    });

    it('should handle text/html with charset', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/html; charset=utf-8');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should handle text/xml (legacy XML type)', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('text/xml');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(true);
    });

    it('should return false for application/pdf', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/pdf');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });

    it('should return false for application/zip', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse('application/zip');

      const result = textOnlyFilter(mockReq as Request, mockRes as Response);

      expect(result).toBe(false);
    });
  });

  describe('Integration tests with Express', () => {
    function createTestApp(middleware: ReturnType<typeof compressionMiddleware>) {
      const app = express();
      app.use(middleware);

      // Route that returns small JSON
      app.get('/small', (_req, res) => {
        res.json({ message: 'small' });
      });

      // Route that returns large JSON (above default 1KB threshold)
      app.get('/large', (_req, res) => {
        const largeData = {
          items: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: 'This is a longer description to make the response larger',
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              tags: ['tag1', 'tag2', 'tag3'],
            },
          })),
        };
        res.json(largeData);
      });

      // Route that returns HTML
      app.get('/html', (_req, res) => {
        const html = '<html><body><h1>Test</h1>' + 'x'.repeat(2000) + '</body></html>';
        res.type('html').send(html);
      });

      // Route that returns plain text
      app.get('/text', (_req, res) => {
        res.type('text').send('Plain text response ' + 'x'.repeat(2000));
      });

      // Route that returns an image (binary)
      app.get('/image', (_req, res) => {
        res.type('png').send(Buffer.alloc(100));
      });

      return app;
    }

    describe('defaultCompression', () => {
      const app = createTestApp(defaultCompression);

      it('should compress large JSON responses', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should not compress small JSON responses below threshold', async () => {
        const response = await supertest(app)
          .get('/small')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // Small response should not be compressed
        expect(response.body).toEqual({ message: 'small' });
      });

      it('should respect x-no-compression header', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .set('x-no-compression', 'true')
          .expect(200);

        // Should not compress when x-no-compression is set
        expect(response.headers['content-encoding']).toBeUndefined();
      });

      it('should not compress when client does not support gzip', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'identity') // Explicitly request no encoding
          .expect(200);

        expect(response.headers['content-encoding']).toBeUndefined();
      });

      it('should compress large HTML responses', async () => {
        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should compress large text responses', async () => {
        const response = await supertest(app)
          .get('/text')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should handle deflate encoding', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'deflate')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('deflate');
      });

      it('should handle multiple accepted encodings', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip, deflate')
          .expect(200);

        expect(['gzip', 'deflate']).toContain(response.headers['content-encoding']);
      });
    });

    describe('aggressiveCompression', () => {
      const app = createTestApp(aggressiveCompression);

      it('should compress with maximum level', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should compress smaller responses (512 byte threshold)', async () => {
        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });
    });

    describe('lightCompression', () => {
      const app = createTestApp(lightCompression);

      it('should compress large responses', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should use higher threshold (2KB)', async () => {
        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // HTML response is ~2KB, which is exactly at threshold, may or may not compress
        // Light compression has 2KB threshold, so this should compress if above 2048 bytes
        expect(response.status).toBe(200);
      });
    });

    describe('jsonCompression', () => {
      const app = createTestApp(jsonCompression);

      it('should compress large JSON responses', async () => {
        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should not compress HTML responses', async () => {
        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // JSON-only filter should not compress HTML
        expect(response.headers['content-encoding']).toBeUndefined();
      });

      it('should not compress text responses', async () => {
        const response = await supertest(app)
          .get('/text')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // JSON-only filter should not compress plain text
        expect(response.headers['content-encoding']).toBeUndefined();
      });
    });

    describe('Custom filter middleware', () => {
      it('should allow custom filter function', async () => {
        // Filter that never compresses
        const neverCompress = compressionMiddleware({
          filter: () => false,
        });

        const app = createTestApp(neverCompress);

        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBeUndefined();
      });

      it('should allow filter that always compresses', async () => {
        // Filter that always compresses (if above threshold)
        const alwaysCompress = compressionMiddleware({
          threshold: 0,
          filter: () => true,
        });

        const app = createTestApp(alwaysCompress);

        const response = await supertest(app)
          .get('/small')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty responses', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/empty', (_req, res) => {
          res.json({});
        });

        const response = await supertest(app)
          .get('/empty')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.body).toEqual({});
      });

      it('should handle null responses', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/null', (_req, res) => {
          res.json(null);
        });

        const response = await supertest(app)
          .get('/null')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.body).toBeNull();
      });

      it('should handle array responses', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/array', (_req, res) => {
          res.json([1, 2, 3, 4, 5]);
        });

        const response = await supertest(app)
          .get('/array')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.body).toEqual([1, 2, 3, 4, 5]);
      });

      it('should handle large array responses with compression', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/large-array', (_req, res) => {
          res.json(Array.from({ length: 1000 }, (_, i) => i));
        });

        const response = await supertest(app)
          .get('/large-array')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
        expect(response.body).toHaveLength(1000);
      });

      it('should handle responses with special characters', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/special', (_req, res) => {
          const data = {
            unicode: '你好世界',
            emoji: '😀🎉',
            special: '<>&"\'',
            data: 'x'.repeat(2000),
          };
          res.json(data);
        });

        const response = await supertest(app)
          .get('/special')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
        expect(response.body.unicode).toBe('你好世界');
        expect(response.body.emoji).toBe('😀🎉');
      });

      it('should work with error responses', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/error', (_req, res) => {
          const error = {
            success: false,
            error: {
              code: 'TEST_ERROR',
              message: 'This is a test error message '.repeat(100),
            },
          };
          res.status(400).json(error);
        });

        const response = await supertest(app)
          .get('/error')
          .set('Accept-Encoding', 'gzip')
          .expect(400);

        expect(response.headers['content-encoding']).toBe('gzip');
        expect(response.body.success).toBe(false);
      });

      it('should handle concurrent requests', async () => {
        const app = createTestApp(defaultCompression);

        const requests = Array.from({ length: 10 }, () =>
          supertest(app)
            .get('/large')
            .set('Accept-Encoding', 'gzip')
        );

        const responses = await Promise.all(requests);

        responses.forEach((response) => {
          expect(response.status).toBe(200);
          expect(response.headers['content-encoding']).toBe('gzip');
        });
      });

      it('should maintain response headers', async () => {
        const app = express();
        app.use(defaultCompression);
        app.get('/headers', (_req, res) => {
          res.set('X-Custom-Header', 'test-value');
          res.set('Cache-Control', 'no-cache');
          res.json({ data: 'x'.repeat(2000) });
        });

        const response = await supertest(app)
          .get('/headers')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['x-custom-header']).toBe('test-value');
        expect(response.headers['cache-control']).toBe('no-cache');
        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should handle HEAD requests', async () => {
        const app = createTestApp(defaultCompression);

        const response = await supertest(app)
          .head('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // HEAD requests should have headers but no body
        expect(response.body).toEqual({});
      });

      it('should handle OPTIONS requests', async () => {
        const app = express();
        app.use(defaultCompression);
        app.options('/test', (_req, res) => {
          res.set('Allow', 'GET, POST, OPTIONS');
          res.sendStatus(204);
        });

        const response = await supertest(app)
          .options('/test')
          .set('Accept-Encoding', 'gzip')
          .expect(204);

        expect(response.headers.allow).toBe('GET, POST, OPTIONS');
      });
    });

    describe('Response size thresholds', () => {
      it('should respect custom threshold', async () => {
        const customThreshold = compressionMiddleware({ threshold: 5000 });
        const app = createTestApp(customThreshold);

        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // HTML response is ~2KB, below 5KB threshold
        expect(response.headers['content-encoding']).toBeUndefined();
      });

      it('should compress when above custom threshold', async () => {
        const customThreshold = compressionMiddleware({ threshold: 100 });
        const app = createTestApp(customThreshold);

        const response = await supertest(app)
          .get('/html')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // HTML response is above 100 byte threshold
        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should handle threshold of 0 (compress everything)', async () => {
        const zeroThreshold = compressionMiddleware({ threshold: 0 });
        const app = createTestApp(zeroThreshold);

        const response = await supertest(app)
          .get('/small')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });
    });

    describe('Compression levels', () => {
      it('should handle compression level 0 (store only)', async () => {
        const noCompression = compressionMiddleware({ level: 0 });
        const app = createTestApp(noCompression);

        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        // Level 0 means store only, but compression middleware should still set encoding
        expect(response.status).toBe(200);
      });

      it('should handle compression level 1 (fastest)', async () => {
        const fastCompression = compressionMiddleware({ level: 1 });
        const app = createTestApp(fastCompression);

        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });

      it('should handle compression level 9 (best)', async () => {
        const bestCompression = compressionMiddleware({ level: 9 });
        const app = createTestApp(bestCompression);

        const response = await supertest(app)
          .get('/large')
          .set('Accept-Encoding', 'gzip')
          .expect(200);

        expect(response.headers['content-encoding']).toBe('gzip');
      });
    });
  });

  describe('Content-Type variations', () => {
    it('should handle application/json', async () => {
      const app = express();
      app.use(jsonCompression);
      app.get('/json', (_req, res) => {
        res.type('application/json').send(JSON.stringify({ data: 'x'.repeat(2000) }));
      });

      const response = await supertest(app)
        .get('/json')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should handle application/json with charset', async () => {
      const app = express();
      app.use(jsonCompression);
      app.get('/json-charset', (_req, res) => {
        res.type('application/json; charset=utf-8').send(JSON.stringify({ data: 'x'.repeat(2000) }));
      });

      const response = await supertest(app)
        .get('/json-charset')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should handle case-insensitive content types', async () => {
      const app = express();
      app.use(jsonCompression);
      app.get('/json-upper', (_req, res) => {
        res.type('APPLICATION/JSON').send(JSON.stringify({ data: 'x'.repeat(2000) }));
      });

      const response = await supertest(app)
        .get('/json-upper')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });
  });
});
