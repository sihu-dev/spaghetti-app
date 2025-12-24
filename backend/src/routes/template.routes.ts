import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/template.controller';

const router = Router();

// GET /api/templates
router.get('/', getTemplates);

// GET /api/templates/:id
router.get('/:id', getTemplateById);

export default router;
