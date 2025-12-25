import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPAGHETTI API',
      version: '1.0.0',
      description: 'Design Automation Platform - API for extracting themes from images, managing templates, and generating design assemblies using AI',
      contact: {
        name: 'SPAGHETTI Team',
        email: 'support@spaghetti.dev'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.spaghetti.dev',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization token (for future use)'
        }
      },
      schemas: {
        Theme: {
          type: 'object',
          required: ['colors'],
          properties: {
            id: {
              type: 'integer',
              description: 'Theme unique identifier',
              example: 1
            },
            colors: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^#[0-9A-Fa-f]{6}$'
              },
              description: 'Array of color hex codes extracted from the image',
              example: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']
            },
            primary: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Primary color',
              example: '#FF5733'
            },
            secondary: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Secondary color',
              example: '#33FF57'
            },
            accent: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Accent color',
              example: '#3357FF'
            },
            background: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Background color',
              example: '#FFFFFF'
            },
            surface: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Surface color',
              example: '#F5F5F5'
            },
            text: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Text color',
              example: '#000000'
            },
            mood: {
              type: 'string',
              description: 'Detected mood or atmosphere of the color palette',
              example: 'vibrant and energetic'
            },
            suggestion: {
              type: 'string',
              description: 'AI-generated suggestions for using the theme',
              example: 'This palette works well for modern tech products and creative applications'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Theme creation timestamp',
              example: '2025-12-25T10:30:00Z'
            },
            savedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Theme save timestamp',
              example: '2025-12-25T10:30:00Z'
            }
          }
        },
        Template: {
          type: 'object',
          required: ['id', 'name', 'category', 'description', 'componentType'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Template unique identifier',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            name: {
              type: 'string',
              description: 'Template name',
              example: 'Hero Section'
            },
            category: {
              type: 'string',
              description: 'Template category',
              enum: ['hero', 'navbar', 'footer', 'card', 'form', 'button', 'layout'],
              example: 'hero'
            },
            description: {
              type: 'string',
              description: 'Template description',
              example: 'A modern hero section with image background and CTA buttons'
            },
            previewImage: {
              type: 'string',
              format: 'uri',
              description: 'URL to template preview image',
              example: 'https://example.com/previews/hero-1.png'
            },
            componentType: {
              type: 'string',
              description: 'Type of component',
              example: 'React'
            },
            props: {
              type: 'object',
              description: 'Component properties and configuration',
              additionalProperties: true,
              example: {
                hasImage: true,
                buttonCount: 2,
                alignment: 'center'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Template creation timestamp',
              example: '2025-12-25T10:30:00Z'
            }
          }
        },
        Assembly: {
          type: 'object',
          required: ['id', 'templateId', 'themeId', 'generatedCode'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Assembly unique identifier',
              example: '550e8400-e29b-41d4-a716-446655440001'
            },
            templateId: {
              type: 'string',
              format: 'uuid',
              description: 'Reference to the template used',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            themeId: {
              type: 'string',
              description: 'Reference to the theme used',
              example: '1'
            },
            customizations: {
              type: 'object',
              description: 'Custom modifications to the template',
              additionalProperties: true,
              example: {
                title: 'Welcome to Our Platform',
                subtitle: 'Build amazing experiences',
                buttonText: 'Get Started'
              }
            },
            generatedCode: {
              type: 'string',
              description: 'AI-generated component code',
              example: 'import React from "react";\n\nexport const HeroSection = () => {\n  return <div>...</div>;\n};'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Assembly creation timestamp',
              example: '2025-12-25T10:30:00Z'
            }
          }
        },
        AssemblyGenerationRequest: {
          type: 'object',
          required: ['templateId', 'themeId'],
          properties: {
            templateId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the template to use',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            themeId: {
              type: 'string',
              description: 'ID of the theme to apply',
              example: '1'
            },
            customizations: {
              type: 'object',
              description: 'Optional customizations for the template',
              additionalProperties: true,
              example: {
                title: 'Custom Hero Title',
                subtitle: 'Custom Subtitle',
                buttonText: 'Click Me'
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
              additionalProperties: true
            },
            count: {
              type: 'integer',
              description: 'Number of items in data array (for list endpoints)',
              example: 10
            },
            message: {
              type: 'string',
              description: 'Optional message',
              example: 'Operation completed successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Always false for errors',
              example: false
            },
            error: {
              type: 'object',
              required: ['message', 'code'],
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Image file or URL is required'
                },
                code: {
                  type: 'string',
                  description: 'Error code',
                  example: 'MISSING_IMAGE_INPUT'
                },
                details: {
                  type: 'object',
                  description: 'Additional error details',
                  additionalProperties: true
                }
              }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Server status',
              example: 'ok'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current server timestamp',
              example: '2025-12-25T10:30:00.000Z'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Theme',
        description: 'Theme extraction and color palette generation from images'
      },
      {
        name: 'Template',
        description: 'Design template management and retrieval'
      },
      {
        name: 'Assembly',
        description: 'Design assembly generation combining templates and themes'
      },
      {
        name: 'Health',
        description: 'API health check and status'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
