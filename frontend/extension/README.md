# AI Spaghetti - Chrome Theme Extractor Extension

## 🍝 소개
Claude AI와 연동하여 이미지에서 테마 색상을 추출하고 웹페이지에 적용하는 Chrome 확장 프로그램입니다.

## 📁 프로젝트 구조
```
frontend/extension/
├── manifest.json          # Manifest V3 설정
├── popup/                 # 팝업 UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background/            # Service Worker
│   └── service-worker.js
├── content/               # Content Script
│   ├── content.js
│   └── content.css
├── sidepanel/             # Side Panel UI
│   └── sidepanel.html
├── options/               # 설정 페이지
│   ├── options.html
│   ├── options.css
│   └── options.js
├── icons/                 # 아이콘 (16, 32, 48, 128px)
└── assets/                # 기타 에셋
```

## 🚀 설치 방법
1. Chrome에서 `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `frontend/extension` 폴더 선택

## ✨ 주요 기능
- 이미지 업로드 또는 URL로 테마 색상 추출
- 현재 페이지 스크린샷에서 테마 추출
- 추출된 테마를 웹페이지에 적용
- 테마 저장 및 관리
- 사이드 패널 지원
- 컨텍스트 메뉴 통합

## 🔧 개발 스택
- Manifest V3
- ES Modules
- Chrome Extensions API
- Service Worker (백그라운드)

## 📋 필요 권한
- `activeTab`: 현재 탭 접근
- `storage`: 테마 저장
- `scripting`: 페이지에 스크립트 주입
- `contextMenus`: 우클릭 메뉴
- `notifications`: 알림 표시
- `sidePanel`: 사이드 패널

## 🔗 Backend API
백엔드 서버 (localhost:3000)와 연동하여 Claude AI로 이미지 분석을 수행합니다.
