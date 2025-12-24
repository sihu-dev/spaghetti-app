# SPAGHETTI Backend API

Express.js + TypeScript 기반 REST API 서버

## 프로젝트 구조

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── theme.controller.ts
│   │   ├── assembly.controller.ts
│   │   └── template.controller.ts
│   ├── routes/               # API routes
│   │   ├── theme.routes.ts
│   │   ├── assembly.routes.ts
│   │   └── template.routes.ts
│   ├── services/             # Business logic
│   │   ├── theme.service.ts
│   │   ├── assembly.service.ts
│   │   └── template.service.ts
│   ├── models/               # Data models
│   │   ├── Theme.model.ts
│   │   ├── Assembly.model.ts
│   │   └── Template.model.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── index.ts              # Entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
cp .env.example .env
```

필요한 환경 변수:
- `PORT`: 서버 포트 (기본값: 5000)
- `OPENAI_API_KEY`: OpenAI API 키 (테마 추출용)
- `ANTHROPIC_API_KEY`: Anthropic API 키 (대체 AI 서비스)

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:5000`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### 테마 관리

#### POST /api/theme/extract
이미지에서 디자인 테마 추출

**Request:**
- `Content-Type: multipart/form-data`
- Body: `image` (파일) 또는 `imageUrl` (문자열)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#8B5CF6",
    "accentColor": "#F59E0B",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "fontFamily": "Inter, sans-serif",
    "borderRadius": "8px",
    "spacing": "16px",
    "extractedFrom": "uploaded-file",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 어셈블리 관리

#### POST /api/assembly/generate
새로운 컴포넌트 어셈블리 생성

**Request:**
```json
{
  "templateId": "hero-1",
  "themeId": "uuid",
  "customizations": {
    "backgroundColor": "#FFFFFF",
    "padding": "24px"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "templateId": "hero-1",
    "themeId": "uuid",
    "customizations": { ... },
    "generatedCode": "import React...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/assembly/:id
어셈블리 상세 조회

### 템플릿 관리

#### GET /api/templates
모든 템플릿 목록 조회

**Query Parameters:**
- `category` (optional): 카테고리로 필터링 (hero, navigation, card, footer, form)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hero-1",
      "name": "Hero Section - Centered",
      "category": "hero",
      "description": "Centered hero section with title, subtitle, and CTA button",
      "previewImage": "/previews/hero-centered.png",
      "componentType": "HeroSection",
      "props": { ... },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 5
}
```

#### GET /api/templates/:id
템플릿 상세 조회

### 헬스 체크

#### GET /health
서버 상태 확인

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "SPAGHETTI API"
}
```

## 기술 스택

- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Multer** - 파일 업로드
- **UUID** - 고유 ID 생성
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - 환경 변수 관리

## 개발 가이드

### TypeScript 컴파일

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 코드 구조

1. **Controllers**: HTTP 요청 처리 및 응답
2. **Services**: 비즈니스 로직 및 데이터 처리
3. **Models**: 데이터 구조 및 저장소 (현재 in-memory, 추후 DB 연결)
4. **Routes**: API 엔드포인트 정의

### 다음 단계 (TODO)

- [ ] 실제 AI 서비스 연동 (OpenAI Vision API)
- [ ] 데이터베이스 연결 (MongoDB/PostgreSQL)
- [ ] 사용자 인증 및 권한 관리
- [ ] 파일 스토리지 (AWS S3/Cloudinary)
- [ ] 실시간 코드 생성 개선
- [ ] 단위 테스트 작성
- [ ] API 문서화 (Swagger/OpenAPI)

## 라이선스

MIT
