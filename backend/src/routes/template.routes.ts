import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/template.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validateTemplateQuery, validateIdParam } from '../middleware/validator';

const router = Router();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     description: Retrieves a list of all available design templates. Templates can be optionally filtered by category to narrow down results.
 *     tags: [Template]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [hero, navbar, footer, card, form, button, layout]
 *         required: false
 *         description: Filter templates by category
 *         example: hero
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Template'
 *                 count:
 *                   type: integer
 *                   description: Number of templates returned
 *                   example: 5
 *             examples:
 *               allTemplates:
 *                 summary: All templates
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: '550e8400-e29b-41d4-a716-446655440000'
 *                       name: 'Modern Hero'
 *                       category: 'hero'
 *                       description: 'A modern hero section with gradient background'
 *                       previewImage: 'https://example.com/previews/hero-1.png'
 *                       componentType: 'React'
 *                       props:
 *                         hasImage: true
 *                         buttonCount: 2
 *                       createdAt: '2025-12-25T10:30:00Z'
 *                     - id: '550e8400-e29b-41d4-a716-446655440001'
 *                       name: 'Minimalist Navbar'
 *                       category: 'navbar'
 *                       description: 'Clean navigation bar with logo and menu'
 *                       previewImage: 'https://example.com/previews/navbar-1.png'
 *                       componentType: 'React'
 *                       props:
 *                         hasLogo: true
 *                         menuItems: 5
 *                       createdAt: '2025-12-25T10:30:00Z'
 *                   count: 2
 *               filteredTemplates:
 *                 summary: Filtered by category
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: '550e8400-e29b-41d4-a716-446655440000'
 *                       name: 'Modern Hero'
 *                       category: 'hero'
 *                       description: 'A modern hero section with gradient background'
 *                       previewImage: 'https://example.com/previews/hero-1.png'
 *                       componentType: 'React'
 *                       props:
 *                         hasImage: true
 *                         buttonCount: 2
 *                       createdAt: '2025-12-25T10:30:00Z'
 *                   count: 1
 *       500:
 *         description: Internal server error - failed to retrieve templates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Failed to retrieve templates'
 *                 code: 'TEMPLATES_RETRIEVAL_FAILED'
 */
router.get(
  '/',
  asyncHandler(validateTemplateQuery),
  asyncHandler(getTemplates)
);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     description: Retrieves detailed information about a specific template by its unique identifier.
 *     tags: [Template]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template unique identifier
 *         example: '550e8400-e29b-41d4-a716-446655440000'
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Template'
 *             example:
 *               success: true
 *               data:
 *                 id: '550e8400-e29b-41d4-a716-446655440000'
 *                 name: 'Modern Hero'
 *                 category: 'hero'
 *                 description: 'A modern hero section with gradient background and CTA buttons'
 *                 previewImage: 'https://example.com/previews/hero-1.png'
 *                 componentType: 'React'
 *                 props:
 *                   hasImage: true
 *                   buttonCount: 2
 *                   alignment: 'center'
 *                   hasOverlay: true
 *                 createdAt: '2025-12-25T10:30:00Z'
 *       400:
 *         description: Bad request - invalid template ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Template ID is required'
 *                 code: 'MISSING_ID'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Template with ID "550e8400-e29b-41d4-a716-446655440000" not found'
 *                 code: 'TEMPLATE_NOT_FOUND'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id',
  asyncHandler(validateIdParam()),
  asyncHandler(getTemplateById)
);

export default router;
