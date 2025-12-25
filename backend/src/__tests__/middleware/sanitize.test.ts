import { Request, Response, NextFunction } from 'express';
import {
  sanitizeInput,
  sanitizeFields,
  detectSqlInjection,
} from '../../middleware/sanitize';

// Mock Express objects
const createMockRequest = (
  body?: Record<string, unknown>,
  query?: Record<string, unknown>,
  params?: Record<string, unknown>
): Partial<Request> => ({
  body,
  query: query as Request['query'],
  params: params as Request['params'],
});

const createMockResponse = (): Partial<Response> => ({});

describe('Sanitize Middleware', () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML entities in body', () => {
      const mockReq = createMockRequest({
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.body.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(mockReq.body.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      const mockReq = createMockRequest({}, {
        search: '<img src=x onerror=alert(1)>',
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.query!.search).toBe('&lt;img src&#x3D;x onerror&#x3D;alert(1)&gt;');
    });

    it('should sanitize URL parameters', () => {
      const mockReq = createMockRequest({}, {}, {
        id: '<script>',
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.params!.id).toBe('&lt;script&gt;');
    });

    it('should handle nested objects', () => {
      const mockReq = createMockRequest({
        user: {
          name: '<b>Bold</b>',
          tags: ['<i>tag1</i>', 'tag2'],
        },
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.body.user.name).toBe('&lt;b&gt;Bold&lt;&#x2F;b&gt;');
      expect(mockReq.body.user.tags[0]).toBe('&lt;i&gt;tag1&lt;&#x2F;i&gt;');
      expect(mockReq.body.user.tags[1]).toBe('tag2');
    });

    it('should trim whitespace', () => {
      const mockReq = createMockRequest({
        name: '  John Doe  ',
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.body.name).toBe('John Doe');
    });

    it('should remove null bytes', () => {
      const mockReq = createMockRequest({
        name: 'John\0Doe',
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.body.name).toBe('JohnDoe');
    });

    it('should handle non-string values', () => {
      const mockReq = createMockRequest({
        count: 42,
        active: true,
        data: null,
      });

      sanitizeInput(mockReq as Request, createMockResponse() as Response, mockNext);

      expect(mockReq.body.count).toBe(42);
      expect(mockReq.body.active).toBe(true);
      expect(mockReq.body.data).toBeNull();
    });
  });

  describe('sanitizeFields', () => {
    it('should only sanitize specified fields', () => {
      const mockReq = createMockRequest({
        name: '<script>xss</script>',
        description: '<p>html</p>',
        untouched: '<b>bold</b>',
      });

      sanitizeFields('name', 'description')(
        mockReq as Request,
        createMockResponse() as Response,
        mockNext
      );

      expect(mockReq.body.name).toBe('&lt;script&gt;xss&lt;&#x2F;script&gt;');
      expect(mockReq.body.description).toBe('&lt;p&gt;html&lt;&#x2F;p&gt;');
      expect(mockReq.body.untouched).toBe('<b>bold</b>'); // Not sanitized
    });
  });

  describe('detectSqlInjection', () => {
    it('should detect SELECT statements', () => {
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
      expect(detectSqlInjection("'; SELECT * FROM users --")).toBe(true);
    });

    it('should detect DROP statements', () => {
      expect(detectSqlInjection('DROP TABLE users')).toBe(true);
    });

    it('should detect SQL comment syntax', () => {
      expect(detectSqlInjection('admin--')).toBe(true);
      expect(detectSqlInjection('/* comment */')).toBe(true);
    });

    it('should detect OR 1=1 injection', () => {
      expect(detectSqlInjection("' OR 1=1 --")).toBe(true);
      expect(detectSqlInjection('OR 1=1')).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(detectSqlInjection('Hello World')).toBe(false);
      expect(detectSqlInjection('test@example.com')).toBe(false);
      expect(detectSqlInjection('John Doe')).toBe(false);
    });
  });
});
