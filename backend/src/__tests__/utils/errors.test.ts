import { AppError, ErrorCode, Errors } from '../../utils/errors';

describe('Error Utils', () => {
  describe('ErrorCode enum', () => {
    it('should have all client error codes (4xx)', () => {
      expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should have all server error codes (5xx)', () => {
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
      expect(ErrorCode.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR');
    });

    it('should have all domain-specific error codes', () => {
      expect(ErrorCode.INVALID_IMAGE).toBe('INVALID_IMAGE');
      expect(ErrorCode.SSRF_BLOCKED).toBe('SSRF_BLOCKED');
      expect(ErrorCode.THEME_EXTRACTION_FAILED).toBe('THEME_EXTRACTION_FAILED');
      expect(ErrorCode.TEMPLATE_NOT_FOUND).toBe('TEMPLATE_NOT_FOUND');
      expect(ErrorCode.ASSEMBLY_GENERATION_FAILED).toBe('ASSEMBLY_GENERATION_FAILED');
    });
  });

  describe('AppError', () => {
    it('should create an error with all properties', () => {
      const error = new AppError(
        ErrorCode.BAD_REQUEST,
        'Test error message',
        400,
        true,
        { field: 'test' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.BAD_REQUEST);
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should have default values', () => {
      const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Internal error');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeUndefined();
    });

    it('should create error with minimal parameters', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, 'Resource not found');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeUndefined();
    });

    it('should create non-operational error', () => {
      const error = new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Critical failure',
        500,
        false
      );

      expect(error.isOperational).toBe(false);
    });

    it('should maintain prototype chain', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError(ErrorCode.INTERNAL_ERROR, 'Stack test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack test');
    });

    it('should have name property from Error', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');

      expect(error.name).toBe('Error');
    });

    it('should handle complex details objects', () => {
      const details = {
        nested: {
          field: 'value',
          array: [1, 2, 3],
        },
        count: 42,
        flag: true,
      };
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Complex details',
        400,
        true,
        details
      );

      expect(error.details).toEqual(details);
      expect(error.details?.nested).toEqual({ field: 'value', array: [1, 2, 3] });
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        true,
        { fields: ['email'] }
      );

      const json = error.toJSON();

      expect(json).toEqual({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        statusCode: 400,
        isOperational: true,
        details: { fields: ['email'] },
      });
    });

    it('should serialize to JSON without details', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, 'Not found', 404);

      const json = error.toJSON();

      expect(json).toEqual({
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
        statusCode: 404,
        isOperational: true,
        details: undefined,
      });
    });

    it('should serialize non-operational error to JSON', () => {
      const error = new AppError(
        ErrorCode.INTERNAL_ERROR,
        'System failure',
        500,
        false
      );

      const json = error.toJSON();

      expect(json.isOperational).toBe(false);
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new AppError(ErrorCode.BAD_REQUEST, 'Test error');
      }).toThrow(AppError);

      expect(() => {
        throw new AppError(ErrorCode.BAD_REQUEST, 'Test error');
      }).toThrow('Test error');
    });
  });

  describe('Error Factory Functions', () => {
    describe('badRequest', () => {
      it('should create badRequest error with details', () => {
        const error = Errors.badRequest('Invalid input', { field: 'name' });

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.BAD_REQUEST);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid input');
        expect(error.isOperational).toBe(true);
        expect(error.details).toEqual({ field: 'name' });
      });

      it('should create badRequest error without details', () => {
        const error = Errors.badRequest('Invalid input');

        expect(error.code).toBe(ErrorCode.BAD_REQUEST);
        expect(error.statusCode).toBe(400);
        expect(error.details).toBeUndefined();
      });
    });

    describe('validationError', () => {
      it('should create validationError with details', () => {
        const error = Errors.validationError('Validation failed', {
          errors: ['email is required', 'password too short']
        });

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Validation failed');
        expect(error.isOperational).toBe(true);
        expect(error.details).toEqual({
          errors: ['email is required', 'password too short']
        });
      });

      it('should create validationError without details', () => {
        const error = Errors.validationError('Validation failed');

        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.statusCode).toBe(400);
        expect(error.details).toBeUndefined();
      });
    });

    describe('unauthorized', () => {
      it('should create unauthorized error with default message', () => {
        const error = Errors.unauthorized();

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Authentication required');
        expect(error.isOperational).toBe(true);
      });

      it('should create unauthorized error with custom message', () => {
        const error = Errors.unauthorized('Token expired');

        expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Token expired');
      });
    });

    describe('forbidden', () => {
      it('should create forbidden error with default message', () => {
        const error = Errors.forbidden();

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.FORBIDDEN);
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Access denied');
        expect(error.isOperational).toBe(true);
      });

      it('should create forbidden error with custom message', () => {
        const error = Errors.forbidden('Admin access required');

        expect(error.code).toBe(ErrorCode.FORBIDDEN);
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('Admin access required');
      });
    });

    describe('notFound', () => {
      it('should create notFound error with default resource name', () => {
        const error = Errors.notFound();

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.NOT_FOUND);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Resource not found');
        expect(error.isOperational).toBe(true);
      });

      it('should create notFound error with custom resource name', () => {
        const error = Errors.notFound('User');

        expect(error.code).toBe(ErrorCode.NOT_FOUND);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('User not found');
      });

      it('should create notFound error with specific resource identifier', () => {
        const error = Errors.notFound('User with ID 123');

        expect(error.message).toBe('User with ID 123 not found');
      });
    });

    describe('rateLimitExceeded', () => {
      it('should create rateLimitExceeded error', () => {
        const error = Errors.rateLimitExceeded();

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe('Too many requests, please try again later');
        expect(error.isOperational).toBe(true);
      });
    });

    describe('internal', () => {
      it('should create internal error with default message (non-operational)', () => {
        const error = Errors.internal();

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Internal server error');
        expect(error.isOperational).toBe(false);
      });

      it('should create internal error with custom message (non-operational)', () => {
        const error = Errors.internal('Database connection failed');

        expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Database connection failed');
        expect(error.isOperational).toBe(false);
      });
    });

    describe('externalApi', () => {
      it('should create externalApi error', () => {
        const error = Errors.externalApi('Claude AI', 'Rate limit exceeded');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.EXTERNAL_API_ERROR);
        expect(error.statusCode).toBe(502);
        expect(error.message).toBe('Claude AI: Rate limit exceeded');
        expect(error.isOperational).toBe(true);
      });

      it('should create externalApi error for different services', () => {
        const error1 = Errors.externalApi('OpenAI', 'Service unavailable');
        const error2 = Errors.externalApi('Stripe', 'Invalid API key');

        expect(error1.message).toBe('OpenAI: Service unavailable');
        expect(error2.message).toBe('Stripe: Invalid API key');
      });
    });

    describe('ssrfBlocked', () => {
      it('should create ssrfBlocked error with URL in details', () => {
        const error = Errors.ssrfBlocked('http://localhost/');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.SSRF_BLOCKED);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Request to this URL is not allowed');
        expect(error.isOperational).toBe(true);
        expect(error.details).toEqual({ blockedUrl: 'http://localhost/' });
      });

      it('should create ssrfBlocked error with different URLs', () => {
        const error1 = Errors.ssrfBlocked('http://169.254.169.254/');
        const error2 = Errors.ssrfBlocked('http://192.168.1.1/admin');

        expect(error1.details).toEqual({ blockedUrl: 'http://169.254.169.254/' });
        expect(error2.details).toEqual({ blockedUrl: 'http://192.168.1.1/admin' });
      });
    });

    describe('invalidImage', () => {
      it('should create invalidImage error', () => {
        const error = Errors.invalidImage('File too large');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.INVALID_IMAGE);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid image: File too large');
        expect(error.isOperational).toBe(true);
      });

      it('should create invalidImage error with different reasons', () => {
        const error1 = Errors.invalidImage('Unsupported format');
        const error2 = Errors.invalidImage('Corrupted file');
        const error3 = Errors.invalidImage('Dimensions too large');

        expect(error1.message).toBe('Invalid image: Unsupported format');
        expect(error2.message).toBe('Invalid image: Corrupted file');
        expect(error3.message).toBe('Invalid image: Dimensions too large');
      });
    });

    describe('themeExtractionFailed', () => {
      it('should create themeExtractionFailed error', () => {
        const error = Errors.themeExtractionFailed('API timeout');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.THEME_EXTRACTION_FAILED);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Theme extraction failed: API timeout');
        expect(error.isOperational).toBe(true);
      });

      it('should create themeExtractionFailed error with different reasons', () => {
        const error1 = Errors.themeExtractionFailed('Invalid response format');
        const error2 = Errors.themeExtractionFailed('Missing color data');

        expect(error1.message).toBe('Theme extraction failed: Invalid response format');
        expect(error2.message).toBe('Theme extraction failed: Missing color data');
      });
    });

    describe('templateNotFound', () => {
      it('should create templateNotFound error', () => {
        const error = Errors.templateNotFound('hero-1');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.TEMPLATE_NOT_FOUND);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Template not found: hero-1');
        expect(error.isOperational).toBe(true);
      });

      it('should create templateNotFound error with different template IDs', () => {
        const error1 = Errors.templateNotFound('navbar-2');
        const error2 = Errors.templateNotFound('footer-modern');

        expect(error1.message).toBe('Template not found: navbar-2');
        expect(error2.message).toBe('Template not found: footer-modern');
      });
    });

    describe('assemblyFailed', () => {
      it('should create assemblyFailed error', () => {
        const error = Errors.assemblyFailed('Code generation failed');

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ErrorCode.ASSEMBLY_GENERATION_FAILED);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Assembly generation failed: Code generation failed');
        expect(error.isOperational).toBe(true);
      });

      it('should create assemblyFailed error with different reasons', () => {
        const error1 = Errors.assemblyFailed('Invalid template data');
        const error2 = Errors.assemblyFailed('Missing required fields');

        expect(error1.message).toBe('Assembly generation failed: Invalid template data');
        expect(error2.message).toBe('Assembly generation failed: Missing required fields');
      });
    });
  });

  describe('Error Properties', () => {
    it('should have correct properties for BAD_REQUEST', () => {
      const error = Errors.badRequest('Bad request');

      expect(error.code).toBe(ErrorCode.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should have correct properties for UNAUTHORIZED', () => {
      const error = Errors.unauthorized();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should have correct properties for FORBIDDEN', () => {
      const error = Errors.forbidden();

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it('should have correct properties for NOT_FOUND', () => {
      const error = Errors.notFound();

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should have correct properties for INTERNAL_ERROR', () => {
      const error = Errors.internal();

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('should have all properties defined', () => {
      const error = Errors.badRequest('Test');

      expect(error.code).toBeDefined();
      expect(error.statusCode).toBeDefined();
      expect(error.isOperational).toBeDefined();
      expect(error.message).toBeDefined();
    });
  });

  describe('Serialization', () => {
    it('should serialize error with all fields', () => {
      const error = new AppError(
        ErrorCode.BAD_REQUEST,
        'Test error',
        400,
        true,
        { field: 'email', value: 'invalid' }
      );

      const json = error.toJSON();

      expect(json).toEqual({
        code: ErrorCode.BAD_REQUEST,
        message: 'Test error',
        statusCode: 400,
        isOperational: true,
        details: { field: 'email', value: 'invalid' },
      });
    });

    it('should serialize error without details field', () => {
      const error = Errors.unauthorized();

      const json = error.toJSON();

      expect(json).toHaveProperty('code');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('statusCode');
      expect(json).toHaveProperty('isOperational');
      expect(json.details).toBeUndefined();
    });

    it('should be JSON.stringify compatible', () => {
      const error = Errors.badRequest('Invalid data', { count: 5 });

      const jsonString = JSON.stringify(error);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual({
        code: ErrorCode.BAD_REQUEST,
        message: 'Invalid data',
        statusCode: 400,
        isOperational: true,
        details: { count: 5 },
      });
    });

    it('should not include stack trace in serialization', () => {
      const error = Errors.internal('Critical error');

      const json = error.toJSON();

      expect(json).not.toHaveProperty('stack');
    });

    it('should serialize arrays in details correctly', () => {
      const error = Errors.validationError('Multiple errors', {
        errors: ['Field A is required', 'Field B is invalid'],
      });

      const json = error.toJSON();

      expect(json.details).toEqual({
        errors: ['Field A is required', 'Field B is invalid'],
      });
    });

    it('should serialize nested objects in details correctly', () => {
      const error = Errors.badRequest('Complex validation', {
        user: {
          email: 'invalid format',
          profile: {
            age: 'must be positive',
          },
        },
      });

      const json = error.toJSON();

      expect(json.details).toEqual({
        user: {
          email: 'invalid format',
          profile: {
            age: 'must be positive',
          },
        },
      });
    });
  });
});
