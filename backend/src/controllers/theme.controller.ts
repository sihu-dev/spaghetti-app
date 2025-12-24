import { Request, Response } from 'express';
import { extractThemeFromImage } from '../services/theme.service';
import { Theme } from '../types';
import { ApiError } from '../middleware/errorHandler';

export const extractTheme = async (req: Request, res: Response): Promise<void> => {
  const imageFile = req.file;
  const imageUrl = req.body.imageUrl;

  // Validation is now handled by middleware, but keep defensive check
  if (!imageFile && !imageUrl) {
    throw ApiError.badRequest('Image file or URL is required', 'MISSING_IMAGE_INPUT');
  }

  const theme: Theme = await extractThemeFromImage({
    imageFile,
    imageUrl
  });

  if (!theme || !theme.colors || theme.colors.length === 0) {
    throw ApiError.internal('Failed to extract theme from image', 'THEME_EXTRACTION_FAILED');
  }

  res.status(200).json({
    success: true,
    data: theme
  });
};
