# Supabase 벤치마킹 - Catalog AI 적용

## 왜 Supabase를 벤치마크하는가?

### Supabase의 강점
1. **개발자 친화적 UX** - 기술 제품을 비기술자도 사용 가능하게
2. **명확한 가치 제안** - 3초 안에 이해되는 메시지
3. **빠른 온보딩** - 회원가입 → 첫 결과까지 < 5분
4. **깔끔한 디자인 시스템** - 일관성 있는 UI
5. **오픈소스 친화적** - 신뢰도 상승

---

## 1. 랜딩페이지 분석

### Supabase 랜딩 구조

```
Hero Section
├─ 헤드라인: "The Open Source Firebase Alternative"
├─ 서브헤드: 구체적 기능 설명
├─ CTA: "Start your project" (강력한 액션)
└─ 데모 GIF/비디오 (제품 사용 모습)

Social Proof
├─ 로고월: GitHub, Mozilla, 등
└─ 통계: "500k+ developers"

Features (3단 그리드)
├─ Database (PostgreSQL)
├─ Auth (소셜 로그인)
└─ Storage (파일 업로드)

Developer Experience
├─ 코드 예시
├─ CLI 명령어
└─ SDK 지원

Pricing (명확한 티어)
Free → Pro → Team → Enterprise

Footer (신뢰도)
├─ 문서 링크
├─ GitHub Star 수
└─ 커뮤니티
```

### Catalog AI 적용 (우리 버전)

```
Hero Section
├─ 헤드라인: "제품 사진 → 전문 카탈로그 (5분)"
├─ 서브헤드: "AI가 스펙 추출 + 브랜드 컬러 + 다국어 번역"
├─ CTA: "무료로 시작하기" + "샘플 보기"
└─ 데모 애니메이션
    - 사진 업로드 → AI 분석 → PDF 생성 (3단계)

Social Proof
├─ 고객사 로고: (주)한국펌프, ABC기계, 등
└─ 통계: "1,000+ 카탈로그 생성"

Pain Points (Before/After)
├─ Before: 2주 + 100만원
├─ After: 5분 + 월 5만원
└─ 비교 테이블

Features (3x2 그리드)
├─ AI 스펙 추출 (명판 OCR)
├─ 브랜드 컬러 자동 추출
├─ 다국어 번역 (한/영/중/일)
├─ 산업별 템플릿
├─ 1클릭 PDF 생성
└─ 실시간 수정 에디터

How It Works (스크롤 애니메이션)
1. 로고 업로드 → 브랜드 컬러 추출
2. 제품 사진 업로드 → AI 분석
3. 자동 배치 → 미리보기
4. PDF 다운로드

Pricing
Free (체험) → Starter (₩49k) → Pro (₩99k) → Enterprise (맞춤)

Footer
├─ 고객 사례
├─ 블로그 (제조업 마케팅 팁)
└─ 카카오톡 상담
```

---

## 2. 대시보드 UX 분석

### Supabase Dashboard 특징

**레이아웃**
```
┌─────────────────────────────────────────┐
│ Header: 로고 | 프로젝트 선택 | 유저    │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Main Content                    │
│ Nav  │  - Table Editor                  │
│      │  - SQL Editor                    │
│      │  - Auth Users                    │
│      │                                  │
│      │  [빈 상태 일러스트]              │
│      │  "No tables yet"                 │
│      │  [Create Table 버튼]             │
└──────┴──────────────────────────────────┘
```

**핵심 UX 패턴**
1. **프로젝트 스위처** - 여러 프로젝트 쉽게 전환
2. **빈 상태(Empty State)** - 다음 액션 명확히 제시
3. **인라인 편집** - 페이지 이동 없이 수정
4. **실시간 미리보기** - 변경사항 즉시 반영
5. **다크모드 기본** - 개발자 친화

### Catalog AI Dashboard 설계

**레이아웃**
```
┌─────────────────────────────────────────┐
│ Header: CATALOG | 새 카탈로그 | 프로필 │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Main Content                    │
│ Nav  │                                  │
│      │  [카탈로그 목록 - 카드 뷰]      │
│ 📁카탈로그│  ┌──────┐ ┌──────┐ ┌──────┐│
│ 🎨브랜드 │  │ 2024 │ │ 2024 │ │ 2024 │ │
│ 📦제품  │  │ 상반기│ │ 하반기│ │ 영문 │ │
│ ⚙️설정  │  └──────┘ └──────┘ └──────┘│
│      │                                  │
│      │  Empty State (첫 로그인)         │
│      │  "첫 카탈로그를 만들어보세요"    │
│      │  [+ 시작하기] 버튼               │
└──────┴──────────────────────────────────┘
```

**주요 화면 설계**

