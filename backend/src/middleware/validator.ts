import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Validates theme extraction request
 * Ensures either an image file or image URL is provided
 */
export const validateThemeExtraction = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const imageFile = req.file;
  const imageUrl = req.body.imageUrl;

  // Check if at least one input method is provided
  if (!imageFile && !imageUrl) {
    throw ApiError.badRequest(
      'Image file or URL is required',
      'MISSING_IMAGE_INPUT'
    );
  }

  // Validate image URL format if provided
  if (imageUrl) {
    try {
      const url = new URL(imageUrl);

      // Check if URL uses http or https protocol
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw ApiError.badRequest(
          'Image URL must use HTTP or HTTPS protocol',
          'INVALID_IMAGE_URL'
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.badRequest(
        'Invalid image URL format',
        'INVALID_IMAGE_URL'
      );
    }
  }

  // Validate file type if file is provided
  if (imageFile) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      throw ApiError.badRequest(
        `Invalid image format. Allowed formats: ${allowedMimeTypes.join(', ')}`,
        'INVALID_IMAGE_FORMAT'
      );
    }

    // Check file size (should be caught by multer, but double-check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      throw ApiError.badRequest(
        'Image file size must be less than 10MB',
        'FILE_TOO_LARGE'
      );
    }
  }

  next();
};

/**
 * Validates assembly generation request
 * Ensures required fields are present and valid
 */
export const validateAssemblyGeneration = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { templateId, themeId, customizations } = req.body;

  // Check required fields
  if (!templateId) {
    throw ApiError.badRequest(
      'templateId is required',
      'MISSING_TEMPLATE_ID'
    );
  }

  if (!themeId) {
    throw ApiError.badRequest(
      'themeId is required',
      'MISSING_THEME_ID'
    );
  }

  // Validate templateId format (should be a string)
  if (typeof templateId !== 'string' || templateId.trim() === '') {
    throw ApiError.badRequest(
      'templateId must be a non-empty string',
      'INVALID_TEMPLATE_ID'
    );
  }

  // Validate themeId format (should be a string)
  if (typeof themeId !== 'string' || themeId.trim() === '') {
    throw ApiError.badRequest(
      'themeId must be a non-empty string',
      'INVALID_THEME_ID'
    );
  }

  // Validate customizations if provided
  if (customizations !== undefined) {
    if (typeof customizations !== 'object' || customizations === null) {
      throw ApiError.badRequest(
        'customizations must be an object',
        'INVALID_CUSTOMIZATIONS'
      );
    }

    // Optional: Add specific validation for customization properties
    if (customizations.colors && !Array.isArray(customizations.colors)) {
      throw ApiError.badRequest(
        'customizations.colors must be an array',
        'INVALID_CUSTOMIZATIONS'
      );
    }

    if (customizations.layout && typeof customizations.layout !== 'string') {
      throw ApiError.badRequest(
        'customizations.layout must be a string',
        'INVALID_CUSTOMIZATIONS'
      );
    }
  }

  next();
};

/**
 * Validates ID parameter in routes (e.g., /api/resource/:id)
 */
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id) {
      throw ApiError.badRequest(
        `${paramName} parameter is required`,
        'MISSING_ID_PARAM'
      );
    }

    if (typeof id !== 'string' || id.trim() === '') {
      throw ApiError.badRequest(
        `${paramName} must be a non-empty string`,
        'INVALID_ID_PARAM'
      );
    }

    next();
  };
};

/**
 * Validates query parameters for filtering templates
 */
export const validateTemplateQuery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { category, limit, offset } = req.query;

  // Validate category if provided
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw ApiError.badRequest(
        'category must be a non-empty string',
        'INVALID_CATEGORY'
      );
    }

    // Optional: Validate against allowed categories
    const allowedCategories = ['landing', 'dashboard', 'ecommerce', 'blog', 'portfolio'];
    if (!allowedCategories.includes(category)) {
      throw ApiError.badRequest(
        `category must be one of: ${allowedCategories.join(', ')}`,
        'INVALID_CATEGORY'
      );
    }
  }

  // Validate limit if provided
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw ApiError.badRequest(
        'limit must be a number between 1 and 100',
        'INVALID_LIMIT'
      );
    }
  }

  // Validate offset if provided
  if (offset !== undefined) {
    const offsetNum = Number(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw ApiError.badRequest(
        'offset must be a non-negative number',
        'INVALID_OFFSET'
      );
    }
  }

  next();
};
