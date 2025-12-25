import { AppError, ErrorCode, Errors } from '../../utils/errors';

describe('Error Utils', () => {
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
  });

  describe('Error Factory Functions', () => {
    it('should create badRequest error', () => {
      const error = Errors.badRequest('Invalid input', { field: 'name' });

      expect(error.code).toBe(ErrorCode.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'name' });
    });

    it('should create validationError', () => {
      const error = Errors.validationError('Validation failed', { errors: [] });

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
    });

    it('should create unauthorized error', () => {
      const error = Errors.unauthorized();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should create forbidden error', () => {
      const error = Errors.forbidden();

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should create notFound error', () => {
      const error = Errors.notFound('User');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should create rateLimitExceeded error', () => {
      const error = Errors.rateLimitExceeded();

      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.statusCode).toBe(429);
    });

    it('should create internal error (non-operational)', () => {
      const error = Errors.internal('Database connection failed');

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('should create externalApi error', () => {
      const error = Errors.externalApi('Claude AI', 'Rate limit exceeded');

      expect(error.code).toBe(ErrorCode.EXTERNAL_API_ERROR);
      expect(error.statusCode).toBe(502);
      expect(error.message).toBe('Claude AI: Rate limit exceeded');
    });

    it('should create ssrfBlocked error', () => {
      const error = Errors.ssrfBlocked('http://localhost/');

      expect(error.code).toBe(ErrorCode.SSRF_BLOCKED);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ blockedUrl: 'http://localhost/' });
    });

    it('should create invalidImage error', () => {
      const error = Errors.invalidImage('File too large');

      expect(error.code).toBe(ErrorCode.INVALID_IMAGE);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid image: File too large');
    });

    it('should create themeExtractionFailed error', () => {
      const error = Errors.themeExtractionFailed('API timeout');

      expect(error.code).toBe(ErrorCode.THEME_EXTRACTION_FAILED);
      expect(error.statusCode).toBe(500);
    });

    it('should create templateNotFound error', () => {
      const error = Errors.templateNotFound('hero-1');

      expect(error.code).toBe(ErrorCode.TEMPLATE_NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Template not found: hero-1');
    });

    it('should create assemblyFailed error', () => {
      const error = Errors.assemblyFailed('Code generation failed');

      expect(error.code).toBe(ErrorCode.ASSEMBLY_GENERATION_FAILED);
      expect(error.statusCode).toBe(500);
    });
  });
});
