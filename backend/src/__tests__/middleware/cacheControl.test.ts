import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  noCache,
  privateCache,
  publicCache,
  cacheControl,
  securityHeaders,
  etag,
} from '../../middleware/cacheControl';

// Mock Express objects
const createMockResponse = (): Partial<Response> => {
  const headers: Record<string, string> = {};
  return {
    set: jest.fn((key: string | Record<string, string>, value?: string) => {
      if (typeof key === 'string' && value) {
        headers[key] = value;
      } else if (typeof key === 'object') {
        Object.assign(headers, key);
      }
      return {} as Response;
    }),
    get: jest.fn((key: string) => headers[key]),
    status: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const createMockRequest = (headers: Record<string, string> = {}): Partial<Request> => ({
  headers,
});

describe('Cache Control Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
  });

  describe('noCache', () => {
    it('should set no-cache headers', () => {
      noCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next exactly once', () => {
      noCache(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set headers before calling next', () => {
      const callOrder: string[] = [];
      mockRes.set = jest.fn(() => {
        callOrder.push('set');
        return {} as Response;
      });
      mockNext = jest.fn(() => {
        callOrder.push('next');
      });

      noCache(mockReq as Request, mockRes as Response, mockNext);

      expect(callOrder).toEqual(['set', 'next']);
    });
  });

  describe('privateCache', () => {
    it('should set private cache headers with default max-age', () => {
      privateCache()(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'private, max-age=60, must-revalidate',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set private cache headers with custom max-age', () => {
      privateCache(300)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'private, max-age=300, must-revalidate',
      });
    });

    it('should handle max-age of 0', () => {
      privateCache(0)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'private, max-age=0, must-revalidate',
      });
    });

    it('should handle large max-age values', () => {
      privateCache(31536000)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'private, max-age=31536000, must-revalidate',
      });
    });

    it('should return a middleware function', () => {
      const middleware = privateCache(120);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // should accept req, res, next
    });

    it('should always include must-revalidate directive', () => {
      privateCache(1)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Cache-Control': expect.stringContaining('must-revalidate'),
        })
      );
    });

    it('should call next exactly once', () => {
      privateCache(180)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('publicCache', () => {
    it('should set public cache headers with default max-age', () => {
      publicCache()(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=3600',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set public cache headers with custom max-age', () => {
      publicCache(86400)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=86400',
      });
    });

    it('should handle max-age of 0', () => {
      publicCache(0)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=0',
      });
    });

    it('should handle very short cache times', () => {
      publicCache(1)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=1',
      });
    });

    it('should handle very long cache times', () => {
      publicCache(31536000)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=31536000',
      });
    });

    it('should return a middleware function', () => {
      const middleware = publicCache(7200);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3);
    });

    it('should call next exactly once', () => {
      publicCache(3600)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not include must-revalidate by default', () => {
      publicCache(3600)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Cache-Control': expect.not.stringContaining('must-revalidate'),
        })
      );
    });
  });

  describe('cacheControl', () => {
    it('should set no-store when specified', () => {
      cacheControl({ noStore: true })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set private with max-age', () => {
      cacheControl({ private: true, maxAge: 120 })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'private, max-age=120');
    });

    it('should set public with max-age and must-revalidate', () => {
      cacheControl({ maxAge: 600, mustRevalidate: true })(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=600, must-revalidate');
    });

    it('should default to public when private is not set', () => {
      cacheControl({ maxAge: 300 })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
    });

    it('should handle private without maxAge', () => {
      cacheControl({ private: true })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'private');
    });

    it('should handle public without maxAge', () => {
      cacheControl({})(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public');
    });

    it('should handle public with must-revalidate but no maxAge', () => {
      cacheControl({ mustRevalidate: true })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, must-revalidate');
    });

    it('should handle private with must-revalidate', () => {
      cacheControl({ private: true, maxAge: 60, mustRevalidate: true })(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'private, max-age=60, must-revalidate');
    });

    it('should ignore other options when noStore is true', () => {
      cacheControl({ noStore: true, maxAge: 300, private: true, mustRevalidate: true })(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    });

    it('should handle maxAge of 0', () => {
      cacheControl({ maxAge: 0 })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=0');
    });

    it('should handle very large maxAge', () => {
      cacheControl({ maxAge: 31536000 })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=31536000');
    });

    it('should return a middleware function', () => {
      const middleware = cacheControl({ maxAge: 120 });
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3);
    });

    it('should call next exactly once', () => {
      cacheControl({ maxAge: 300 })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should properly format directive order', () => {
      cacheControl({ private: true, maxAge: 600, mustRevalidate: true })(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      const cacheControlHeader = (mockRes.set as jest.Mock).mock.calls[0][1];
      expect(cacheControlHeader).toBe('private, max-age=600, must-revalidate');
    });

    it('should handle multiple middleware instances independently', () => {
      const middleware1 = cacheControl({ private: true, maxAge: 60 });
      const middleware2 = cacheControl({ maxAge: 300 });

      const mockRes1 = createMockResponse();
      const mockRes2 = createMockResponse();

      middleware1(mockReq as Request, mockRes1 as Response, mockNext);
      middleware2(mockReq as Request, mockRes2 as Response, mockNext);

      expect(mockRes1.set).toHaveBeenCalledWith('Cache-Control', 'private, max-age=60');
      expect(mockRes2.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
    });
  });

  describe('securityHeaders', () => {
    it('should set security headers', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next exactly once', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set all required security headers', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      const setCall = (mockRes.set as jest.Mock).mock.calls[0][0];
      expect(setCall).toHaveProperty('X-Content-Type-Options');
      expect(setCall).toHaveProperty('X-Frame-Options');
      expect(setCall).toHaveProperty('X-XSS-Protection');
      expect(setCall).toHaveProperty('Referrer-Policy');
    });

    it('should set X-Frame-Options to DENY', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-Frame-Options': 'DENY',
        })
      );
    });
  });

  describe('etag', () => {
    it('should add ETag header to JSON response', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Call the wrapped json method
      const body = { test: 'data' };
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });

    it('should generate consistent ETags for same content', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = { test: 'data', value: 123 };
      (mockRes.json as jest.Mock)(body);

      const firstEtag = (mockRes.set as jest.Mock).mock.calls[0][1];

      // Reset and test again
      jest.clearAllMocks();
      mockRes.json = originalJson;
      const middleware2 = etag();
      middleware2(mockReq as Request, mockRes as Response, mockNext);
      (mockRes.json as jest.Mock)(body);

      const secondEtag = (mockRes.set as jest.Mock).mock.calls[0][1];

      expect(firstEtag).toBe(secondEtag);
    });

    it('should generate different ETags for different content', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body1 = { test: 'data1' };
      (mockRes.json as jest.Mock)(body1);

      const firstEtag = (mockRes.set as jest.Mock).mock.calls[0][1];

      // Reset and test with different content
      jest.clearAllMocks();
      mockRes.json = originalJson;
      const middleware2 = etag();
      middleware2(mockReq as Request, mockRes as Response, mockNext);

      const body2 = { test: 'data2' };
      (mockRes.json as jest.Mock)(body2);

      const secondEtag = (mockRes.set as jest.Mock).mock.calls[0][1];

      expect(firstEtag).not.toBe(secondEtag);
    });

    it('should return 304 when If-None-Match matches', () => {
      const body = { test: 'data' };
      const bodyString = JSON.stringify(body);
      const expectedEtag = `"${crypto.createHash('md5').update(bodyString).digest('hex')}"`;

      mockReq = createMockRequest({ 'if-none-match': expectedEtag });
      const middleware = etag();

      mockRes.json = jest.fn().mockReturnValue(mockRes);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Call json with the same body
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.status).toHaveBeenCalledWith(304);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should not return 304 when If-None-Match does not match', () => {
      const body = { test: 'data' };

      mockReq = createMockRequest({ 'if-none-match': '"different-etag"' });
      const middleware = etag();

      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Call json
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.status).not.toHaveBeenCalledWith(304);
      expect(originalJson).toHaveBeenCalledWith(body);
    });

    it('should handle requests without If-None-Match header', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = { test: 'data' };
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.status).not.toHaveBeenCalledWith(304);
      expect(originalJson).toHaveBeenCalledWith(body);
    });

    it('should preserve original json behavior', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = { test: 'data', nested: { value: 123 } };
      (mockRes.json as jest.Mock)(body);

      expect(originalJson).toHaveBeenCalledWith(body);
    });

    it('should return a middleware function', () => {
      const middleware = etag();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3);
    });

    it('should call next exactly once', () => {
      const middleware = etag();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle complex objects', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = {
        id: 1,
        name: 'Test',
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      };
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
      expect(originalJson).toHaveBeenCalledWith(body);
    });

    it('should handle empty objects', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = {};
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });

    it('should handle arrays', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = [1, 2, 3, { id: 4 }];
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });

    it('should handle null values', () => {
      const middleware = etag();
      const originalJson = jest.fn().mockReturnValue(mockRes);
      mockRes.json = originalJson;

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = null;
      (mockRes.json as jest.Mock)(body);

      expect(mockRes.set).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });

    it('should bind json method correctly', () => {
      const middleware = etag();
      const originalJson = jest.fn(function (this: Response, _body: unknown) {
        expect(this).toBe(mockRes);
        return this;
      });
      mockRes.json = originalJson.bind(mockRes);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      const body = { test: 'data' };
      (mockRes.json as jest.Mock)(body);

      expect(originalJson).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should allow chaining multiple cache middlewares', () => {
      const middleware1 = privateCache(60);
      const middleware2 = etag();

      middleware1(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      mockNext = jest.fn();
      middleware2(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle cacheControl with all options false/undefined', () => {
      cacheControl({ private: false, noStore: false })(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'public');
    });

    it('should maintain middleware independence', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const next1 = jest.fn();
      const next2 = jest.fn();

      noCache(mockReq as Request, res1 as Response, next1);
      publicCache(300)(mockReq as Request, res2 as Response, next2);

      expect(res1.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        })
      );
      expect(res2.set).toHaveBeenCalledWith({
        'Cache-Control': 'public, max-age=300',
      });
    });
  });
});
