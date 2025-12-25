import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import themeRoutes from './routes/theme.routes';
import assemblyRoutes from './routes/assembly.routes';
import templateRoutes from './routes/template.routes';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedPatterns = [
      /^chrome-extension:\/\/.+$/,
      /^http:\/\/localhost(:\d+)?$/,
      /^https:\/\/.+\.github\.dev$/
    ];

    if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 미들웨어
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API 라우트
app.use('/api/theme', themeRoutes);
app.use('/api/assembly', assemblyRoutes);
app.use('/api/templates', templateRoutes);

// 헬스 체크
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// API 문서 엔드포인트
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'AI Spaghetti API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      theme: {
        extract: 'POST /api/theme/extract',
        get: 'GET /api/theme/:id',
        list: 'GET /api/theme'
      },
      assembly: {
        generate: 'POST /api/assembly/generate',
        get: 'GET /api/assembly/:id'
      },
      templates: {
        list: 'GET /api/templates',
        get: 'GET /api/templates/:id'
      }
    }
  });
});

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// 글로벌 에러 핸들러
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);

  const statusCode = err.name === 'ValidationError' ? 400 : 500;

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 서버 시작
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🍝 AI Spaghetti Backend running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API docs: http://localhost:${PORT}/api`);
    console.log(`   Theme API: http://localhost:${PORT}/api/theme/extract`);
    console.log(`   Templates API: http://localhost:${PORT}/api/templates`);
    console.log(`   Assembly API: http://localhost:${PORT}/api/assembly/generate`);
  });
}

export default app;
