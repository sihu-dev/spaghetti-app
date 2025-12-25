import { Request, Response, NextFunction } from 'express';
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
  });

  describe('cacheControl', () => {
    it('should set no-store when specified', () => {
      cacheControl({ noStore: true })(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
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

    it('should return 304 when If-None-Match matches', () => {
      const body = { test: 'data' };
      const bodyString = JSON.stringify(body);
      const crypto = require('crypto');
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
  });
});
