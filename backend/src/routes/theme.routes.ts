import { Router } from 'express';
import multer from 'multer';
import { extractTheme } from '../controllers/theme.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validateThemeExtraction } from '../middleware/validator';

const router = Router();

// 파일 업로드를 위한 multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @swagger
 * /api/theme/extract:
 *   post:
 *     summary: Extract color theme from an image
 *     description: Analyzes an uploaded image or image URL using AI to extract a color palette, detect mood, and provide design suggestions. The image is processed using Claude AI's vision capabilities to identify dominant colors and generate a comprehensive theme.
 *     tags: [Theme]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to analyze (max 10MB, formats: jpg, png, gif, webp)
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of the image to analyze (alternative to file upload)
 *             oneOf:
 *               - required: [image]
 *               - required: [imageUrl]
 *           examples:
 *             fileUpload:
 *               summary: Upload an image file
 *               value:
 *                 image: (binary)
 *             urlUpload:
 *               summary: Provide an image URL
 *               value:
 *                 imageUrl: https://example.com/design.png
 *     responses:
 *       200:
 *         description: Theme extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *             examples:
 *               success:
 *                 summary: Successful theme extraction
 *                 value:
 *                   success: true
 *                   data:
 *                     colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']
 *                     primary: '#FF5733'
 *                     secondary: '#33FF57'
 *                     accent: '#3357FF'
 *                     background: '#FFFFFF'
 *                     surface: '#F5F5F5'
 *                     text: '#000000'
 *                     mood: 'vibrant and energetic'
 *                     suggestion: 'This palette works well for modern tech products and creative applications'
 *                     createdAt: '2025-12-25T10:30:00Z'
 *       400:
 *         description: Bad request - missing image or invalid format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingImage:
 *                 summary: Missing image input
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'Image file or URL is required'
 *                     code: 'MISSING_IMAGE_INPUT'
 *               invalidFormat:
 *                 summary: Invalid file format
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'Only image files are allowed'
 *                     code: 'INVALID_FILE_TYPE'
 *       413:
 *         description: Payload too large - file exceeds 10MB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'File too large. Maximum size is 10MB'
 *                 code: 'FILE_TOO_LARGE'
 *       500:
 *         description: Internal server error - theme extraction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Failed to extract theme from image'
 *                 code: 'THEME_EXTRACTION_FAILED'
 */
router.post(
  '/extract',
  upload.single('image'),
  asyncHandler(validateThemeExtraction),
  asyncHandler(extractTheme)
);

export default router;
