import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import themeRoutes from './routes/theme.routes';
import assemblyRoutes from './routes/assembly.routes';
import templateRoutes from './routes/template.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import swaggerSpec from './config/swagger';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:*',
    'https://*.github.dev'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SPAGHETTI API Documentation',
    customfavIcon: '/favicon.ico'
  })
);

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/assembly', assemblyRoutes);
app.use('/api/templates', templateRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API server is running and responsive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: 'ok'
 *               timestamp: '2025-12-25T10:30:00.000Z'
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🍝 AI Spaghetti Backend running on port ${PORT}`);
  console.log(`   API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`   Swagger JSON: http://localhost:${PORT}/api-docs.json`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`   Theme API: http://localhost:${PORT}/api/theme/extract`);
  console.log(`   Templates API: http://localhost:${PORT}/api/templates`);
  console.log(`   Assembly API: http://localhost:${PORT}/api/assembly/generate`);
});

export default app;