### 화면 1: 카탈로그 목록
```typescript
interface CatalogListView {
  layout: "grid" | "list";
  cards: {
    thumbnail: string; // 첫 페이지 미리보기
    title: string; // "2024 상반기 카탈로그"
    products: number; // 15개 제품
    languages: string[]; // ["한국어", "English"]
    updatedAt: string;
    actions: ["편집", "복제", "다운로드", "삭제"];
  }[];
  filters: {
    dateRange: "전체" | "최근 30일" | "최근 3개월";
    language: "전체" | "한국어" | "English";
    status: "전체" | "완성" | "진행중";
  };
}
```

### 화면 2: 카탈로그 생성 (3단계 마법사)

**Step 1: 브랜드 설정**
```
┌────────────────────────────────────┐
│ 브랜드 설정 (1/3)                  │
├────────────────────────────────────┤
│                                    │
│ 로고 업로드                        │
│ ┌──────────────────────────────┐  │
│ │  [드래그 또는 클릭]          │  │
│ └──────────────────────────────┘  │
│                                    │
│ ✨ AI가 브랜드 컬러 자동 추출     │
│                                    │
│ ┌────┐ ┌────┐ ┌────┐             │
│ │ 🔵 │ │ ⚪ │ │ ⚫ │  ← 추출된 색│
│ └────┘ └────┘ └────┘             │
│                                    │
│ 회사명: [                    ]    │
│ 산업군: [제조업 ▼]                 │
│                                    │
│        [건너뛰기]    [다음 →]     │
└────────────────────────────────────┘
```

**Step 2: 제품 추가**
```
┌────────────────────────────────────┐
│ 제품 추가 (2/3)                    │
├────────────────────────────────────┤
│                                    │
│ 제품 사진 업로드 (최대 50장)      │
│ ┌──────────────────────────────┐  │
│ │ [드래그 또는 클릭]           │  │
│ │                              │  │
│ │ 💡 명판/스티커가 보이게 촬영 │  │
│ └──────────────────────────────┘  │
│                                    │
│ 업로드된 제품 (3개)                │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ 📷 IMG_001.jpg               │  │
│ │ AI 분석 완료 ✓               │  │
│ │ 모델: KP-500A                │  │
│ │ 카테고리: 워터펌프           │  │
│ │ [수정] [삭제]                │  │
│ ├──────────────────────────────┤  │
│ │ 📷 IMG_002.jpg               │  │
│ │ 분석 중... 85%               │  │
│ └──────────────────────────────┘  │
│                                    │
│        [← 이전]      [다음 →]    │
└────────────────────────────────────┘
```

**Step 3: 카탈로그 생성**
```
┌────────────────────────────────────┐
│ 카탈로그 생성 (3/3)                │
├────────────────────────────────────┤
│                                    │
│ 카탈로그 이름                      │
│ [2024 상반기 제품 카탈로그]        │
│                                    │
│ 템플릿 선택                        │
│ ┌────┐ ┌────┐ ┌────┐             │
│ │산업│ │소비│ │식품│             │
│ │용 ●│ │재  │ │    │             │
│ └────┘ └────┘ └────┘             │
│                                    │
│ 언어 선택                          │
│ ☑ 한국어 (기본)                   │
│ ☑ English                         │
│ ☐ 中文                            │
│ ☐ 日本語                          │
│                                    │
│ 예상 생성 시간: 약 2분            │
│                                    │
│        [← 이전]   [생성하기 🚀]  │
└────────────────────────────────────┘
```

### 화면 3: 카탈로그 에디터 (생성 후)

```
┌─────────────────────────────────────────────────────┐
│ Toolbar: [저장] [미리보기] [다운로드 ▼] [공유]    │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│ 페이지 │  Canvas (실시간 편집)                      │
│ 목록   │                                            │
│        │  ┌──────────────────────────────────┐    │
│ 1 표지 │  │                                  │    │
│ 2 목차 │  │    [회사 로고]                   │    │
│ 3 제품1│  │                                  │    │
│ 4 제품2│  │  2024 Product Catalog            │    │
│ 5 연락 │  │                                  │    │
│        │  │  (주)한국펌프                    │    │
│ [+추가]│  └──────────────────────────────────┘    │
│        │                                            │
│        │  클릭하여 텍스트/이미지 수정 가능          │
│        │                                            │
│        │  Properties Panel (우측)                   │
│        │  ┌──────────────────────────┐            │
│        │  │ 텍스트 편집              │            │
│        │  │ [제목 텍스트 입력...]   │            │
│        │  │                          │            │
│        │  │ 폰트: Pretendard ▼       │            │
│        │  │ 크기: 32px               │            │
│        │  │ 색상: ⬛                 │            │
│        │  └──────────────────────────┘            │
└────────┴────────────────────────────────────────────┘
```

---

## 3. 기술 스택 벤치마킹

### Supabase 기술 스택

```yaml
Frontend:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Radix UI (Headless Components)
  - Zustand (State Management)

Backend:
  - PostgreSQL (Supabase 자체)
  - Edge Functions (Deno)

Infra:
  - Vercel (Hosting)
  - Cloudflare (CDN)

Design:
  - Figma (디자인 시스템)
  - Framer Motion (애니메이션)
```

