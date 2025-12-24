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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/theme/extract - 이미지에서 테마 추출
router.post(
  '/extract',
  upload.single('image'),
  asyncHandler(validateThemeExtraction),
  asyncHandler(extractTheme)
);

export default router;
