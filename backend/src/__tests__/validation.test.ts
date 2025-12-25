import { Request, Response, NextFunction } from 'express';
import {
  validateRequiredFields,
  validateAssemblyRequest,
  validateQueryParams,
  validateUUID
} from '../middleware/validation.middleware';

// Mock Express objects
const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRequiredFields', () => {
    it('should pass when all required fields are present', () => {
      const req = {
        body: { name: 'test', email: 'test@example.com' }
      } as Request;
      const res = mockResponse() as Response;

      validateRequiredFields(['name', 'email'])(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when required field is missing', () => {
      const req = {
        body: { name: 'test' }
      } as Request;
      const res = mockResponse() as Response;

      validateRequiredFields(['name', 'email'])(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation Error'
        })
      );
    });
  });

  describe('validateAssemblyRequest', () => {
    it('should pass with valid assembly request', () => {
      const req = {
        body: {
          templateId: 'hero-1',
          themeId: 'theme-123'
        }
      } as Request;
      const res = mockResponse() as Response;

      validateAssemblyRequest(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with missing templateId', () => {
      const req = {
        body: { themeId: 'theme-123' }
      } as Request;
      const res = mockResponse() as Response;

      validateAssemblyRequest(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid customizations color', () => {
      const req = {
        body: {
          templateId: 'hero-1',
          themeId: 'theme-123',
          customizations: {
            backgroundColor: 'not-a-color'
          }
        }
      } as Request;
      const res = mockResponse() as Response;

      validateAssemblyRequest(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with valid hex color in customizations', () => {
      const req = {
        body: {
          templateId: 'hero-1',
          themeId: 'theme-123',
          customizations: {
            backgroundColor: '#FF5733'
          }
        }
      } as Request;
      const res = mockResponse() as Response;

      validateAssemblyRequest(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateQueryParams', () => {
    it('should pass with allowed query params', () => {
      const req = {
        query: { category: 'hero', page: '1' }
      } as unknown as Request;
      const res = mockResponse() as Response;

      validateQueryParams(['category', 'page', 'limit'])(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with invalid query params', () => {
      const req = {
        query: { invalid: 'param' }
      } as unknown as Request;
      const res = mockResponse() as Response;

      validateQueryParams(['category', 'page'])(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUUID', () => {
    it('should pass with valid UUID', () => {
      const req = {
        params: { id: '123e4567-e89b-12d3-a456-426614174000' }
      } as unknown as Request;
      const res = mockResponse() as Response;

      validateUUID('id')(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with invalid UUID', () => {
      const req = {
        params: { id: 'not-a-uuid' }
      } as unknown as Request;
      const res = mockResponse() as Response;

      validateUUID('id')(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
