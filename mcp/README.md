# Spaghetti AI - MCP Server

Material Design 3 기반 디자인 시스템 생성기 MCP 서버

## 설치

### npm (글로벌)

```bash
npm install -g @spaghetti-ai/mcp-server
```

### npx (설치 없이 실행)

```bash
npx @spaghetti-ai/mcp-server
```

### 로컬 빌드

```bash
cd mcp
pnpm install
pnpm run build
```

## Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 또는
`%APPDATA%\Claude\claude_desktop_config.json` (Windows)에 추가:

```json
{
  "mcpServers": {
    "spaghetti-ai": {
      "command": "npx",
      "args": ["@spaghetti-ai/mcp-server"]
    }
  }
}
```

또는 로컬 빌드 사용:

```json
{
  "mcpServers": {
    "spaghetti-ai": {
      "command": "node",
      "args": ["/path/to/spaghetti-app/mcp/dist/server.js"]
    }
  }
}
```

## 도구 목록 (6개)

### 1. extract-colors-from-image ⭐

이미지 URL에서 색상 추출 (K-Means++ 클러스터링)

```
Input:
  - imageUrl: "https://example.com/logo.png"
  - colorCount: 6 (1-12, 기본값: 6)

Output:
  - extractedColors: 추출된 색상 배열 (HCT 포함)
  - suggestedPrimary: 추천 Primary 색상
```

### 2. create-design-system-from-image ⭐

이미지에서 색상 추출 → 디자인 시스템 생성 (원스톱)

```
Input:
  - imageUrl: "https://example.com/brand.png"
  - format: "json" | "css" | "tailwind" | "figma" | "all"

Output:
  - 완전한 MD3 디자인 시스템 (선택한 포맷)
```

### 3. generate-design-system

Primary 색상에서 완전한 MD3 디자인 시스템 생성

```
Input:
  - primaryColor: "#5C6356" (hex 형식)

Output:
  - colorScale: 50-950 색상 스케일
  - lightTheme: 라이트 테마 시맨틱 토큰
  - darkTheme: 다크 테마 시맨틱 토큰
```

### 4. export-tokens

디자인 시스템 토큰을 다양한 형식으로 내보내기

```
Input:
  - primaryColor: "#5C6356"
  - format: "css" | "tailwind" | "json" | "figma"

Output:
  - CSS Variables
  - Tailwind Config
  - Design Tokens JSON
  - Figma Variables JSON
```

### 5. analyze-color

색상 분석 및 접근성 정보

```
Input:
  - color: "#5C6356"

Output:
  - HCT 값 (Hue, Chroma, Tone)
  - 대비율 (흰색/검정 배경)
  - WCAG 접근성 레벨
  - 추천 텍스트 색상
```

### 6. suggest-palette

색상 조화 팔레트 제안

```
Input:
  - primaryColor: "#5C6356"
  - harmony: "complementary" | "analogous" | "triadic" | "split-complementary"

Output:
  - 조화로운 색상 목록
```

## 사용 예시

Claude에서:

```
"이 로고 이미지로 디자인 시스템 만들어줘"
→ create-design-system-from-image 호출

"https://example.com/brand.png에서 색상 추출해줘"
→ extract-colors-from-image 호출

"#5C6356 색상으로 디자인 시스템 만들어줘"
→ generate-design-system 호출

"이 디자인 시스템을 Tailwind 설정으로 내보내줘"
→ export-tokens 호출 (format: "tailwind")

"#FF5733 색상 분석해줘"
→ analyze-color 호출

"#5C6356에 어울리는 보색 팔레트 추천해줘"
→ suggest-palette 호출 (harmony: "complementary")
```

## 기술 스택

- **색상 과학**: Material Design 3 HCT (Hue-Chroma-Tone)
- **이미지 처리**: Sharp (Node.js)
- **색상 추출**: K-Means++ 클러스터링
- **MCP**: Model Context Protocol SDK

## 라이선스

MIT
