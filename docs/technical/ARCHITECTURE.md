# SPAGHETTI 시스템 아키텍처

> AI 기반 디자인 시스템 자동화 플랫폼의 기술 아키텍처 문서

## 목차
1. [전체 시스템 구조](#전체-시스템-구조)
2. [Chrome Extension 아키텍처](#chrome-extension-아키텍처)
3. [Backend API 아키텍처](#backend-api-아키텍처)
4. [데이터 흐름](#데이터-흐름)
5. [기술 스택](#기술-스택)

---

## 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 웹 페이지                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Content Script (Injected)                   │  │
│  │  - 페이지 색상 추출                                       │  │
│  │  - 테마 CSS 적용                                          │  │
│  │  - DOM 조작                                               │  │
│  └─────────────────┬────────────────────────────────────────┘  │
└────────────────────┼───────────────────────────────────────────┘
                     │
                     │ chrome.runtime.sendMessage()
                     │
┌────────────────────▼───────────────────────────────────────────┐
│              Chrome Extension (Manifest V3)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Service Worker (Background)                │  │
│  │  - 이벤트 핸들링                                          │  │
│  │  - Storage 관리                                           │  │
│  │  - Backend API 통신                                       │  │
│  └─────────────────┬────────────────────────────────────────┘  │
│                    │                                            │
│  ┌─────────────────▼────────────────────────────────────────┐  │
│  │                 Popup / Side Panel                       │  │
│  │  - 테마 추출 UI                                           │  │
│  │  - 테마 관리 UI                                           │  │
│  │  - 설정 UI                                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼───────────────────────────────────────────┐
│                   Backend API Server                            │
│                    (Node.js + Express)                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Routes     │  │ Controllers  │  │     Services         │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────┤ │
│  │ theme.routes │→ │theme.ctrl    │→ │theme.service         │ │
│  │assembly.     │  │assembly.ctrl │  │- Claude AI 통합      │ │
│  │  routes      │  │template.ctrl │  │- 이미지 분석         │ │
│  │template.     │  │              │  │- 색상 추출           │ │
│  │  routes      │  │              │  │- 토큰 생성           │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Models (In-Memory)                   │  │
│  │  - Theme Model                                           │  │
│  │  - Assembly Model                                        │  │
│  │  - Template Model                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     │ Anthropic API
                     │
┌────────────────────▼───────────────────────────────────────────┐
│                    Claude AI (Anthropic)                        │
│  - 이미지 비전 분석 (claude-sonnet-4)                           │
│  - 색상 팔레트 추출                                             │
│  - 테마 제안 생성                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chrome Extension 아키텍처

### Manifest V3 구조

```
extension/
├── manifest.json          # Extension 설정 (V3)
├── background/
│   └── service-worker.js  # 이벤트 기반 백그라운드 스크립트
├── content/
│   ├── content.js         # 페이지 주입 스크립트
│   └── content.css        # 스타일 주입
├── popup/
│   └── popup.html         # 확장 프로그램 팝업 UI
├── sidepanel/
│   └── sidepanel.html     # 사이드 패널 UI
├── options/
│   └── options.html       # 설정 페이지
└── icons/                 # 확장 프로그램 아이콘
```

### 주요 컴포넌트

#### 1. Service Worker (background/service-worker.js)

**역할:**
- 이벤트 기반 백그라운드 처리
- Chrome Storage API 관리
- Backend API 통신
- Context Menu 및 Commands 처리

**주요 기능:**
```javascript
// 메시지 핸들러
- EXTRACT_THEME       // 이미지에서 테마 추출
- APPLY_THEME         // 탭에 테마 적용
- SAVE_THEME          // 테마 저장 (Local Storage)
- GET_THEMES          // 저장된 테마 목록
- DELETE_THEME        // 테마 삭제
- GET_SETTINGS        // 설정 조회
- UPDATE_SETTINGS     // 설정 업데이트
- CAPTURE_TAB         // 현재 탭 캡처
```

**Storage 구조:**
```javascript
{
  settings: {
    autoApplyTheme: boolean,
    notificationsEnabled: boolean,
    apiUrl: string,
    theme: 'dark' | 'light'
  },
  themes: Theme[],
  currentTheme: Theme | null
}
```

#### 2. Content Script (content/content.js)

**역할:**
- 웹 페이지에 직접 주입
- 페이지 색상 추출
- 테마 CSS 적용

**주요 기능:**
```javascript
- injectTheme(theme)       // 테마 CSS 변수 주입
- removeTheme()            // 테마 제거
- extractPageColors()      // 페이지에서 색상 샘플링
- autoApplyTheme()         // 저장된 테마 자동 적용
```

**CSS 변수 적용:**
```css
:root {
  --ai-spaghetti-primary: #6366f1;
  --ai-spaghetti-secondary: #8b5cf6;
  --ai-spaghetti-accent: #06b6d4;
  --ai-spaghetti-background: #0f172a;
  --ai-spaghetti-surface: #1e293b;
  --ai-spaghetti-text: #f8fafc;
}
```

#### 3. Permissions & API

```json
{
  "permissions": [
    "activeTab",      // 현재 탭 액세스
    "storage",        // Chrome Storage API
    "scripting",      // Script 주입
    "contextMenus",   // 컨텍스트 메뉴
    "notifications",  // 알림
    "sidePanel"       // 사이드 패널
  ],
  "host_permissions": [
    "http://localhost:*/*",
    "https://*.github.dev/*",
    "<all_urls>"
  ]
}
```

---

## Backend API 아키텍처

### Layered Architecture (계층형 아키텍처)

```
┌─────────────────────────────────────────┐
│           HTTP Request Layer            │
│         (Express Middleware)            │
│  - CORS                                 │
│  - JSON Parser                          │
│  - Multer (File Upload)                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Routes Layer                   │
│  /api/theme/extract                     │
│  /api/assembly/generate                 │
│  /api/assembly/:id                      │
│  /api/templates                         │
│  /api/templates/:id                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Controllers Layer                │
│  - extractTheme()                       │
│  - generateAssembly()                   │
│  - getAssembly()                        │
│  - getTemplates()                       │
│  - getTemplateById()                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                  │
│  - extractThemeFromImage()              │
│  - validateColorPalette()               │
│  - calculateContrastRatio()             │
│  - createAssembly()                     │
│  - generateReactCode()                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Models Layer                   │
│  - ThemeModel (In-Memory Map)           │
│  - AssemblyModel (In-Memory Map)        │
│  - TemplateModel (In-Memory Map)        │
└─────────────────────────────────────────┘
```

### 주요 모듈

#### 1. Theme Service

**기능:**
- Claude AI를 통한 이미지 분석
- 색상 팔레트 추출
- WCAG 접근성 검증

**처리 흐름:**
```
1. 이미지 입력 (File or URL)
   ↓
2. Base64 인코딩
   ↓
3. Claude Vision API 호출
   ↓
4. JSON 응답 파싱
   ↓
5. Theme 객체 생성
   ↓
6. 대비율 검증 (calculateContrastRatio)
   ↓
7. Theme 반환
```

**Claude API 프롬프트:**
```
이미지를 분석하여 웹 UI 테마에 적합한 색상 팔레트를 추출해주세요.

JSON 응답 형식:
{
  "colors": ["#RRGGBB", ...],
  "primary": "#RRGGBB",
  "secondary": "#RRGGBB",
  "accent": "#RRGGBB",
  "background": "#RRGGBB",
  "surface": "#RRGGBB",
  "text": "#RRGGBB",
  "mood": "설명",
  "suggestion": "테마 활용 제안"
}
```

#### 2. Assembly Service

**기능:**
- Template + Theme 조합
- React 코드 생성
- Customization 적용

**생성 흐름:**
```
1. Template ID + Theme ID 수신
   ↓
2. Template 검증
   ↓
3. Customizations 병합
   ↓
4. React 코드 생성
   ↓
5. Assembly 객체 생성 (UUID)
   ↓
6. In-Memory 저장
   ↓
7. Assembly 반환
```

#### 3. Data Models

**Theme:**
```typescript
interface Theme {
  id?: number;
  colors: string[];           // 색상 팔레트 배열
  primary?: string;           // 주요 색상
  secondary?: string;         // 보조 색상
  accent?: string;            // 강조 색상
  background?: string;        // 배경색
  surface?: string;           // 표면색
  text?: string;              // 텍스트 색상
  mood?: string;              // 분위기 설명
  suggestion?: string;        // 활용 제안
  createdAt?: string;         // ISO 8601
  savedAt?: string;
}
```

**Assembly:**
```typescript
interface Assembly {
  id: string;                 // UUID
  templateId: string;
  themeId: string;
  customizations?: Record<string, any>;
  generatedCode: string;      // React 코드
  createdAt: Date;
}
```

---

## 데이터 흐름

### 1. 테마 추출 플로우

```
┌──────────────┐
│    사용자    │
│ (웹 페이지)  │
└──────┬───────┘
       │ 1. 우클릭 "이미지에서 테마 추출"
       │    또는 Ctrl+Shift+E
┌──────▼───────────────┐
│  Content Script      │
│  - 이벤트 감지       │
└──────┬───────────────┘
       │ 2. chrome.runtime.sendMessage()
┌──────▼───────────────┐
│  Service Worker      │
│  - EXTRACT_THEME     │
│  - captureTab()      │
└──────┬───────────────┘
       │ 3. HTTP POST /api/theme/extract
       │    FormData: image file
┌──────▼───────────────┐
│  Backend API         │
│  - theme.routes      │
│  - theme.controller  │
└──────┬───────────────┘
       │ 4. extractThemeFromImage()
┌──────▼───────────────┐
│  Theme Service       │
│  - Base64 인코딩     │
└──────┬───────────────┘
       │ 5. Anthropic API
┌──────▼───────────────┐
│  Claude AI           │
│  - 이미지 분석       │
│  - 색상 추출         │
└──────┬───────────────┘
       │ 6. JSON 응답
┌──────▼───────────────┐
│  Theme Service       │
│  - JSON 파싱         │
│  - Theme 객체 생성   │
└──────┬───────────────┘
       │ 7. Theme 반환
┌──────▼───────────────┐
│  Service Worker      │
│  - chrome.storage    │
│  - currentTheme 저장 │
└──────┬───────────────┘
       │ 8. sendMessage(INJECT_THEME)
┌──────▼───────────────┐
│  Content Script      │
│  - injectTheme()     │
│  - CSS 변수 적용     │
└──────┬───────────────┘
       │ 9. 테마 적용 완료
┌──────▼───────────────┐
│   웹 페이지 (변경됨) │
└──────────────────────┘
```

### 2. Assembly 생성 플로우

```
┌──────────────┐
│  Extension   │
│   Popup UI   │
└──────┬───────┘
       │ 1. "Generate Assembly" 클릭
       │    { templateId, themeId, customizations }
       │
       │ 2. HTTP POST /api/assembly/generate
┌──────▼───────────────┐
│  Backend API         │
│  - assembly.routes   │
│  - assembly.ctrl     │
└──────┬───────────────┘
       │ 3. createAssembly()
┌──────▼───────────────┐
│  Assembly Service    │
│  - Template 검증     │
│  - Theme 검증        │
└──────┬───────────────┘
       │ 4. generateReactCode()
┌──────▼───────────────┐
│  Code Generator      │
│  - Template 클론     │
│  - Theme 적용        │
│  - Customization     │
└──────┬───────────────┘
       │ 5. Assembly 객체 생성
┌──────▼───────────────┐
│  Assembly Model      │
│  - In-Memory 저장    │
│  - UUID 생성         │
└──────┬───────────────┘
       │ 6. Assembly 반환
┌──────▼───────────────┐
│  Extension Popup     │
│  - 코드 표시         │
│  - 다운로드 옵션     │
└──────────────────────┘
```

### 3. 테마 저장/조회 플로우

```
Extension Storage (chrome.storage.local)
┌─────────────────────────────────────┐
│  settings: {                        │
│    autoApplyTheme: false,           │
│    notificationsEnabled: true,      │
│    apiUrl: "http://localhost:3000"  │
│  }                                  │
│                                     │
│  themes: [                          │
│    {                                │
│      id: 1735041234567,             │
│      colors: ["#6366f1", ...],      │
│      primary: "#6366f1",            │
│      savedAt: "2025-12-24T10:30:00" │
│    }                                │
│  ]                                  │
│                                     │
│  currentTheme: {                    │
│    colors: [...],                   │
│    primary: "#6366f1",              │
│    createdAt: "2025-12-24T10:30:00" │
│  }                                  │
└─────────────────────────────────────┘
```

---

## 기술 스택

### Frontend (Chrome Extension)

| 레이어 | 기술 | 용도 |
|--------|------|------|
| **Extension API** | Chrome Extension Manifest V3 | 확장 프로그램 플랫폼 |
| **Background** | Service Worker | 이벤트 기반 백그라운드 처리 |
| **Content Script** | Vanilla JavaScript | DOM 조작 및 CSS 주입 |
| **Storage** | chrome.storage.local | 로컬 데이터 저장 |
| **UI** | HTML/CSS | Popup, Side Panel, Options |

### Backend

| 레이어 | 기술 | 용도 |
|--------|------|------|
| **Runtime** | Node.js | 서버 실행 환경 |
| **Framework** | Express.js | HTTP 서버 프레임워크 |
| **Language** | TypeScript | 타입 안전성 |
| **AI** | Anthropic Claude API | 이미지 분석 및 테마 추출 |
| **File Upload** | Multer | 멀티파트 파일 처리 |
| **CORS** | cors | Cross-Origin 요청 허용 |
| **Storage** | In-Memory Map | 임시 데이터 저장 (프로덕션: DB) |

### AI & Vision

| 기술 | 모델 | 용도 |
|------|------|------|
| **Anthropic Claude** | claude-sonnet-4-20250514 | 이미지 비전 분석 |
| **Vision API** | Image to Text | 색상 팔레트 추출 |

### Development Tools

- **Package Manager:** npm
- **Module System:** ES Modules (Backend), IIFE (Extension)
- **API Style:** RESTful API
- **Data Format:** JSON

---

## 보안 및 권한

### Extension Permissions

```javascript
// 필요한 최소 권한만 요청
{
  "activeTab": "현재 탭에만 스크립트 주입",
  "storage": "로컬 데이터 저장",
  "scripting": "동적 스크립트 주입",
  "contextMenus": "우클릭 메뉴",
  "notifications": "사용자 알림",
  "sidePanel": "사이드 패널 UI"
}
```

### CORS 설정

```javascript
// Backend에서 Chrome Extension 허용
app.use(cors({
  origin: [
    'chrome-extension://*',
    'http://localhost:*',
    'https://*.github.dev'
  ],
  credentials: true
}));
```

### 파일 업로드 제한

```javascript
// Multer 설정
{
  fileSize: 10 * 1024 * 1024,  // 10MB
  fileFilter: 'image/*'         // 이미지만 허용
}
```

---

## 향후 개선 사항

### 1. 데이터베이스 도입
- In-Memory → PostgreSQL / MongoDB
- 영구 저장 및 다중 사용자 지원

### 2. 인증 및 사용자 관리
- JWT 기반 인증
- 사용자별 테마 관리

### 3. 실시간 동기화
- WebSocket / Server-Sent Events
- 여러 탭 간 테마 동기화

### 4. 고급 코드 생성
- Tailwind CSS 지원
- Next.js, Vue, Svelte 템플릿

### 5. 성능 최적화
- 이미지 압축 (Sharp)
- 캐싱 전략 (Redis)
- CDN 통합

---

## 참고 자료

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2025-12-24
**작성자:** SPAGHETTI Team
