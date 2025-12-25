import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '../docs/openapi';

const router = Router();

// Serve OpenAPI JSON
router.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

// Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SPAGHETTI API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}));

export default router;
