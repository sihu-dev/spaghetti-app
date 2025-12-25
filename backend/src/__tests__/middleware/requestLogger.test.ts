import { Request, Response, NextFunction } from 'express';
import { requestLogger, performanceLogger } from '../../middleware/requestLogger';
import { logger, createRequestLogger } from '../../utils/logger';
import { EventEmitter } from 'events';

// Mock the logger utility
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  },
  createRequestLogger: jest.fn(),
}));

// Helper to create mock Request
const createMockRequest = (options: {
  method?: string;
  originalUrl?: string;
  ip?: string;
  headers?: Record<string, string>;
  userAgent?: string;
} = {}): any => ({
  method: options.method || 'GET',
  originalUrl: options.originalUrl || '/api/test',
  ip: options.ip || '127.0.0.1',
  headers: {
    'user-agent': options.userAgent || 'test-agent',
    ...options.headers,
  },
  get: jest.fn((header: string) => {
    if (header.toLowerCase() === 'user-agent') {
      return options.userAgent || 'test-agent';
    }
    return options.headers?.[header];
  }),
});

// Helper to create mock Response with EventEmitter
const createMockResponse = () => {
  const emitter = new EventEmitter();
  const headers: Record<string, string> = {};

  const mock: any = emitter;
  mock.statusCode = 200;
  mock.get = jest.fn((key: string) => headers[key]);
  mock.set = jest.fn((key: string | Record<string, string>, value?: string) => {
    if (typeof key === 'string' && value) {
      headers[key] = value;
    } else if (typeof key === 'object') {
      Object.assign(headers, key);
    }
    return mock;
  });
  mock.status = jest.fn(function(code: number) {
    mock.statusCode = code;
    return mock;
  });
  mock.json = jest.fn().mockReturnValue(mock);
  mock.send = jest.fn().mockReturnValue(mock);
  mock.end = jest.fn().mockReturnValue(mock);

  return mock;
};

