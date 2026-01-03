# CATALOG.AI - 환경 설정 가이드

## 🚀 빠른 시작

### 1. 환경변수 파일 생성

```bash
# .env.local 파일 생성
cp .env.local.template .env.local
```

### 2. API 키 설정

#### OpenAI API 키 발급
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 생성된 키 복사 (sk-...로 시작)

#### Supabase 프로젝트 생성
1. https://app.supabase.com 접속
2. "New project" 클릭
3. 프로젝트 생성 후 Settings → API 메뉴
4. Project URL 및 anon public 키 복사

### 3. .env.local 파일 편집

```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase 데이터베이스 설정

1. Supabase 대시보드에서 SQL Editor 열기
2. `supabase/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행 (F5)

### 5. API 키 검증

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
open http://localhost:3000/api/test-keys
```

**또는 CLI로 테스트:**

```bash
npx tsx scripts/test-api-keys.ts
```

**기대 출력:**

```json
{
  "openai": {
    "configured": true,
    "valid": true
  },
  "supabase": {
    "configured": true,
    "valid": true
  }
}
```

---

## 🔧 상세 설정

### OpenAI 모델 및 비용

**사용 모델**: GPT-4o
- Vision API: 이미지당 약 $0.01
- Text API: 요청당 약 $0.001

**월 예상 비용** (1,000 카탈로그 기준):
- 이미지 분석: 1,000 × $0.01 = $10
- 계획 수립: 1,000 × $0.001 = $1
- **총 예상: $11/월**

### Supabase 무료 티어 제한

- 데이터베이스: 500MB
- Storage: 1GB
- 대역폭: 5GB/월
- MAU (Monthly Active Users): 50,000

**중소형 제조업체 SaaS에 충분**

---

## 🧪 테스트 시나리오

### 1. 기본 Vision API 테스트

```bash
curl -X POST http://localhost:3000/api/test-vision \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://via.placeholder.com/800x600/2563EB/FFFFFF?text=TEST"
  }'
```

### 2. 전체 카탈로그 생성 테스트

```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "제품 카탈로그를 한국어와 영어로 만들어줘",
    "images": [
      "https://via.placeholder.com/800x600/2563EB/FFFFFF?text=Product+1"
    ],
    "companyName": "테스트 제조"
  }'
```

---

## ⚠️ 문제 해결

### 1. "API key not found" 오류

**증상**: `/api/test-keys`에서 `configured: false`

**해결**:
```bash
# .env.local 파일이 있는지 확인
ls -la .env.local

# 없으면 생성
cp .env.local.template .env.local

# API 키 입력 후 개발 서버 재시작
npm run dev
```

### 2. "Invalid API key" 오류

**증상**: `configured: true`, `valid: false`

**해결**:
- OpenAI: https://platform.openai.com/api-keys 에서 키 재발급
- Supabase: Settings → API에서 키 재확인

### 3. Supabase "relation does not exist" 오류

**증상**: `error: "relation 'profiles' does not exist"`

**해결**:
```sql
-- Supabase SQL Editor에서 실행
-- supabase/schema.sql 파일 내용 복사 후 실행
```

### 4. CORS 오류

**증상**: 브라우저 콘솔에 CORS 에러

**해결**:
- Next.js는 기본적으로 Same-Origin이므로 발생하지 않음
- 외부 도메인에서 접근 시 `next.config.js`에 CORS 설정 추가

---

## 📦 프로덕션 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 설정
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 환경변수 확인

```bash
# 프로덕션 환경변수
vercel env ls
```

---

## 📞 지원

문제가 계속되면:
1. `TEST_EVALUATION_REPORT.md` 확인
2. GitHub Issues에 보고
3. Supabase/OpenAI 공식 문서 참고

---

**마지막 업데이트**: 2026-01-03
