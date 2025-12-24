import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/template.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validateTemplateQuery, validateIdParam } from '../middleware/validator';

const router = Router();

// GET /api/templates
router.get(
  '/',
  asyncHandler(validateTemplateQuery),
  asyncHandler(getTemplates)
);

// GET /api/templates/:id
router.get(
  '/:id',
  asyncHandler(validateIdParam()),
  asyncHandler(getTemplateById)
);

export default router;
