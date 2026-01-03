# Catalog Engine - uniLAB 통합 가이드

## 📦 패키지 구조

```
packages/
└── catalog-engine/              # 독립 npm 패키지
    ├── src/
    │   ├── ai/                 # AI 엔진
    │   │   ├── vision.ts       # GPT-4o Vision
    │   │   └── agent.ts        # 자율 에이전트
    │   ├── pdf/                # PDF 생성
    │   │   ├── generator.tsx
    │   │   └── catalog-template.tsx
    │   ├── color/              # 컬러 추출
    │   │   ├── extraction.ts
    │   │   ├── ramp.ts
    │   │   ├── accessibility.ts
    │   │   └── darkmode.ts
    │   └── index.ts            # Public API
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

---

## 🚀 uniLAB에서 사용하기

### 방법 1: 로컬 패키지로 링크 (개발용)

```bash
# 1. catalog-engine 빌드
cd /home/sihu2/github/spaghetti-app
npm run build:engine

# 2. uniLAB 프로젝트에서 링크
cd /home/sihu2/github/uniLAB
npm install ../spaghetti-app/packages/catalog-engine
```

### 방법 2: npm 패키지로 배포 (프로덕션)

```bash
# 1. catalog-engine 디렉토리에서
cd packages/catalog-engine
npm publish --access public

# 2. uniLAB에서 설치
npm install @unilab/catalog-engine
```

### 방법 3: Git 서브모듈 (권장)

```bash
# 1. uniLAB에 서브모듈 추가
cd /home/sihu2/github/uniLAB
git submodule add https://github.com/sihu-dev/spaghetti-app.git packages/catalog-engine-source

# 2. 심볼릭 링크 생성
ln -s packages/catalog-engine-source/packages/catalog-engine packages/catalog-engine
```

---

## 💻 사용 예시

### uniLAB/apps/catalog 앱에서 사용

```typescript
// apps/catalog/src/lib/catalog.ts
import {
  CatalogAgent,
  extractProductInfo,
  generateCatalogPDF
} from "@unilab/catalog-engine";

export async function createCatalog(images: string[]) {
  const agent = new CatalogAgent();

  const task = await agent.execute({
    goal: "제품 카탈로그를 한국어와 영어로 만들어줘",
    images,
    companyName: "한국펌프",
  });

  return task.result;
}
```

### uniLAB/apps/bidflow에서 재사용

```typescript
// apps/bidflow/src/lib/proposal-generator.ts
import { extractProductInfo } from "@unilab/catalog-engine";

export async function generateProposal(productImages: string[]) {
  // 제품 스펙 자동 추출
  const specs = await Promise.all(
    productImages.map(img => extractProductInfo(img))
  );

  // 입찰 제안서 생성 로직...
  return proposal;
}
```

---

## 🔧 환경변수 공유

uniLAB의 루트 `.env`에 추가:

```env
# Catalog Engine
OPENAI_API_KEY=sk-proj-...
```

모든 앱에서 자동으로 사용됩니다.

---

## 📊 의존성 관리

### Turbo (uniLAB에서 사용 시)

```json
// uniLAB/turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["@unilab/catalog-engine#build"]
    }
  }
}
```

### pnpm Workspace (uniLAB에서 사용 시)

```yaml
# uniLAB/pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/catalog-engine'  # 추가
```

---

## 🎯 통합 체크리스트

- [ ] catalog-engine 패키지 빌드 완료
- [ ] uniLAB에 패키지 설치
- [ ] 환경변수 설정 (OPENAI_API_KEY)
- [ ] uniLAB/apps/catalog에서 import 테스트
- [ ] 다른 앱(bidflow, finance)에서도 재사용 확인

---

## 🔄 업데이트 방법

### 로컬 링크 사용 시

```bash
# spaghetti-app에서 수정
cd /home/sihu2/github/spaghetti-app/packages/catalog-engine
# 파일 수정...
npm run build

# uniLAB에서 자동 반영됨 (재빌드 필요)
cd /home/sihu2/github/uniLAB
npm run build
```

### npm 패키지 사용 시

```bash
# spaghetti-app에서 배포
cd packages/catalog-engine
npm version patch  # 버전 업
npm publish

# uniLAB에서 업데이트
cd /home/sihu2/github/uniLAB
npm update @unilab/catalog-engine
```

---

## 📝 다음 단계

1. **uniLAB 모노레포 구조 확인**
   - Turbo 또는 pnpm workspace 사용 여부
   - 패키지 관리 방식

2. **카탈로그 엔진 통합**
   - uniLAB/apps/catalog 앱 생성
   - catalog-engine 패키지 링크

3. **공통 기능 확장**
   - 다른 앱들도 Vision AI 활용
   - PDF 생성 기능 재사용

---

**작성자**: Claude Code
**업데이트**: 2026-01-03
