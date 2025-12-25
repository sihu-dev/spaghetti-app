import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types';

/**
 * 검증 에러 클래스
 */
export class RequestValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * 필수 필드 검증
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    for (const field of fields) {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
      return;
    }

    next();
  };
};

/**
 * 이미지 파일 또는 URL 검증
 */
export const validateImageInput = (req: Request, res: Response, next: NextFunction): void => {
  const imageFile = req.file;
  const imageUrl = req.body.imageUrl as string | undefined;

  if (!imageFile && !imageUrl) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Either image file or imageUrl is required'
    });
    return;
  }

  if (imageUrl && !isValidUrl(imageUrl)) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid image URL format'
    });
    return;
  }

  next();
};

/**
 * Assembly 생성 요청 검증
 */
export const validateAssemblyRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { templateId, themeId, customizations } = req.body;

  if (!templateId || typeof templateId !== 'string') {
    errors.push({ field: 'templateId', message: 'templateId must be a non-empty string' });
  }

  if (!themeId || typeof themeId !== 'string') {
    errors.push({ field: 'themeId', message: 'themeId must be a non-empty string' });
  }

  if (customizations !== undefined && typeof customizations !== 'object') {
    errors.push({ field: 'customizations', message: 'customizations must be an object' });
  }

  if (customizations) {
    if (customizations.backgroundColor && !isValidHexColor(customizations.backgroundColor)) {
      errors.push({ field: 'customizations.backgroundColor', message: 'Invalid hex color format' });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
    return;
  }

  next();
};

/**
 * 쿼리 파라미터 검증
 */
export const validateQueryParams = (allowedParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));

    if (invalidParams.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Invalid query parameters: ${invalidParams.join(', ')}`,
        allowedParams
      });
      return;
    }

    next();
  };
};

/**
 * UUID 형식 검증
 */
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `${paramName} must be a valid UUID`
      });
      return;
    }

    next();
  };
};

// Helper functions
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
