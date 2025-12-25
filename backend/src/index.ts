import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { env } from './config/env';
import themeRoutes from './routes/theme.routes';
import authRoutes from './routes/auth.routes';
import docsRoutes from './routes/docs.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { requestLogger, performanceLogger } from './middleware/requestLogger';
import { securityHeaders, etag, publicCache, noCache } from './middleware/cacheControl';
import { logger } from './utils/logger';

const app = express();

// Trust proxy if behind reverse proxy (Nginx, Load Balancer, etc.)
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security middleware
if (env.ENABLE_HELMET) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
}

// CORS configuration
const corsOrigins = env.CORS_ORIGINS.split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin matches allowed patterns
    const isAllowed = corsOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return pattern === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// Request logging
app.use(requestLogger);
app.use(performanceLogger(2000)); // Log requests > 2s

// Security headers for all responses
app.use(securityHeaders);

// ETag support for efficient caching
app.use(etag());

// Rate limiting
app.use('/api/', apiLimiter);

// Health check (no rate limit, short cache)
app.get('/health', publicCache(10), (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API Documentation (no rate limit, no auth, cached)
app.use('/docs', publicCache(300), docsRoutes);

// API routes (auth routes should not be cached)
app.use('/api/auth', noCache, authRoutes);
app.use('/api/theme', themeRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({
    port: env.PORT,
    environment: env.NODE_ENV,
  }, '🍝 AI Spaghetti Backend started');

  logger.info(`   Health check: http://localhost:${env.PORT}/health`);
  logger.info(`   API Docs: http://localhost:${env.PORT}/docs`);
  logger.info(`   Auth API: http://localhost:${env.PORT}/api/auth`);
  logger.info(`   Theme API: http://localhost:${env.PORT}/api/theme/extract`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

export default app;
