import { Request, Response, NextFunction } from 'express';
import { requestTimeout, slowRequestDetector } from '../../middleware/timeout';
import { logger } from '../../utils/logger';

// Mock the logger utility
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Helper to create mock Request with setTimeout
const createMockRequest = (): Partial<Request> => {
  let timeoutCallback: (() => void) | null = null;
  let timeoutDuration: number | null = null;

  return {
    setTimeout: jest.fn((duration: number, callback: () => void) => {
      timeoutDuration = duration;
      timeoutCallback = callback;
      return {
        _onTimeout: callback,
        _idleTimeout: duration,
      } as any;
    }),
    _triggerTimeout: () => {
      if (timeoutCallback) {
        timeoutCallback();
      }
    },
    _getTimeoutDuration: () => timeoutDuration,
    method: 'GET',
    originalUrl: '/api/test',
  } as any;
};

// Helper to create mock Response with setTimeout
const createMockResponse = (): Partial<Response> => {
  let timeoutCallback: (() => void) | null = null;
  let timeoutDuration: number | null = null;
  let sent = false;
  const finishHandlers: Array<() => void> = [];

  const res: Partial<Response> = {
    setTimeout: jest.fn((duration: number, callback: () => void) => {
      timeoutDuration = duration;
      timeoutCallback = callback;
      return {
        _onTimeout: callback,
        _idleTimeout: duration,
      } as any;
    }),
    status: jest.fn(function(this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function(this: any) {
      sent = true;
      this.headersSent = true;
      return this;
    }),
    on: jest.fn((event: string, handler: () => void) => {
      if (event === 'finish') {
        finishHandlers.push(handler);
      }
    }),
    headersSent: false,
    statusCode: 200,
    _triggerTimeout: () => {
      if (timeoutCallback) {
        timeoutCallback();
      }
    },
    _triggerFinish: () => {
      finishHandlers.forEach(handler => handler());
    },
    _getTimeoutDuration: () => timeoutDuration,
    _isSent: () => sent,
  } as any;

  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('Timeout Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('requestTimeout', () => {
    describe('Default timeout behavior', () => {
      it('should set default timeout of 30000ms on request', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(30000, expect.any(Function));
      });

      it('should set default timeout of 30000ms on response', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.setTimeout).toHaveBeenCalledWith(30000, expect.any(Function));
      });

      it('should call next() after setting timeouts', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('Custom timeout behavior', () => {
      it('should set custom timeout on request', () => {
        const customTimeout = 5000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(customTimeout);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
      });

      it('should set custom timeout on response', () => {
        const customTimeout = 5000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(customTimeout);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
      });

      it('should work with very short timeout', () => {
        const customTimeout = 100;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(customTimeout);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
        expect(mockRes.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
      });

      it('should work with very long timeout', () => {
        const customTimeout = 120000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(customTimeout);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
        expect(mockRes.setTimeout).toHaveBeenCalledWith(customTimeout, expect.any(Function));
      });
    });

    describe('Request timeout triggering', () => {
      it('should send 408 response when request timeout is triggered', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Trigger the timeout
        (mockReq as any)._triggerTimeout();

        expect(mockRes.status).toHaveBeenCalledWith(408);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timeout',
          },
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should not send response if headers already sent when request times out', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Mark headers as sent
        mockRes.headersSent = true;

        // Trigger the timeout
        (mockReq as any)._triggerTimeout();

        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('should include correct timestamp in timeout response', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Advance time
        jest.setSystemTime(new Date('2024-01-15T10:30:05.500Z'));

        // Trigger the timeout
        (mockReq as any)._triggerTimeout();

        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: '2024-01-15T10:30:05.500Z',
          })
        );
      });
    });

    describe('Response timeout triggering', () => {
      it('should send 408 response when response timeout is triggered', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Trigger the response timeout
        (mockRes as any)._triggerTimeout();

        expect(mockRes.status).toHaveBeenCalledWith(408);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Response timeout',
          },
          timestamp: '2024-01-15T10:30:00.000Z',
        });
      });

      it('should not send response if headers already sent when response times out', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Mark headers as sent
        mockRes.headersSent = true;

        // Trigger the response timeout
        (mockRes as any)._triggerTimeout();

        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });

      it('should differentiate between request and response timeout messages', () => {
        const mockReq1 = createMockRequest();
        const mockRes1 = createMockResponse();
        const mockNext1 = createMockNext();
        const middleware1 = requestTimeout(5000);

        middleware1(mockReq1 as Request, mockRes1 as Response, mockNext1);
        (mockReq1 as any)._triggerTimeout();

        const mockReq2 = createMockRequest();
        const mockRes2 = createMockResponse();
        const mockNext2 = createMockNext();
        const middleware2 = requestTimeout(5000);

        middleware2(mockReq2 as Request, mockRes2 as Response, mockNext2);
        (mockRes2 as any)._triggerTimeout();

        expect(mockRes1.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'Request timeout',
            }),
          })
        );

        expect(mockRes2.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'Response timeout',
            }),
          })
        );
      });
    });

    describe('Request completing before timeout', () => {
      it('should not send timeout response if request completes successfully', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Complete the request before timeout
        mockRes.status!(200);
        mockRes.json!({ success: true });

        // Try to trigger timeout after completion
        (mockReq as any)._triggerTimeout();
        (mockRes as any)._triggerTimeout();

        // Should only have been called once (for the successful response)
        expect(mockRes.status).toHaveBeenCalledTimes(1);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      });

      it('should handle fast requests that complete immediately', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(30000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Immediately complete the request
        mockRes.headersSent = true;

        // Trigger timeout
        (mockReq as any)._triggerTimeout();

        // Should not send timeout response
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      it('should handle timeout of 0', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(0);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockReq.setTimeout).toHaveBeenCalledWith(0, expect.any(Function));
        expect(mockRes.setTimeout).toHaveBeenCalledWith(0, expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle multiple middleware instances with different timeouts', () => {
        const mockReq1 = createMockRequest();
        const mockRes1 = createMockResponse();
        const mockNext1 = createMockNext();
        const middleware1 = requestTimeout(5000);

        const mockReq2 = createMockRequest();
        const mockRes2 = createMockResponse();
        const mockNext2 = createMockNext();
        const middleware2 = requestTimeout(10000);

        middleware1(mockReq1 as Request, mockRes1 as Response, mockNext1);
        middleware2(mockReq2 as Request, mockRes2 as Response, mockNext2);

        expect((mockReq1 as any)._getTimeoutDuration()).toBe(5000);
        expect((mockReq2 as any)._getTimeoutDuration()).toBe(10000);
      });

      it('should handle concurrent requests independently', () => {
        const middleware = requestTimeout(5000);

        const mockReq1 = createMockRequest();
        const mockRes1 = createMockResponse();
        const mockNext1 = createMockNext();

        const mockReq2 = createMockRequest();
        const mockRes2 = createMockResponse();
        const mockNext2 = createMockNext();

        middleware(mockReq1 as Request, mockRes1 as Response, mockNext1);
        middleware(mockReq2 as Request, mockRes2 as Response, mockNext2);

        // Trigger timeout only for first request
        (mockReq1 as any)._triggerTimeout();

        expect(mockRes1.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'TIMEOUT',
            }),
          })
        );

        expect(mockRes2.json).not.toHaveBeenCalled();
      });

      it('should use consistent error response format', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);
        (mockReq as any)._triggerTimeout();

        const callArgs = (mockRes.json as jest.Mock).mock.calls[0][0];

        expect(callArgs).toHaveProperty('success', false);
        expect(callArgs).toHaveProperty('error');
        expect(callArgs.error).toHaveProperty('code');
        expect(callArgs.error).toHaveProperty('message');
        expect(callArgs).toHaveProperty('timestamp');
      });

      it('should handle both request and response timeout callbacks being triggered', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout(5000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Trigger request timeout first
        (mockReq as any)._triggerTimeout();

        // Try to trigger response timeout after headers sent
        (mockRes as any)._triggerTimeout();

        // Should only send one timeout response
        expect(mockRes.status).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledTimes(1);
      });
    });

    describe('Response format validation', () => {
      it('should return proper error code for timeout', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);
        (mockReq as any)._triggerTimeout();

        const response = (mockRes.json as jest.Mock).mock.calls[0][0];
        expect(response.error.code).toBe('TIMEOUT');
      });

      it('should return success: false for timeout', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);
        (mockReq as any)._triggerTimeout();

        const response = (mockRes.json as jest.Mock).mock.calls[0][0];
        expect(response.success).toBe(false);
      });

      it('should return valid ISO timestamp', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = requestTimeout();

        middleware(mockReq as Request, mockRes as Response, mockNext);
        (mockReq as any)._triggerTimeout();

        const response = (mockRes.json as jest.Mock).mock.calls[0][0];
        expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });

  describe('slowRequestDetector', () => {
    describe('Default threshold behavior', () => {
      it('should set default threshold of 5000ms', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() immediately', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should attach finish event listener to response', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      });
    });

    describe('Slow request detection with default threshold', () => {
      it('should log warning when request exceeds default threshold (5000ms)', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Advance time by more than 5000ms
        jest.advanceTimersByTime(5500);

        // Trigger finish event
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          {
            method: 'GET',
            url: '/api/test',
            duration: 5500,
            threshold: 5000,
          },
          'Slow request detected'
        );
      });

      it('should not log warning when request is faster than threshold', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Advance time by less than 5000ms
        jest.advanceTimersByTime(3000);

        // Trigger finish event
        (mockRes as any)._triggerFinish();

        expect(logger.warn).not.toHaveBeenCalled();
      });

      it('should not log warning when request equals threshold', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector();

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Advance time by exactly 5000ms
        jest.advanceTimersByTime(5000);

        // Trigger finish event
        (mockRes as any)._triggerFinish();

        expect(logger.warn).not.toHaveBeenCalled();
      });
    });

    describe('Custom threshold behavior', () => {
      it('should use custom threshold for detection', () => {
        const customThreshold = 1000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(customThreshold);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Advance time beyond custom threshold
        jest.advanceTimersByTime(1500);

        // Trigger finish event
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          {
            method: 'GET',
            url: '/api/test',
            duration: 1500,
            threshold: customThreshold,
          },
          'Slow request detected'
        );
      });

      it('should not log when below custom threshold', () => {
        const customThreshold = 2000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(customThreshold);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(1000);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).not.toHaveBeenCalled();
      });

      it('should work with very low threshold', () => {
        const customThreshold = 10;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(customThreshold);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(50);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 50,
            threshold: customThreshold,
          }),
          'Slow request detected'
        );
      });

      it('should work with very high threshold', () => {
        const customThreshold = 60000;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(customThreshold);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(30000);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).not.toHaveBeenCalled();
      });
    });

    describe('Request metadata logging', () => {
      it('should log correct HTTP method', () => {
        const mockReq = createMockRequest();
        mockReq.method = 'POST';
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(100);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(200);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'POST',
          }),
          'Slow request detected'
        );
      });

      it('should log correct URL', () => {
        const mockReq = createMockRequest();
        mockReq.originalUrl = '/api/users/create';
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(100);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(200);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/api/users/create',
          }),
          'Slow request detected'
        );
      });

      it('should log accurate duration', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(100);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(3456);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 3456,
          }),
          'Slow request detected'
        );
      });

      it('should log correct threshold value', () => {
        const customThreshold = 7500;
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(customThreshold);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(8000);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            threshold: customThreshold,
          }),
          'Slow request detected'
        );
      });
    });

    describe('Multiple requests handling', () => {
      it('should handle multiple requests independently', () => {
        const middleware = slowRequestDetector(1000);

        const mockReq1 = createMockRequest();
        mockReq1.originalUrl = '/api/fast';
        const mockRes1 = createMockResponse();
        const mockNext1 = createMockNext();

        const mockReq2 = createMockRequest();
        mockReq2.originalUrl = '/api/slow';
        const mockRes2 = createMockResponse();
        const mockNext2 = createMockNext();

        middleware(mockReq1 as Request, mockRes1 as Response, mockNext1);
        middleware(mockReq2 as Request, mockRes2 as Response, mockNext2);

        // Complete fast request
        jest.advanceTimersByTime(500);
        (mockRes1 as any)._triggerFinish();

        // Complete slow request
        jest.advanceTimersByTime(800); // Total 1300ms for req2
        (mockRes2 as any)._triggerFinish();

        // Only slow request should be logged
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/api/slow',
            duration: 1300,
          }),
          'Slow request detected'
        );
      });

      it('should maintain separate timers for concurrent requests', () => {
        const middleware = slowRequestDetector(1000);

        const mockReq1 = createMockRequest();
        mockReq1.originalUrl = '/api/endpoint1';
        const mockRes1 = createMockResponse();
        const mockNext1 = createMockNext();

        const mockReq2 = createMockRequest();
        mockReq2.originalUrl = '/api/endpoint2';
        const mockRes2 = createMockResponse();
        const mockNext2 = createMockNext();

        // Start first request
        middleware(mockReq1 as Request, mockRes1 as Response, mockNext1);

        // Advance 500ms
        jest.advanceTimersByTime(500);

        // Start second request
        middleware(mockReq2 as Request, mockRes2 as Response, mockNext2);

        // Advance another 700ms (total 1200ms for req1, 700ms for req2)
        jest.advanceTimersByTime(700);

        // Complete both requests
        (mockRes1 as any)._triggerFinish();
        (mockRes2 as any)._triggerFinish();

        // Only first request should be logged as slow
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            url: '/api/endpoint1',
            duration: 1200,
          }),
          'Slow request detected'
        );
      });
    });

    describe('Different HTTP methods', () => {
      it.each(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])(
        'should detect slow %s requests',
        (method) => {
          const mockReq = createMockRequest();
          mockReq.method = method;
          const mockRes = createMockResponse();
          const mockNext = createMockNext();
          const middleware = slowRequestDetector(100);

          middleware(mockReq as Request, mockRes as Response, mockNext);

          jest.advanceTimersByTime(200);
          (mockRes as any)._triggerFinish();

          expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
              method,
            }),
            'Slow request detected'
          );
        }
      );
    });

    describe('Edge cases', () => {
      it('should handle threshold of 0', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(0);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(1);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalled();
      });

      it('should handle requests that complete instantly', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(1000);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Complete immediately without advancing time
        (mockRes as any)._triggerFinish();

        expect(logger.warn).not.toHaveBeenCalled();
      });

      it('should log correct message', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(100);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(200);
        (mockRes as any)._triggerFinish();

        expect(logger.warn).toHaveBeenCalledWith(
          expect.any(Object),
          'Slow request detected'
        );
      });

      it('should only log based on single finish event', () => {
        const mockReq = createMockRequest();
        const mockRes = createMockResponse();
        const mockNext = createMockNext();
        const middleware = slowRequestDetector(100);

        middleware(mockReq as Request, mockRes as Response, mockNext);

        jest.advanceTimersByTime(200);
        (mockRes as any)._triggerFinish();

        // Verify the warning was logged
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 200,
          }),
          'Slow request detected'
        );
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work together - requestTimeout and slowRequestDetector', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = createMockNext();

      const timeoutMiddleware = requestTimeout(10000);
      const slowDetectorMiddleware = slowRequestDetector(2000);

      timeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);
      slowDetectorMiddleware(mockReq as Request, mockRes as Response, jest.fn());

      // Advance time to trigger slow request detection but not timeout
      jest.advanceTimersByTime(5000);
      (mockRes as any)._triggerFinish();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
          threshold: 2000,
        }),
        'Slow request detected'
      );

      // Timeout should not have been triggered
      expect(mockRes.status).not.toHaveBeenCalledWith(408);
    });

    it('should handle timeout occurring before slow request detection', () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext = createMockNext();

      const timeoutMiddleware = requestTimeout(1000);
      const slowDetectorMiddleware = slowRequestDetector(5000);

      timeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);
      slowDetectorMiddleware(mockReq as Request, mockRes as Response, jest.fn());

      // Trigger timeout
      (mockReq as any)._triggerTimeout();

      expect(mockRes.status).toHaveBeenCalledWith(408);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TIMEOUT',
          }),
        })
      );

      // Now trigger finish
      jest.advanceTimersByTime(6000);
      (mockRes as any)._triggerFinish();

      // Slow request should still be logged
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 6000,
        }),
        'Slow request detected'
      );
    });
  });
});
