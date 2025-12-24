import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import themeRoutes from './routes/theme.routes';

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

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🍝 AI Spaghetti Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Theme API: http://localhost:${PORT}/api/theme/extract`);
});

export default app;
