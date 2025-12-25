import { Request, Response, NextFunction } from 'express';
import { metricsMiddleware } from '../../middleware/metrics';
import {
  httpRequestsTotal,
  httpRequestDurationMs,
  activeConnections,
} from '../../utils/metrics';

// Mock the metrics utilities
jest.mock('../../utils/metrics', () => ({
  httpRequestsTotal: {
    inc: jest.fn(),
  },
  httpRequestDurationMs: {
    observe: jest.fn(),
  },
  activeConnections: {
    inc: jest.fn(),
    dec: jest.fn(),
  },
}));

// Mock Date.now() for consistent timing tests
const mockDateNow = jest.spyOn(Date, 'now');

// Mock Express objects
const createMockResponse = (): Partial<Response> & {
  eventHandlers: Record<string, Function>;
  statusCode: number;
  writableEnded: boolean;
} => {
  const eventHandlers: Record<string, Function> = {};
  const response: any = {
    statusCode: 200,
    writableEnded: false,
    eventHandlers,
  };
  response.on = jest.fn((event: string, handler: Function) => {
    eventHandlers[event] = handler;
    return response;
  });
  return response;
};

const createMockRequest = (
  method: string = 'GET',
  path: string = '/api/test',
  route?: { path: string },
  baseUrl: string = ''
): Partial<Request> => ({
  method,
  path,
  route,
  baseUrl,
});

