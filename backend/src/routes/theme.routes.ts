import { Router } from 'express';
import multer from 'multer';
import { extractTheme } from '../controllers/theme.controller';
import { aiLimiter } from '../middleware/rateLimiter';
import { Errors } from '../utils/errors';

const router = Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(Errors.invalidImage(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// POST /api/theme/extract - Extract theme from image
// Apply AI rate limiter (stricter for expensive operations)
router.post('/extract', aiLimiter, upload.single('image'), extractTheme);

export default router;
