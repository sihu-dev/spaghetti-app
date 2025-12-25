import { Router } from 'express';
import { generateAssembly, getAssembly } from '../controllers/assembly.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validateAssemblyGeneration, validateIdParam } from '../middleware/validator';

const router = Router();

/**
 * @swagger
 * /api/assembly/generate:
 *   post:
 *     summary: Generate design assembly
 *     description: Combines a design template with a color theme to generate complete, customized component code using AI. The assembly process uses Claude AI to intelligently merge the template structure with theme colors and apply any custom modifications to create production-ready code.
 *     tags: [Assembly]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssemblyGenerationRequest'
 *           examples:
 *             basic:
 *               summary: Basic assembly without customizations
 *               value:
 *                 templateId: '550e8400-e29b-41d4-a716-446655440000'
 *                 themeId: '1'
 *             withCustomizations:
 *               summary: Assembly with custom content
 *               value:
 *                 templateId: '550e8400-e29b-41d4-a716-446655440000'
 *                 themeId: '1'
 *                 customizations:
 *                   title: 'Welcome to Our Platform'
 *                   subtitle: 'Build amazing experiences with our design system'
 *                   buttonText: 'Get Started'
 *                   buttonLink: '/signup'
 *                   imageUrl: 'https://example.com/hero-bg.jpg'
 *     responses:
 *       201:
 *         description: Assembly generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assembly'
 *             example:
 *               success: true
 *               data:
 *                 id: '550e8400-e29b-41d4-a716-446655440001'
 *                 templateId: '550e8400-e29b-41d4-a716-446655440000'
 *                 themeId: '1'
 *                 customizations:
 *                   title: 'Welcome to Our Platform'
 *                   subtitle: 'Build amazing experiences'
 *                   buttonText: 'Get Started'
 *                 generatedCode: |
 *                   import React from 'react';
 *
 *                   export const HeroSection = () => {
 *                     return (
 *                       <section style={{ backgroundColor: '#FF5733' }}>
 *                         <h1 style={{ color: '#000000' }}>Welcome to Our Platform</h1>
 *                         <p style={{ color: '#333333' }}>Build amazing experiences</p>
 *                         <button style={{ backgroundColor: '#3357FF', color: '#FFFFFF' }}>
 *                           Get Started
 *                         </button>
 *                       </section>
 *                     );
 *                   };
 *                 createdAt: '2025-12-25T10:30:00Z'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'templateId and themeId are required'
 *                     code: 'MISSING_REQUIRED_FIELDS'
 *               invalidTemplateId:
 *                 summary: Invalid template ID
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'Invalid templateId format'
 *                     code: 'INVALID_TEMPLATE_ID'
 *       404:
 *         description: Template or theme not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               templateNotFound:
 *                 summary: Template not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'Template not found'
 *                     code: 'TEMPLATE_NOT_FOUND'
 *               themeNotFound:
 *                 summary: Theme not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: 'Theme not found'
 *                     code: 'THEME_NOT_FOUND'
 *       500:
 *         description: Internal server error - assembly generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Failed to generate assembly'
 *                 code: 'ASSEMBLY_GENERATION_FAILED'
 */
router.post(
  '/generate',
  asyncHandler(validateAssemblyGeneration),
  asyncHandler(generateAssembly)
);

/**
 * @swagger
 * /api/assembly/{id}:
 *   get:
 *     summary: Get assembly by ID
 *     description: Retrieves a previously generated assembly by its unique identifier, including the complete generated code and all associated metadata.
 *     tags: [Assembly]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assembly unique identifier
 *         example: '550e8400-e29b-41d4-a716-446655440001'
 *     responses:
 *       200:
 *         description: Assembly retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assembly'
 *             example:
 *               success: true
 *               data:
 *                 id: '550e8400-e29b-41d4-a716-446655440001'
 *                 templateId: '550e8400-e29b-41d4-a716-446655440000'
 *                 themeId: '1'
 *                 customizations:
 *                   title: 'Welcome to Our Platform'
 *                   subtitle: 'Build amazing experiences'
 *                   buttonText: 'Get Started'
 *                 generatedCode: |
 *                   import React from 'react';
 *
 *                   export const HeroSection = () => {
 *                     return (
 *                       <section style={{ backgroundColor: '#FF5733' }}>
 *                         <h1>Welcome to Our Platform</h1>
 *                         <button>Get Started</button>
 *                       </section>
 *                     );
 *                   };
 *                 createdAt: '2025-12-25T10:30:00Z'
 *       400:
 *         description: Bad request - invalid assembly ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Assembly ID is required'
 *                 code: 'MISSING_ID'
 *       404:
 *         description: Assembly not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: 'Assembly with ID "550e8400-e29b-41d4-a716-446655440001" not found'
 *                 code: 'ASSEMBLY_NOT_FOUND'
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
  asyncHandler(getAssembly)
);

export default router;
