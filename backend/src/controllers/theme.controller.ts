import { Request, Response } from 'express';
import { extractThemeFromImage } from '../services/theme.service';
import { Theme } from '../types';

export const extractTheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageFile = req.file;
    const imageUrl = req.body.imageUrl;

    if (!imageFile && !imageUrl) {
      res.status(400).json({
        error: 'Image file or URL is required'
      });
      return;
    }

    const theme: Theme = await extractThemeFromImage({
      imageFile,
      imageUrl
    });

    res.status(200).json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error('Theme extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract theme',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
