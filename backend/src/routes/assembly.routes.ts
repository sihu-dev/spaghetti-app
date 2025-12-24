import { Router } from 'express';
import { generateAssembly, getAssembly } from '../controllers/assembly.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validateAssemblyGeneration, validateIdParam } from '../middleware/validator';

const router = Router();

// POST /api/assembly/generate
router.post(
  '/generate',
  asyncHandler(validateAssemblyGeneration),
  asyncHandler(generateAssembly)
);

// GET /api/assembly/:id
router.get(
  '/:id',
  asyncHandler(validateIdParam()),
  asyncHandler(getAssembly)
);

export default router;
