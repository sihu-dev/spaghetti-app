# Spaghetti AI - Design System Generator

> AI-powered Design System Generator
> 이미지에서 브랜드 컬러를 추출하고 100단계 컬러 토큰을 자동 생성

---

## ⚠️ 이 프로젝트는 uniLAB과 별개입니다

```
이 저장소: /home/sihu2/github/spaghetti-app (포트 3000)
uniLAB:    /home/sihu2/github/uniLAB      (별도 저장소)
```

**uniLAB 작업 시**: `/home/sihu2/github/uniLAB` 디렉토리에서 Claude Code 시작

---

## 프로젝트 정보

| 항목 | 값 |
|------|-----|
| **프로젝트명** | Spaghetti AI |
| **경로** | /home/sihu2/github/spaghetti-app |
| **포트** | 3000 (기본) |
| **저장소** | 독립 저장소 (uniLAB과 별도) |

---

## Tech Stack

```yaml
Framework: Next.js 16.1.1 (App Router)
Language: TypeScript 5
React: 19.2.3
Styling: Tailwind CSS v4
Color: Material Color Utilities (HCT), culori
UI: Radix UI, Headless UI
State: Zustand
Forms: React Hook Form + Zod
```

---

## 핵심 기능

1. **HCT 컬러 추출**: 이미지에서 브랜드 컬러 자동 추출
2. **토큰 자동 생성**: CSS Variables, Tailwind Config, JSON 토큰
3. **실시간 미리보기**: 버튼, 입력폼, 카드 등 컴포넌트 스타일

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx           # 메인 페이지
│   ├── editor/page.tsx    # 에디터 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 글로벌 스타일
├── lib/
│   ├── color/
│   │   ├── extraction.ts  # 이미지 컬러 추출
│   │   ├── ramp.ts        # HCT 컬러 램프 생성
│   │   ├── accessibility.ts # 접근성 검사
│   │   ├── darkmode.ts    # 다크모드 생성
│   │   └── index.ts
│   ├── codegen/
│   │   ├── generator.ts   # 코드 생성기
│   │   ├── templates.ts   # 템플릿
│   │   └── types.ts
│   ├── export/
│   │   └── index.ts       # 파일 내보내기
│   └── utils.ts
```

---

## 명령어

```bash
npm run dev      # 개발 서버 (포트 3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint
```

---

## 주의사항

- **uniLAB 프로젝트와 별도**: 이 프로젝트는 `/home/sihu2/github/uniLAB`과 완전히 별개
- **포트 충돌 주의**: uniLAB의 다른 앱들(BIDFLOW:3010, Catalog:3020, Finance:3000)과 포트 확인 필요

---

## 관련 프로젝트

| 프로젝트 | 경로 | 포트 | 설명 |
|---------|------|------|------|
| spaghetti-app | /home/sihu2/github/spaghetti-app | 3000 | 디자인 시스템 생성기 |
| uniLAB/BIDFLOW | /home/sihu2/github/uniLAB/apps/bidflow | 3010 | 입찰 자동화 |
| uniLAB/Catalog | /home/sihu2/github/uniLAB/apps/catalog | 3020 | 제품 카탈로그 AI |
| uniLAB/Finance | /home/sihu2/github/uniLAB/apps/finance | 3000 | AI 금융 도구 |

---

*Spaghetti AI - AI Design System Generator*
