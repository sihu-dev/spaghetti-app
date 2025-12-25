import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { ErrorCode } from '../utils/errors';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Create registry
const registry = new OpenAPIRegistry();

// Define schemas with OpenAPI extensions
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/).openapi({
  example: '#FF5733',
  description: 'Hex color code',
});

const themeSchema = z.object({
  id: z.string().optional().openapi({ example: 'theme-123' }),
  colors: z.array(hexColorSchema).min(1).max(20).openapi({
    example: ['#FF5733', '#33FF57', '#3357FF'],
  }),
  primary: hexColorSchema.optional(),
  secondary: hexColorSchema.optional(),
  accent: hexColorSchema.optional(),
  background: hexColorSchema.optional(),
  surface: hexColorSchema.optional(),
  text: hexColorSchema.optional(),
  mood: z.string().max(500).optional().openapi({ example: 'Vibrant and energetic' }),
  suggestion: z.string().max(1000).optional().openapi({ example: 'Great for creative websites' }),
  createdAt: z.string().datetime().optional(),
}).openapi('Theme');

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().openapi({ example: ErrorCode.BAD_REQUEST }),
    message: z.string().openapi({ example: 'Invalid request' }),
    details: z.record(z.unknown()).optional(),
  }),
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
}).openapi('ErrorResponse');

const successResponseSchema = z.object({
  success: z.literal(true),
  data: themeSchema,
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
}).openapi('ThemeSuccessResponse');

// Register schemas
registry.register('Theme', themeSchema);
registry.register('ErrorResponse', errorResponseSchema);
registry.register('ThemeSuccessResponse', successResponseSchema);

// Health check endpoint
registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health Check',
  description: 'Returns the health status of the API server',
  tags: ['System'],
  responses: {
    200: {
      description: 'Server is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ok'),
            environment: z.string(),
            timestamp: z.string().datetime(),
            version: z.string(),
          }).openapi('HealthResponse'),
        },
      },
    },
  },
});

// Theme extraction endpoint
registry.registerPath({
  method: 'post',
  path: '/api/theme/extract',
  summary: 'Extract Theme from Image',
  description: 'Analyzes an image using Claude AI and extracts a color palette suitable for web UI themes',
  tags: ['Theme'],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            image: z.any().openapi({ type: 'string', format: 'binary', description: 'Image file' }),
            imageUrl: z.string().url().optional().openapi({ description: 'URL of the image to analyze' }),
          }).openapi('ThemeExtractRequest'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Theme extracted successfully',
      content: {
        'application/json': {
          schema: successResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request (missing image, invalid URL, SSRF blocked)',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    429: {
      description: 'Rate limit exceeded',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'Theme extraction failed',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// Templates endpoint
registry.registerPath({
  method: 'get',
  path: '/api/templates',
  summary: 'List Templates',
  description: 'Returns a list of available component templates',
  tags: ['Templates'],
  request: {
    query: z.object({
      category: z.string().optional().openapi({ description: 'Filter by template category' }),
    }),
  },
  responses: {
    200: {
      description: 'List of templates',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(z.object({
              id: z.string(),
              name: z.string(),
              category: z.string(),
              description: z.string(),
              previewImage: z.string(),
              componentType: z.string(),
            })),
          }).openapi('TemplateListResponse'),
        },
      },
    },
  },
});

// Assembly generation endpoint
registry.registerPath({
  method: 'post',
  path: '/api/assembly/generate',
  summary: 'Generate Component Assembly',
  description: 'Generates React component code by combining a template with a theme',
  tags: ['Assembly'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            templateId: z.string().openapi({ example: 'hero-1' }),
            themeId: z.string().openapi({ example: 'theme-123' }),
            customizations: z.record(z.unknown()).optional(),
          }).openapi('AssemblyGenerateRequest'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Assembly generated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              id: z.string(),
              templateId: z.string(),
              themeId: z.string(),
              customizations: z.record(z.unknown()).optional(),
              generatedCode: z.string(),
              createdAt: z.string().datetime(),
            }),
          }).openapi('AssemblySuccessResponse'),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: 'Template not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'SPAGHETTI API',
    version: '1.0.0',
    description: `
# SPAGHETTI API

AI-driven design system automation tool that extracts theme colors from images using Claude AI.

## Features

- **Theme Extraction**: Upload an image or provide a URL to extract a harmonious color palette
- **Template Library**: Browse and select from pre-built component templates
- **Assembly Generation**: Combine themes and templates to generate React components

## Rate Limits

- General API: 100 requests per 15 minutes
- Theme Extraction (AI): 10 requests per minute

## Security

- SSRF Protection: Private IPs and localhost are blocked
- Input Validation: All inputs are validated using Zod schemas
- Helmet: Security headers are applied in production
    `,
    contact: {
      name: 'SPAGHETTI Team',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'System', description: 'System endpoints' },
    { name: 'Theme', description: 'Theme extraction endpoints' },
    { name: 'Templates', description: 'Template management endpoints' },
    { name: 'Assembly', description: 'Component assembly endpoints' },
  ],
});
