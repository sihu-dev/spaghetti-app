import { Router } from 'express';
import { generateAssembly, getAssembly } from '../controllers/assembly.controller';

const router = Router();

// POST /api/assembly/generate
router.post('/generate', generateAssembly);

// GET /api/assembly/:id
router.get('/:id', getAssembly);

export default router;
