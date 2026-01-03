# /dev - 개발 서버 시작

개발 서버를 시작합니다.

## 실행 명령어
```bash
cd /home/sihu2/github/spaghetti-app && pnpm run dev
```

## 접속 URL
http://localhost:3000

## 주의사항
- uniLAB/Finance도 포트 3000을 사용하므로 충돌 확인 필요
- 먼저 `lsof -i :3000`으로 포트 사용 여부 확인
