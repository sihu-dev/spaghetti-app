# Spaghetti AI

> AI-powered Design System Generator - 이미지에서 브랜드 컬러를 추출하고 100단계 컬러 토큰을 자동 생성합니다.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/sihu-dev/spaghetti-app)
[![Test Coverage](https://img.shields.io/badge/coverage-85%25-green)](https://github.com/sihu-dev/spaghetti-app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## ✨ Features

- 🎨 **HCT 컬러 추출** - Material Design 3의 HCT 알고리즘으로 이미지에서 브랜드 컬러 자동 추출
- 🔧 **토큰 자동 생성** - CSS Variables, Tailwind Config, JSON 토큰 원클릭 내보내기
- 👁️ **실시간 미리보기** - 버튼, 입력폼, 카드 등 컴포넌트 스타일 즉시 확인
- ♿ **접근성 검사** - WCAG 2.1 대비비 자동 검증 (AA/AAA)
- 🌙 **다크모드 지원** - 라이트/다크 테마 자동 생성

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.1 (App Router) |
| Language | TypeScript 5 |
| UI Framework | React 19 |
| Styling | Tailwind CSS v4 |
| Color Science | @material/material-color-utilities (HCT) |
| State | React Hooks (useState, useMemo, useCallback) |
| Testing | Vitest, Playwright |
| Package Manager | npm / pnpm |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+ or pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/sihu-dev/spaghetti-app.git
cd spaghetti-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── editor/page.tsx    # Color editor page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   ├── color/
│   │   ├── extraction.ts  # K-means color extraction
│   │   ├── hct.ts         # HCT color space utilities
│   │   ├── ramp.ts        # Color ramp generation
│   │   ├── accessibility.ts # WCAG contrast checking
│   │   └── darkmode.ts    # Dark theme generation
│   ├── codegen/
│   │   ├── generator.ts   # Design system code generator
│   │   └── templates.ts   # Component templates
│   ├── export/
│   │   └── index.ts       # Export utilities
│   └── utils.ts           # Common utilities
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Coverage

| Module | Coverage |
|--------|----------|
| `hct.ts` | 100% |
| `accessibility.ts` | 95% |
| `darkmode.ts` | 94% |
| `ramp.ts` | 88% |
| `extraction.ts` | 74% |
| **Overall** | **85%** |

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |

## 🎨 Color API

### Extract Colors from Image

```typescript
import { extractColorsFromImage, selectPrimaryColor } from '@/lib/color/extraction';

const colors = await extractColorsFromImage(imageUrl, { colorCount: 6 });
const primary = selectPrimaryColor(colors);
```

### Generate Color Ramp

```typescript
import { generateColorRamp } from '@/lib/color/ramp';

const ramp = generateColorRamp('#5C6356');
// Returns: { 50: '#...', 100: '#...', ..., 950: '#...' }
```

### Check Accessibility

```typescript
import { getContrastRatio, getWCAGLevel } from '@/lib/color/accessibility';

const ratio = getContrastRatio('#5C6356', '#FFFFFF');
const level = getWCAGLevel(ratio); // 'AAA' | 'AA' | 'AA-Large' | 'Fail'
```

## 🔧 Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Supabase (for future features)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t spaghetti-app .

# Run container
docker run -p 3000:3000 spaghetti-app
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

---

Built with ❤️ by [Spaghetti AI Team](https://github.com/sihu-dev)