### Catalog AI 기술 스택 (최종안)

```yaml
Frontend:
  ✅ Next.js 16 (App Router) - 이미 있음
  ✅ TypeScript - 이미 있음
  ✅ Tailwind CSS v4 - 이미 있음
  ✅ Headless UI - 이미 있음
  ✅ Zustand - 이미 있음
  ✅ React Hook Form + Zod - 이미 있음
  🆕 Framer Motion - 애니메이션 추가 필요
  🆕 React PDF (@react-pdf/renderer) - PDF 생성

Backend:
  ✅ Supabase
    - Auth (소셜 로그인)
    - PostgreSQL (카탈로그 저장)
    - Storage (이미지 업로드)
    - Edge Functions (AI API 호출)

AI:
  ✅ Anthropic Claude 3.5 Sonnet (Vision)
  🆕 OpenAI GPT-4o (대안)

PDF 생성:
  🆕 @react-pdf/renderer (React → PDF)
  또는 Puppeteer (HTML → PDF)

Image Processing:
  🆕 Sharp (이미 devDep에 있음)
  🆕 remove.bg API (배경 제거)

Hosting:
  - Vercel (Frontend)
  - Supabase (Backend)

Payment:
  🆕 Toss Payments (한국 결제)

Analytics:
  🆕 Posthog (사용자 행동 분석)
```

---

## 4. 디자인 시스템

### Supabase 디자인 토큰

```css
/* 색상 */
--brand-green: #3ECF8E;
--brand-dark: #1E1E1E;
--text-primary: #EDEDED;
--text-secondary: #A0A0A0;

/* 타이포그래피 */
--font-heading: "Custom Sans", sans-serif;
--font-body: "Inter", sans-serif;
--font-mono: "Source Code Pro", monospace;

/* 간격 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 48px;

/* 반경 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Catalog AI 디자인 토큰 (적용)

```css
/* 브랜드 컬러 - 신뢰감 있는 블루 */
--brand-primary: #2563EB; /* 파란색 - 전문성 */
--brand-secondary: #10B981; /* 초록 - 완료/성공 */
--brand-accent: #F59E0B; /* 주황 - CTA */

/* 배경 */
--bg-canvas: #FAFAFA; /* 밝은 회색 배경 */
--bg-surface: #FFFFFF;
--bg-elevated: #FFFFFF;

/* 텍스트 */
--text-primary: #1A1A1A;
--text-secondary: #666666;
--text-tertiary: #999999;

/* 다크모드 */
--dark-bg-canvas: #0A0A0A;
--dark-bg-surface: #1A1A1A;
--dark-text-primary: #FFFFFF;
--dark-text-secondary: rgba(255,255,255,0.6);

/* 타이포그래피 */
--font-sans: "Pretendard", -apple-system, sans-serif;
--font-mono: "JetBrains Mono", monospace;

/* 그림자 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

---

## 5. 구현 우선순위

### Phase 1: 랜딩페이지 리뉴얼 (1주)
```
[ ] Hero 섹션 (헤드라인 + CTA + 데모 영상)
[ ] Pain Points (Before/After 비교)
[ ] Features 섹션 (3x2 그리드)
[ ] How It Works (스텝 애니메이션)
[ ] Pricing (3티어)
[ ] Footer (신뢰도 요소)
```

### Phase 2: 대시보드 기본 (1주)
```
[ ] Supabase Auth 연동
[ ] 대시보드 레이아웃 (헤더 + 사이드바)
[ ] 카탈로그 목록 (카드 뷰)
[ ] Empty State 디자인
[ ] "새 카탈로그" 버튼 → 생성 플로우
```

### Phase 3: 카탈로그 생성 마법사 (2주)
```
[ ] Step 1: 브랜드 설정 (로고 업로드 + 컬러 추출)
[ ] Step 2: 제품 추가 (사진 업로드 + AI 분석)
[ ] Step 3: 옵션 선택 (템플릿, 언어)
[ ] 진행률 표시 (Progress Bar)
[ ] PDF 생성 + 다운로드
```

### Phase 4: 에디터 (3주)
```
[ ] Canvas 기반 편집기
[ ] 드래그 앤 드롭
[ ] 텍스트/이미지 인라인 편집
[ ] 실시간 미리보기
[ ] 저장/복구 기능
```

---

## 6. 참고 자료

- Supabase 공식 사이트: https://supabase.com
- Supabase GitHub: https://github.com/supabase/supabase
- Supabase 디자인 시스템: Figma Community 참고
- Next.js + Supabase 튜토리얼: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

## 다음 단계

1. Supabase 프로젝트 생성
2. 랜딩페이지 컴포넌트 작성 (Hero 섹션부터)
3. Supabase Auth 연동
4. 대시보드 레이아웃 구현

**지금 바로 시작하시겠습니까?**
