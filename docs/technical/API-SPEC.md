# SPAGHETTI API 명세서

> RESTful API 엔드포인트 및 데이터 스키마 정의

## 목차
1. [Base URL](#base-url)
2. [인증](#인증)
3. [공통 응답 형식](#공통-응답-형식)
4. [Theme API](#theme-api)
5. [Assembly API](#assembly-api)
6. [Template API](#template-api)
7. [에러 코드](#에러-코드)
8. [Rate Limiting](#rate-limiting)

---

## Base URL

```
Development:  http://localhost:3000/api
Production:   https://api.spaghetti.dev/api
```

---

## 인증

현재 버전 (v1.0)은 인증이 필요하지 않습니다.

**향후 버전:**
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { /* 응답 데이터 */ }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "에러 메시지",
  "message": "상세 에러 설명"
}
```

---

## Theme API

### 1. 이미지에서 테마 추출

Claude AI를 사용하여 이미지에서 색상 팔레트를 추출합니다.

**Endpoint:**
```
POST /api/theme/extract
```

**Request (Multipart Form Data):**

**옵션 1: 파일 업로드**
```http
Content-Type: multipart/form-data

image: [File] (required)
```

**옵션 2: 이미지 URL**
```http
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg"
}
```

**Request 제약사항:**
- 파일 크기: 최대 10MB
- 지원 형식: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- `image` 또는 `imageUrl` 중 하나는 필수

**cURL Example:**

```bash
# 파일 업로드
curl -X POST http://localhost:3000/api/theme/extract \
  -F "image=@/path/to/image.jpg"

# URL 사용
curl -X POST http://localhost:3000/api/theme/extract \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/brand-logo.png"}'
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "colors": [
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#0f172a",
      "#1e293b",
      "#f8fafc"
    ],
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#06b6d4",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc",
    "mood": "모던하고 전문적인 분위기의 다크 테마",
    "suggestion": "기술 제품, SaaS 플랫폼, 개발 도구에 적합한 테마입니다. Primary 색상은 CTA 버튼에, Secondary는 링크와 강조 요소에 사용하세요.",
    "createdAt": "2025-12-24T10:30:00.000Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `colors` | `string[]` | 추출된 색상 배열 (5-10개) |
| `primary` | `string` | 주요 브랜드 색상 (버튼, 링크) |
| `secondary` | `string` | 보조 색상 (강조 요소) |
| `accent` | `string` | 액센트 색상 (하이라이트) |
| `background` | `string` | 배경색 |
| `surface` | `string` | 카드, 패널 등 표면색 |
| `text` | `string` | 기본 텍스트 색상 |
| `mood` | `string` | 테마의 분위기 설명 |
| `suggestion` | `string` | 테마 활용 제안 |
| `createdAt` | `string` | ISO 8601 형식의 생성 시각 |

**Error Responses:**

```json
// 400 Bad Request - 이미지 누락
{
  "success": false,
  "error": "Image file or URL is required"
}

// 400 Bad Request - 잘못된 파일 형식
{
  "success": false,
  "error": "Only image files are allowed"
}

// 413 Payload Too Large - 파일 크기 초과
{
  "success": false,
  "error": "File size exceeds 10MB"
}

// 500 Internal Server Error - 추출 실패
{
  "success": false,
  "error": "Failed to extract theme",
  "message": "Claude API error: ..."
}
```

---

## Assembly API

### 1. Assembly 생성

Template과 Theme을 조합하여 React 컴포넌트 코드를 생성합니다.

**Endpoint:**
```
POST /api/assembly/generate
```

**Request Body:**

```json
{
  "templateId": "hero-section-01",
  "themeId": "theme-dark-blue",
  "customizations": {
    "backgroundColor": "#0f172a",
    "padding": "24px",
    "borderRadius": "12px",
    "fontSize": "16px",
    "fontFamily": "Inter, sans-serif"
  }
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateId` | `string` | Yes | Template ID |
| `themeId` | `string` | Yes | Theme ID |
| `customizations` | `object` | No | 커스터마이징 옵션 |

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/assembly/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "hero-section-01",
    "themeId": "theme-dark-blue",
    "customizations": {
      "padding": "24px"
    }
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "a7b3c9d2-8e4f-4a1b-9c3d-2e8f7a1b9c3d",
    "templateId": "hero-section-01",
    "themeId": "theme-dark-blue",
    "customizations": {
      "backgroundColor": "#0f172a",
      "padding": "24px",
      "borderRadius": "12px"
    },
    "generatedCode": "import React from 'react';\n\nconst Component = () => {\n  return (\n    <div style={{\n      backgroundColor: '#0f172a',\n      padding: '24px',\n      borderRadius: '12px'\n    }}>\n      <h1>Generated Component</h1>\n    </div>\n  );\n};\n\nexport default Component;",
    "createdAt": "2025-12-24T10:35:00.000Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 |
| `templateId` | `string` | 사용된 Template ID |
| `themeId` | `string` | 사용된 Theme ID |
| `customizations` | `object` | 적용된 커스터마이징 |
| `generatedCode` | `string` | 생성된 React 코드 |
| `createdAt` | `string` | ISO 8601 생성 시각 |

**Error Responses:**

```json
// 400 Bad Request - 필수 필드 누락
{
  "success": false,
  "error": "templateId and themeId are required"
}

// 404 Not Found - Template 없음
{
  "success": false,
  "error": "Failed to generate assembly",
  "message": "Template hero-section-01 not found"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to generate assembly",
  "message": "Code generation error: ..."
}
```

### 2. Assembly 조회

생성된 Assembly를 ID로 조회합니다.

**Endpoint:**
```
GET /api/assembly/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Assembly UUID |

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/assembly/a7b3c9d2-8e4f-4a1b-9c3d-2e8f7a1b9c3d
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "a7b3c9d2-8e4f-4a1b-9c3d-2e8f7a1b9c3d",
    "templateId": "hero-section-01",
    "themeId": "theme-dark-blue",
    "customizations": {
      "padding": "24px"
    },
    "generatedCode": "import React from 'react';\n...",
    "createdAt": "2025-12-24T10:35:00.000Z"
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "error": "Assembly not found"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Failed to get assembly",
  "message": "Database error: ..."
}
```

---

## Template API

### 1. 템플릿 목록 조회

사용 가능한 모든 템플릿을 조회합니다.

**Endpoint:**
```
GET /api/templates
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | `string` | No | 카테고리 필터 (hero, navbar, footer 등) |
| `limit` | `number` | No | 결과 개수 제한 (기본: 20) |
| `offset` | `number` | No | 페이지네이션 오프셋 (기본: 0) |

**cURL Example:**

```bash
# 모든 템플릿 조회
curl -X GET http://localhost:3000/api/templates

# 카테고리 필터
curl -X GET "http://localhost:3000/api/templates?category=hero&limit=10"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "hero-section-01",
        "name": "Modern Hero Section",
        "category": "hero",
        "description": "현대적인 히어로 섹션 템플릿",
        "thumbnail": "https://cdn.spaghetti.dev/templates/hero-01.png",
        "tags": ["hero", "landing", "modern"],
        "createdAt": "2025-12-01T00:00:00.000Z"
      },
      {
        "id": "navbar-01",
        "name": "Responsive Navbar",
        "category": "navbar",
        "description": "반응형 내비게이션 바",
        "thumbnail": "https://cdn.spaghetti.dev/templates/navbar-01.png",
        "tags": ["navbar", "responsive", "mobile"],
        "createdAt": "2025-12-01T00:00:00.000Z"
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

### 2. 템플릿 상세 조회

특정 템플릿의 상세 정보를 조회합니다.

**Endpoint:**
```
GET /api/templates/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Template ID |

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/templates/hero-section-01
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "hero-section-01",
    "name": "Modern Hero Section",
    "category": "hero",
    "description": "현대적인 히어로 섹션 템플릿",
    "thumbnail": "https://cdn.spaghetti.dev/templates/hero-01.png",
    "preview": "https://cdn.spaghetti.dev/templates/hero-01-preview.png",
    "tags": ["hero", "landing", "modern"],
    "baseCode": "import React from 'react';\n\nconst HeroSection = () => {\n  return (\n    <section className=\"hero\">\n      {/* Template code */}\n    </section>\n  );\n};\n\nexport default HeroSection;",
    "customizableProps": {
      "backgroundColor": {
        "type": "color",
        "default": "#FFFFFF",
        "description": "배경 색상"
      },
      "padding": {
        "type": "spacing",
        "default": "64px",
        "description": "내부 여백"
      },
      "borderRadius": {
        "type": "size",
        "default": "8px",
        "description": "모서리 둥글기"
      }
    },
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "error": "Template not found"
}
```

---

## 에러 코드

### HTTP Status Codes

| Code | Description | 사용 사례 |
|------|-------------|-----------|
| `200` | OK | 성공적인 GET 요청 |
| `201` | Created | 성공적인 POST 요청 (리소스 생성) |
| `400` | Bad Request | 잘못된 요청 파라미터 |
| `401` | Unauthorized | 인증 실패 (향후 버전) |
| `403` | Forbidden | 권한 없음 (향후 버전) |
| `404` | Not Found | 리소스를 찾을 수 없음 |
| `413` | Payload Too Large | 파일 크기 초과 |
| `422` | Unprocessable Entity | 유효성 검증 실패 |
| `429` | Too Many Requests | Rate Limit 초과 |
| `500` | Internal Server Error | 서버 내부 오류 |
| `502` | Bad Gateway | 외부 API 오류 (Claude API) |
| `503` | Service Unavailable | 서버 점검 중 |

### 커스텀 에러 코드

**에러 응답에 포함되는 `code` 필드:**

```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "THEME_EXTRACTION_FAILED",
  "message": "상세 설명"
}
```

| Code | Description |
|------|-------------|
| `IMAGE_REQUIRED` | 이미지 파일 또는 URL이 필요함 |
| `INVALID_IMAGE_FORMAT` | 지원하지 않는 이미지 형식 |
| `IMAGE_TOO_LARGE` | 이미지 크기 초과 (10MB) |
| `THEME_EXTRACTION_FAILED` | Claude API 테마 추출 실패 |
| `INVALID_COLOR_FORMAT` | 잘못된 색상 코드 형식 |
| `TEMPLATE_NOT_FOUND` | Template ID를 찾을 수 없음 |
| `THEME_NOT_FOUND` | Theme ID를 찾을 수 없음 |
| `ASSEMBLY_NOT_FOUND` | Assembly ID를 찾을 수 없음 |
| `CODE_GENERATION_FAILED` | React 코드 생성 실패 |
| `CLAUDE_API_ERROR` | Anthropic API 오류 |
| `STORAGE_ERROR` | 데이터 저장 오류 |

---

## Rate Limiting

**현재 버전:** Rate Limiting 없음

**향후 계획:**

```
Free Tier:
- 100 requests/hour
- 1000 requests/day

Pro Tier:
- 1000 requests/hour
- 10000 requests/day
```

**Rate Limit 응답:**

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735044000

{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "You have exceeded the rate limit. Please try again in 15 minutes."
}
```

---

## Webhooks (향후 기능)

향후 버전에서는 Assembly 생성 완료 시 Webhook을 지원할 예정입니다.

**Webhook Event Example:**

```json
{
  "event": "assembly.created",
  "data": {
    "id": "a7b3c9d2-8e4f-4a1b-9c3d-2e8f7a1b9c3d",
    "templateId": "hero-section-01",
    "themeId": "theme-dark-blue",
    "createdAt": "2025-12-24T10:35:00.000Z"
  },
  "timestamp": "2025-12-24T10:35:01.000Z"
}
```

---

## SDK 및 라이브러리

### JavaScript/TypeScript

```bash
npm install @spaghetti/client
```

```typescript
import { SpaghettiClient } from '@spaghetti/client';

const client = new SpaghettiClient({
  apiUrl: 'http://localhost:3000/api'
});

// 테마 추출
const theme = await client.theme.extract({
  imageFile: file
});

// Assembly 생성
const assembly = await client.assembly.create({
  templateId: 'hero-section-01',
  themeId: theme.id
});
```

---

## 예제 코드

### JavaScript (Fetch API)

```javascript
// 테마 추출
async function extractTheme(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:3000/api/theme/extract', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data;
}

// Assembly 생성
async function createAssembly(templateId, themeId) {
  const response = await fetch('http://localhost:3000/api/assembly/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      templateId,
      themeId,
      customizations: {
        padding: '24px'
      }
    })
  });

  const result = await response.json();
  return result.data;
}
```

### Chrome Extension

```javascript
// Service Worker에서 사용
async function extractThemeFromImage(imageBase64) {
  const blob = await base64ToBlob(imageBase64);

  const formData = new FormData();
  formData.append('image', blob, 'screenshot.png');

  const response = await fetch('http://localhost:3000/api/theme/extract', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    await chrome.storage.local.set({
      currentTheme: result.data
    });
    return result.data;
  } else {
    throw new Error(result.error);
  }
}
```

---

## 버전 관리

**현재 버전:** v1.0.0

**API Versioning (향후):**

```
/api/v1/theme/extract
/api/v2/theme/extract
```

---

## 변경 이력

### v1.0.0 (2025-12-24)
- 초기 API 릴리스
- Theme Extraction API
- Assembly Generation API
- Template List/Detail API

---

## 지원 및 피드백

- GitHub Issues: https://github.com/spaghetti/spaghetti-app/issues
- Email: support@spaghetti.dev
- Docs: https://docs.spaghetti.dev

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2025-12-24
**작성자:** SPAGHETTI Team
