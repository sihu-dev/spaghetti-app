# /color - 컬러 엔진 도움말

Spaghetti AI 컬러 엔진 사용법을 안내합니다.

## 핵심 모듈

### 1. 컬러 추출 (extraction.ts)
```typescript
import { extractColorsFromImage, selectPrimaryColor } from '@/lib/color/extraction';

const colors = await extractColorsFromImage(imageUrl, { colorCount: 6 });
const primary = selectPrimaryColor(colors);
```

### 2. 컬러 램프 생성 (ramp.ts)
```typescript
import { generateColorRamp } from '@/lib/color/ramp';

const ramp = generateColorRamp('#5C6356');
// { 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 }
```

### 3. 접근성 검사 (accessibility.ts)
```typescript
import { getContrastRatio, getWCAGLevel } from '@/lib/color/accessibility';

const ratio = getContrastRatio('#5C6356', '#FFFFFF');
const level = getWCAGLevel(ratio); // 'AAA' | 'AA' | 'AA-Large' | 'Fail'
```

### 4. 다크모드 (darkmode.ts)
```typescript
import { generateDarkPalette } from '@/lib/color/darkmode';

const darkPalette = generateDarkPalette(lightPalette);
```

## 테스트 실행
```bash
pnpm run test src/lib/color/
```
