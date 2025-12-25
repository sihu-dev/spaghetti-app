import { Request, Response, NextFunction } from 'express';
import { extractThemeFromImage } from '../services/theme.service';
import { Theme } from '../schemas/theme.schema';
import { asyncHandler } from '../middleware/errorHandler';
import { Errors } from '../utils/errors';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

function createSuccessResponse<T>(data: T, requestId?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

export const extractTheme = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const imageFile = req.file;
  const imageUrl = req.body.imageUrl;

  if (!imageFile && !imageUrl) {
    throw Errors.badRequest('Image file or URL is required');
  }

  const theme: Theme = await extractThemeFromImage(imageFile, imageUrl);

  const requestId = req.headers['x-request-id'] as string | undefined;
  res.status(200).json(createSuccessResponse(theme, requestId));
});
