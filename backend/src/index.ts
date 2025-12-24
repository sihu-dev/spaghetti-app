import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import themeRoutes from './routes/theme.routes';
import assemblyRoutes from './routes/assembly.routes';
import templateRoutes from './routes/template.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

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

// 라우트
app.use('/api/theme', themeRoutes);
app.use('/api/assembly', assemblyRoutes);
app.use('/api/templates', templateRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🍝 AI Spaghetti Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Theme API: http://localhost:${PORT}/api/theme/extract`);
  console.log(`   Templates API: http://localhost:${PORT}/api/templates`);
  console.log(`   Assembly API: http://localhost:${PORT}/api/assembly/generate`);
});

export default app;