describe('Metrics Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: ReturnType<typeof createMockResponse>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
    jest.clearAllMocks();
    mockDateNow.mockClear();
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  describe('metricsMiddleware', () => {
    it('should skip metrics endpoint itself', () => {
      mockReq = createMockRequest('GET', '/metrics');

      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(activeConnections.inc).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should increment active connections when request starts', () => {
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(activeConnections.inc).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should track request metrics on finish event', () => {
      mockReq = createMockRequest('POST', '/api/users');
      mockRes.statusCode = 201;

      mockDateNow.mockReturnValueOnce(1000);
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the finish event
      mockDateNow.mockReturnValueOnce(1250);
      mockRes.eventHandlers['finish']();

      expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
        method: 'POST',
        route: '/api/users',
        status_code: '201',
      });

      expect(httpRequestDurationMs.observe).toHaveBeenCalledWith(
        {
          method: 'POST',
          route: '/api/users',
          status_code: '201',
        },
        250
      );

      expect(activeConnections.dec).toHaveBeenCalledTimes(1);
    });

    it('should use matched route pattern when available', () => {
      mockReq = createMockRequest(
        'GET',
        '/api/users/123',
        { path: '/users/:id' },
        '/api'
      );
      mockRes.statusCode = 200;

      mockDateNow.mockReturnValueOnce(1000);
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the finish event
      mockDateNow.mockReturnValueOnce(1100);
      mockRes.eventHandlers['finish']();

      expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
        method: 'GET',
        route: '/api/users/:id',
        status_code: '200',
      });

      expect(httpRequestDurationMs.observe).toHaveBeenCalledWith(
        {
          method: 'GET',
          route: '/api/users/:id',
          status_code: '200',
        },
        100
      );
    });

    it('should decrement active connections on close event if not ended', () => {
      mockRes.writableEnded = false;

      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the close event
      mockRes.eventHandlers['close']();

      expect(activeConnections.dec).toHaveBeenCalledTimes(1);
    });

    it('should not decrement active connections on close event if already ended', () => {
      mockRes.writableEnded = true;

      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the close event
      mockRes.eventHandlers['close']();

      // Should not be called because writableEnded is true
      expect(activeConnections.dec).not.toHaveBeenCalled();
    });

    it('should track different HTTP methods correctly', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach((method) => {
        jest.clearAllMocks();

        mockReq = createMockRequest(method, '/api/resource');
        mockRes = createMockResponse();
        mockRes.statusCode = 200;

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1050);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method,
          route: '/api/resource',
          status_code: '200',
        });
      });
    });

    it('should track different status codes correctly', () => {
      const statusCodes = [200, 201, 400, 404, 500];

      statusCodes.forEach((statusCode) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', '/api/test');
        mockRes = createMockResponse();
        mockRes.statusCode = statusCode;

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1050);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: '/api/test',
          status_code: statusCode.toString(),
        });
      });
    });

    it('should calculate request duration accurately', () => {
      const testCases = [
        { start: 1000, end: 1050, expected: 50 },
        { start: 2000, end: 2500, expected: 500 },
        { start: 3000, end: 5000, expected: 2000 },
      ];

      testCases.forEach(({ start, end, expected }) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', '/api/test');
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(start);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(end);
        mockRes.eventHandlers['finish']();

        expect(httpRequestDurationMs.observe).toHaveBeenCalledWith(
          expect.any(Object),
          expected
        );
      });
    });
  });

  describe('Route Normalization', () => {
    it('should normalize UUID in path', () => {
      const uuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      ];

      uuids.forEach((uuid) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', `/api/users/${uuid}`);
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1100);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: '/api/users/:id',
          status_code: '200',
        });
      });
    });

    it('should normalize numeric IDs in path', () => {
      const testCases = [
        { path: '/api/users/123', expected: '/api/users/:id' },
        { path: '/api/users/123/posts', expected: '/api/users/:id/posts' },
        { path: '/api/users/456/posts/789', expected: '/api/users/:id/posts/:id' },
        { path: '/api/items/1', expected: '/api/items/:id' },
      ];

      testCases.forEach(({ path, expected }) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', path);
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1100);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: expected,
          status_code: '200',
        });
      });
    });

    it('should normalize base64-like tokens in path', () => {
      const testCases = [
        {
          path: '/api/reset/AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
          expected: '/api/reset/:token',
        },
        {
          path: '/api/verify/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
          expected: '/api/verify/:token',
        },
        {
          path: '/api/auth/TokenWith20CharactersMin',
          expected: '/api/auth/:token',
        },
      ];

      testCases.forEach(({ path, expected }) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', path);
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1100);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: expected,
          status_code: '200',
        });
      });
    });

    it('should normalize mixed patterns in complex paths', () => {
      const testCases = [
        {
          path: '/api/users/123/posts/456e7890-e89b-12d3-a456-426614174000/comments/789',
          expected: '/api/users/:id/posts/:id/comments/:id',
        },
        {
          path: '/api/documents/abc123def456ghi789jkl012/download',
          expected: '/api/documents/:token/download',
        },
      ];

      testCases.forEach(({ path, expected }) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', path);
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1100);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: expected,
          status_code: '200',
        });
      });
    });

    it('should not normalize paths without dynamic segments', () => {
      const staticPaths = [
        '/api/users',
        '/api/health',
        '/api/auth/login',
        '/api/v1/status',
      ];

      staticPaths.forEach((path) => {
        jest.clearAllMocks();

        mockReq = createMockRequest('GET', path);
        mockRes = createMockResponse();

        mockDateNow.mockReturnValueOnce(1000);
        metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
        mockDateNow.mockReturnValueOnce(1100);
        mockRes.eventHandlers['finish']();

        expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: path,
          status_code: '200',
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests with no route information', () => {
      mockReq = createMockRequest('GET', '/unknown/path');
      mockRes = createMockResponse();
      mockRes.statusCode = 404;

      mockDateNow.mockReturnValueOnce(1000);
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);
      mockDateNow.mockReturnValueOnce(1150);
      mockRes.eventHandlers['finish']();

      expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
        method: 'GET',
        route: '/unknown/path',
        status_code: '404',
      });
    });

    it('should handle both finish and close events correctly', () => {
      mockReq = createMockRequest('GET', '/api/test');
      mockRes = createMockResponse();
      mockRes.statusCode = 200;

      mockDateNow.mockReturnValueOnce(1000);
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // First, trigger finish event
      mockDateNow.mockReturnValueOnce(1100);
      mockRes.eventHandlers['finish']();
      expect(activeConnections.dec).toHaveBeenCalledTimes(1);

      // Then, trigger close event with writableEnded = true (simulating normal completion)
      mockRes.writableEnded = true;
      mockRes.eventHandlers['close']();

      // Should still be 1 because writableEnded is true
      expect(activeConnections.dec).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected connection close before finish', () => {
      mockReq = createMockRequest('GET', '/api/test');
      mockRes.writableEnded = false;

      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Increment was called on start
      expect(activeConnections.inc).toHaveBeenCalledTimes(1);

      // Simulate unexpected close without finish
      mockRes.eventHandlers['close']();

      // Decrement should be called once
      expect(activeConnections.dec).toHaveBeenCalledTimes(1);
    });

    it('should register finish and close event handlers', () => {
      metricsMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(mockRes.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });
});