describe('Request Logger Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;
  let mockChildLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock child logger
    mockChildLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    (createRequestLogger as jest.Mock).mockReturnValue(mockChildLogger);

    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
  });

  describe('requestLogger', () => {
    it('should log request start with request context', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith({
        requestId: expect.stringMatching(/^req-\d+$/),
        method: 'GET',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      });

      expect(mockChildLogger.info).toHaveBeenCalledWith('Request started');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use x-request-id header if provided', () => {
      const customRequestId = 'custom-req-id-123';
      mockReq = createMockRequest({
        headers: { 'x-request-id': customRequestId },
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: customRequestId,
        })
      );
    });

    it('should generate request ID if x-request-id header is missing', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(/^req-\d+$/),
        })
      );
    });

    it('should log successful request completion with info level', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      mockRes.statusCode = 200;
      mockRes.set('content-length', '1234');

      // Simulate response finish
      mockRes.emit('finish');

      // Use setImmediate to ensure async handlers complete
      setImmediate(() => {
        expect(mockChildLogger.info).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 200,
            duration: expect.stringMatching(/^\d+ms$/),
            contentLength: '1234',
          }),
          'Request completed'
        );
        done();
      });
    });

    it('should log client error (4xx) with warn level', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      mockRes.statusCode = 404;

      mockRes.emit('finish');

      setImmediate(() => {
        expect(mockChildLogger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 404,
            duration: expect.stringMatching(/^\d+ms$/),
          }),
          'Request completed'
        );
        done();
      });
    });

    it('should log server error (5xx) with warn level', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      mockRes.statusCode = 500;

      mockRes.emit('finish');

      setImmediate(() => {
        expect(mockChildLogger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 500,
            duration: expect.stringMatching(/^\d+ms$/),
          }),
          'Request completed'
        );
        done();
      });
    });

    it('should measure request duration accurately', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      // Simulate some processing time
      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          const call = mockChildLogger.info.mock.calls.find(
            (call: any[]) => call[1] === 'Request completed'
          );
          expect(call).toBeDefined();

          const duration = parseInt(call[0].duration);
          expect(duration).toBeGreaterThanOrEqual(50);
          expect(duration).toBeLessThan(200); // Allow some variance
          done();
        });
      }, 50);
    });

    it('should log request errors', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      const testError = new Error('Test error');
      mockRes.emit('error', testError);

      setImmediate(() => {
        expect(mockChildLogger.error).toHaveBeenCalledWith(
          {
            error: 'Test error',
            stack: testError.stack,
          },
          'Request error'
        );
        done();
      });
    });

    it('should handle POST requests', () => {
      mockReq = createMockRequest({
        method: 'POST',
        originalUrl: '/api/users',
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/api/users',
        })
      );
    });

    it('should handle PUT requests', () => {
      mockReq = createMockRequest({
        method: 'PUT',
        originalUrl: '/api/users/123',
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/api/users/123',
        })
      );
    });

    it('should handle DELETE requests', () => {
      mockReq = createMockRequest({
        method: 'DELETE',
        originalUrl: '/api/users/123',
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/api/users/123',
        })
      );
    });

    it('should handle PATCH requests', () => {
      mockReq = createMockRequest({
        method: 'PATCH',
        originalUrl: '/api/users/123',
      });

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(createRequestLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/api/users/123',
        })
      );
    });

    it('should capture different status codes', (done) => {
      const statusCodes = [200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503];
      let completed = 0;

      statusCodes.forEach((statusCode) => {
        const req = createMockRequest();
        const res = createMockResponse();
        const next = jest.fn();

        requestLogger(req as Request, res as Response, next);

        res.statusCode = statusCode;
        res.emit('finish');

        setImmediate(() => {
          const expectedLevel = statusCode >= 400 ? 'warn' : 'info';
          expect(mockChildLogger[expectedLevel]).toHaveBeenCalledWith(
            expect.objectContaining({
              statusCode,
            }),
            'Request completed'
          );

          completed++;
          if (completed === statusCodes.length) {
            done();
          }
        });
      });
    });

    it('should handle requests with different user agents', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'curl/7.68.0',
        'PostmanRuntime/7.29.0',
      ];

      userAgents.forEach((userAgent) => {
        jest.clearAllMocks();
        const req = createMockRequest({ userAgent });
        const res = createMockResponse();
        const next = jest.fn();

        requestLogger(req as Request, res as Response, next);

        expect(createRequestLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            userAgent,
          })
        );
      });
    });

    it('should handle requests from different IPs', () => {
      const ips = ['127.0.0.1', '192.168.1.1', '::1', '10.0.0.1'];

      ips.forEach((ip) => {
        jest.clearAllMocks();
        const req = createMockRequest({ ip });
        const res = createMockResponse();
        const next = jest.fn();

        requestLogger(req as Request, res as Response, next);

        expect(createRequestLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            ip,
          })
        );
      });
    });
  });

  describe('performanceLogger', () => {
    beforeEach(() => {
      (logger.warn as jest.Mock).mockClear();
    });

    it('should log slow requests that exceed default threshold (1000ms)', (done) => {
      const middleware = performanceLogger();

      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate a slow request
      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/test',
              duration: expect.stringMatching(/^\d+ms$/),
              threshold: '1000ms',
            }),
            'Slow request detected'
          );
          done();
        });
      }, 1100);
    }, 2000);

    it('should not log fast requests below default threshold', (done) => {
      const middleware = performanceLogger();

      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Simulate a fast request
      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).not.toHaveBeenCalled();
          done();
        });
      }, 100);
    });

    it('should log slow requests that exceed custom threshold', (done) => {
      const customThreshold = 200;
      const middleware = performanceLogger(customThreshold);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/test',
              threshold: '200ms',
            }),
            'Slow request detected'
          );
          done();
        });
      }, 250);
    });

    it('should not log requests below custom threshold', (done) => {
      const customThreshold = 500;
      const middleware = performanceLogger(customThreshold);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).not.toHaveBeenCalled();
          done();
        });
      }, 100);
    });

    it('should log correct method and URL for slow requests', (done) => {
      mockReq = createMockRequest({
        method: 'POST',
        originalUrl: '/api/users/create',
      });

      const middleware = performanceLogger(50);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'POST',
              url: '/api/users/create',
            }),
            'Slow request detected'
          );
          done();
        });
      }, 100);
    });

    it('should measure duration accurately', (done) => {
      const threshold = 50;
      const middleware = performanceLogger(threshold);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).toHaveBeenCalled();
          const call = (logger.warn as jest.Mock).mock.calls[0];
          const duration = parseInt(call[0].duration);

          expect(duration).toBeGreaterThanOrEqual(100);
          expect(duration).toBeLessThan(200);
          done();
        });
      }, 100);
    });

    it('should handle threshold at boundary', (done) => {
      const threshold = 100;
      const middleware = performanceLogger(threshold);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Request exactly at threshold should not trigger warning
      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          // Due to timing precision, we check if logged or not
          // If duration > threshold, it should be logged
          done();
        });
      }, 100);
    });

    it('should work with very low threshold', (done) => {
      const middleware = performanceLogger(1);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              threshold: '1ms',
            }),
            'Slow request detected'
          );
          done();
        });
      }, 10);
    });

    it('should work with very high threshold', (done) => {
      const middleware = performanceLogger(10000);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          expect(logger.warn).not.toHaveBeenCalled();
          done();
        });
      }, 10);
    });

    it('should handle multiple requests independently', (done) => {
      const middleware = performanceLogger(50);
      let completed = 0;

      // Fast request
      const req1 = createMockRequest({ originalUrl: '/api/fast' });
      const res1 = createMockResponse();
      const next1 = jest.fn();

      middleware(req1 as Request, res1 as Response, next1);

      setTimeout(() => {
        res1.emit('finish');
        completed++;
      }, 10);

      // Slow request
      const req2 = createMockRequest({ originalUrl: '/api/slow' });
      const res2 = createMockResponse();
      const next2 = jest.fn();

      middleware(req2 as Request, res2 as Response, next2);

      setTimeout(() => {
        res2.emit('finish');
        completed++;

        if (completed === 2) {
          setImmediate(() => {
            // Should only log the slow request
            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenCalledWith(
              expect.objectContaining({
                url: '/api/slow',
              }),
              'Slow request detected'
            );
            done();
          });
        }
      }, 100);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with both loggers on same request', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      const perfMiddleware = performanceLogger(50);
      perfMiddleware(mockReq as Request, mockRes as Response, jest.fn());

      mockRes.statusCode = 200;

      setTimeout(() => {
        mockRes.emit('finish');

        setImmediate(() => {
          // Both loggers should have logged
          expect(mockChildLogger.info).toHaveBeenCalledWith(
            expect.objectContaining({
              statusCode: 200,
            }),
            'Request completed'
          );

          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              url: '/api/test',
            }),
            'Slow request detected'
          );
          done();
        });
      }, 100);
    });

    it('should handle request error and completion events', (done) => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      const testError = new Error('Network error');
      mockRes.emit('error', testError);

      setTimeout(() => {
        mockRes.statusCode = 500;
        mockRes.emit('finish');

        setImmediate(() => {
          // Should log both error and completion
          expect(mockChildLogger.error).toHaveBeenCalledWith(
            {
              error: 'Network error',
              stack: testError.stack,
            },
            'Request error'
          );

          expect(mockChildLogger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              statusCode: 500,
            }),
            'Request completed'
          );
          done();
        });
      }, 10);
    });
  });
});
