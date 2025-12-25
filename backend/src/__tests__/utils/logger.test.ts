// Mock pino before importing
jest.mock('pino', () => {
  const mockLoggerInstance = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn(),
  };

  const pinoMock: any = jest.fn(() => mockLoggerInstance);
  pinoMock.stdTimeFunctions = {
    isoTime: jest.fn(),
  };

  return pinoMock;
});

import pino from 'pino';
import { logger, createRequestLogger, log, RequestContext } from '../../utils/logger';

describe('Logger Utils', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Logger Instance Creation', () => {
    it('should export logger instance with all methods', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.fatal).toBeDefined();
      expect(logger.child).toBeDefined();
    });

    it('should have mock implementation', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.fatal).toBe('function');
      expect(typeof logger.child).toBe('function');
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should log info messages', () => {
      const message = 'Info message';
      const data = { userId: '123' };

      log.info(message, data);

      expect(logger.info).toHaveBeenCalledWith(data, message);
    });

    it('should log info messages without data', () => {
      const message = 'Info message without data';

      log.info(message);

      expect(logger.info).toHaveBeenCalledWith(undefined, message);
    });

    it('should log warn messages', () => {
      const message = 'Warning message';
      const data = { code: 'WARN_001' };

      log.warn(message, data);

      expect(logger.warn).toHaveBeenCalledWith(data, message);
    });

    it('should log warn messages without data', () => {
      const message = 'Warning without data';

      log.warn(message);

      expect(logger.warn).toHaveBeenCalledWith(undefined, message);
    });

    it('should log error messages', () => {
      const message = 'Error message';
      const data = { error: 'Something went wrong', stack: 'Error stack trace' };

      log.error(message, data);

      expect(logger.error).toHaveBeenCalledWith(data, message);
    });

    it('should log error messages without data', () => {
      const message = 'Error without data';

      log.error(message);

      expect(logger.error).toHaveBeenCalledWith(undefined, message);
    });

    it('should log debug messages', () => {
      const message = 'Debug message';
      const data = { details: 'Debug details' };

      log.debug(message, data);

      expect(logger.debug).toHaveBeenCalledWith(data, message);
    });

    it('should log debug messages without data', () => {
      const message = 'Debug without data';

      log.debug(message);

      expect(logger.debug).toHaveBeenCalledWith(undefined, message);
    });

    it('should log fatal messages', () => {
      const message = 'Fatal error';
      const data = { critical: true, error: 'System failure' };

      log.fatal(message, data);

      expect(logger.fatal).toHaveBeenCalledWith(data, message);
    });

    it('should log fatal messages without data', () => {
      const message = 'Fatal without data';

      log.fatal(message);

      expect(logger.fatal).toHaveBeenCalledWith(undefined, message);
    });

    it('should handle complex data objects', () => {
      const message = 'Complex log';
      const data = {
        user: { id: '123', name: 'John Doe' },
        request: { method: 'POST', url: '/api/test' },
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };

      log.info(message, data);

      expect(logger.info).toHaveBeenCalledWith(data, message);
    });

    it('should handle nested objects in data', () => {
      const message = 'Nested data';
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'deep value',
            },
          },
        },
      };

      log.debug(message, data);

      expect(logger.debug).toHaveBeenCalledWith(data, message);
    });

    it('should handle arrays in data', () => {
      const message = 'Array data';
      const data = {
        items: ['item1', 'item2', 'item3'],
        numbers: [1, 2, 3, 4, 5],
      };

      log.info(message, data);

      expect(logger.info).toHaveBeenCalledWith(data, message);
    });
  });

  describe('Child Loggers', () => {
    let mockChildLogger: any;

    beforeEach(() => {
      jest.clearAllMocks();
      mockChildLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        fatal: jest.fn(),
        child: jest.fn(),
      };
      (logger.child as jest.Mock).mockReturnValue(mockChildLogger);
    });

    it('should create child logger with request context', () => {
      const context: RequestContext = {
        requestId: 'req-123',
        method: 'GET',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      };

      const childLogger = createRequestLogger(context);

      expect(logger.child).toHaveBeenCalledWith(context);
      expect(childLogger).toBe(mockChildLogger);
    });

    it('should create child logger with partial context', () => {
      const context: RequestContext = {
        requestId: 'req-456',
        method: 'POST',
      };

      const childLogger = createRequestLogger(context);

      expect(logger.child).toHaveBeenCalledWith(context);
      expect(childLogger).toBe(mockChildLogger);
    });

    it('should create child logger with only requestId', () => {
      const context: RequestContext = {
        requestId: 'req-789',
      };

      const childLogger = createRequestLogger(context);

      expect(logger.child).toHaveBeenCalledWith(context);
      expect(childLogger).toBe(mockChildLogger);
    });

    it('should create child logger with empty context', () => {
      const context: RequestContext = {};

      const childLogger = createRequestLogger(context);

      expect(logger.child).toHaveBeenCalledWith(context);
      expect(childLogger).toBe(mockChildLogger);
    });

    it('should create child logger with full request details', () => {
      const context: RequestContext = {
        requestId: 'custom-req-id-123',
        method: 'PUT',
        url: '/api/users/123',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      const childLogger = createRequestLogger(context);

      expect(logger.child).toHaveBeenCalledWith(context);
      expect(childLogger).toBeDefined();
    });

    it('should allow child logger to log messages', () => {
      const context: RequestContext = {
        requestId: 'req-child-test',
      };

      const childLogger = createRequestLogger(context);
      childLogger.info('Child logger message');

      expect(mockChildLogger.info).toHaveBeenCalledWith('Child logger message');
    });

    it('should create multiple independent child loggers', () => {
      const context1: RequestContext = { requestId: 'req-1' };
      const context2: RequestContext = { requestId: 'req-2' };

      createRequestLogger(context1);
      createRequestLogger(context2);

      expect(logger.child).toHaveBeenCalledTimes(2);
      expect(logger.child).toHaveBeenNthCalledWith(1, context1);
      expect(logger.child).toHaveBeenNthCalledWith(2, context2);
    });

    it('should preserve context in child logger calls', () => {
      const context: RequestContext = {
        requestId: 'req-context-test',
        method: 'DELETE',
        url: '/api/items/456',
      };

      createRequestLogger(context);

      // The context should be automatically included in all logs from this child
      expect(logger.child).toHaveBeenCalledWith(context);
    });
  });

  describe('Log Helper Object', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should expose all log level methods', () => {
      expect(log.info).toBeDefined();
      expect(log.warn).toBeDefined();
      expect(log.error).toBeDefined();
      expect(log.debug).toBeDefined();
      expect(log.fatal).toBeDefined();
    });

    it('should call underlying logger methods with correct parameters', () => {
      log.info('test info', { data: 'value' });
      log.warn('test warn', { data: 'value' });
      log.error('test error', { data: 'value' });
      log.debug('test debug', { data: 'value' });
      log.fatal('test fatal', { data: 'value' });

      expect(logger.info).toHaveBeenCalledWith({ data: 'value' }, 'test info');
      expect(logger.warn).toHaveBeenCalledWith({ data: 'value' }, 'test warn');
      expect(logger.error).toHaveBeenCalledWith({ data: 'value' }, 'test error');
      expect(logger.debug).toHaveBeenCalledWith({ data: 'value' }, 'test debug');
      expect(logger.fatal).toHaveBeenCalledWith({ data: 'value' }, 'test fatal');
    });

    it('should maintain message and data order', () => {
      const message = 'Order test';
      const data = { order: 'important' };

      log.info(message, data);

      // Data should come before message in pino calls
      expect(logger.info).toHaveBeenCalledWith(data, message);
    });
  });

  describe('Direct Logger Usage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow direct logger.info calls', () => {
      logger.info('Direct info call');

      expect(logger.info).toHaveBeenCalledWith('Direct info call');
    });

    it('should allow direct logger.warn calls', () => {
      logger.warn('Direct warn call');

      expect(logger.warn).toHaveBeenCalledWith('Direct warn call');
    });

    it('should allow direct logger.error calls', () => {
      logger.error('Direct error call');

      expect(logger.error).toHaveBeenCalledWith('Direct error call');
    });

    it('should allow direct logger.debug calls', () => {
      logger.debug('Direct debug call');

      expect(logger.debug).toHaveBeenCalledWith('Direct debug call');
    });

    it('should allow direct logger.fatal calls', () => {
      logger.fatal('Direct fatal call');

      expect(logger.fatal).toHaveBeenCalledWith('Direct fatal call');
    });

    it('should allow direct logger calls with data objects', () => {
      const data = { key: 'value' };
      logger.info(data, 'Message with data');

      expect(logger.info).toHaveBeenCalledWith(data, 'Message with data');
    });
  });

  describe('Environment-based Configuration', () => {
    it('should have pino stdTimeFunctions available', () => {
      const pinoMock = pino as any;
      expect(pinoMock.stdTimeFunctions).toBeDefined();
      expect(pinoMock.stdTimeFunctions.isoTime).toBeDefined();
    });

    it('should export default logger', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });
  });

  describe('RequestContext Interface', () => {
    it('should accept valid RequestContext with all fields', () => {
      const context: RequestContext = {
        requestId: 'req-all-fields',
        method: 'GET',
        url: '/api/endpoint',
        ip: '10.0.0.1',
        userAgent: 'Custom Agent/1.0',
      };

      expect(() => createRequestLogger(context)).not.toThrow();
    });

    it('should accept RequestContext with optional fields omitted', () => {
      const contexts: RequestContext[] = [
        { requestId: 'req-1' },
        { method: 'POST' },
        { url: '/test' },
        { ip: '127.0.0.1' },
        { userAgent: 'Agent' },
        {},
      ];

      contexts.forEach((context) => {
        expect(() => createRequestLogger(context)).not.toThrow();
      });
    });

    it('should handle various HTTP methods in context', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

      methods.forEach((method) => {
        const context: RequestContext = { method, requestId: `req-${method}` };
        createRequestLogger(context);

        expect(logger.child).toHaveBeenCalledWith(context);
      });
    });

    it('should handle various URL patterns in context', () => {
      const urls = [
        '/api/v1/users',
        '/api/v2/posts/123',
        '/health',
        '/metrics',
        '/admin/settings?tab=general',
      ];

      urls.forEach((url) => {
        jest.clearAllMocks();
        const context: RequestContext = { url, requestId: 'req-url-test' };
        createRequestLogger(context);

        expect(logger.child).toHaveBeenCalledWith(context);
      });
    });

    it('should handle various IP formats in context', () => {
      const ips = [
        '127.0.0.1',
        '192.168.1.1',
        '10.0.0.1',
        '::1',
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      ];

      ips.forEach((ip) => {
        jest.clearAllMocks();
        const context: RequestContext = { ip, requestId: 'req-ip-test' };
        createRequestLogger(context);

        expect(logger.child).toHaveBeenCalledWith(context);
      });
    });
  });

  describe('Error Scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle logging errors with stack traces', () => {
      const error = new Error('Test error');
      const data = {
        error: error.message,
        stack: error.stack,
      };

      log.error('An error occurred', data);

      expect(logger.error).toHaveBeenCalledWith(data, 'An error occurred');
    });

    it('should handle logging Error objects', () => {
      const error = new Error('Application error');
      const data = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };

      log.error('Error encountered', data);

      expect(logger.error).toHaveBeenCalledWith(data, 'Error encountered');
    });

    it('should handle logging custom error objects', () => {
      const customError = {
        code: 'ERR_CUSTOM',
        message: 'Custom error occurred',
        statusCode: 500,
        details: { field: 'value' },
      };

      log.error('Custom error', customError);

      expect(logger.error).toHaveBeenCalledWith(customError, 'Custom error');
    });
  });

  describe('Performance and Edge Cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle rapid successive log calls', () => {
      for (let i = 0; i < 100; i++) {
        log.info(`Message ${i}`, { index: i });
      }

      expect(logger.info).toHaveBeenCalledTimes(100);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      log.info(longMessage);

      expect(logger.info).toHaveBeenCalledWith(undefined, longMessage);
    });

    it('should handle special characters in messages', () => {
      const specialMessages = [
        'Message with "quotes"',
        "Message with 'single quotes'",
        'Message with \n newlines',
        'Message with \t tabs',
        'Message with unicode: 你好世界',
        'Message with emojis: 🚀🎉',
      ];

      specialMessages.forEach((msg) => {
        jest.clearAllMocks();
        log.info(msg);
        expect(logger.info).toHaveBeenCalledWith(undefined, msg);
      });
    });

    it('should handle null and undefined in data', () => {
      log.info('Message with null', { value: null });
      log.info('Message with undefined', { value: undefined });

      expect(logger.info).toHaveBeenCalledWith({ value: null }, 'Message with null');
      expect(logger.info).toHaveBeenCalledWith(
        { value: undefined },
        'Message with undefined'
      );
    });

    it('should handle empty strings', () => {
      log.info('');
      log.info('', {});

      expect(logger.info).toHaveBeenCalledWith(undefined, '');
      expect(logger.info).toHaveBeenCalledWith({}, '');
    });

    it('should handle logging booleans in data', () => {
      log.info('Boolean test', { success: true, failed: false });

      expect(logger.info).toHaveBeenCalledWith(
        { success: true, failed: false },
        'Boolean test'
      );
    });

    it('should handle logging numbers in data', () => {
      log.info('Number test', {
        integer: 42,
        float: 3.14,
        negative: -100,
        zero: 0,
      });

      expect(logger.info).toHaveBeenCalledWith(
        {
          integer: 42,
          float: 3.14,
          negative: -100,
          zero: 0,
        },
        'Number test'
      );
    });
  });
});
