# /deploy - Docker 빌드 및 배포

Docker 이미지를 빌드하고 컨테이너를 실행합니다.

## Docker 빌드
```bash
docker build -t spaghetti-app .
```

## 컨테이너 실행
```bash
docker run -p 3000:3000 spaghetti-app
```

## 환경변수 설정 시
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  spaghetti-app
```

## 접속 URL
http://localhost:3000
