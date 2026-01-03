# /check - 전체 검증

린트, 타입체크, 테스트, 빌드를 순차적으로 실행합니다.

## 실행할 명령어
```bash
pnpm run lint && pnpm run test && pnpm run build
```

## 체크 항목
1. ESLint 검사
2. Vitest 단위 테스트 (68개)
3. Next.js 프로덕션 빌드

## 성공 기준
- 린트 에러 0개
- 테스트 68/68 통과
- 빌드 성공
