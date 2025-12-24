# SPAGHETTI 디자인 토큰 스키마

> W3C Design Tokens Community Group 표준 기반 토큰 시스템

## 목차
1. [개요](#개요)
2. [W3C Design Tokens 표준](#w3c-design-tokens-표준)
3. [토큰 구조](#토큰-구조)
4. [색상 토큰](#색상-토큰)
5. [타이포그래피 토큰](#타이포그래피-토큰)
6. [간격 토큰](#간격-토큰)
7. [출력 포맷](#출력-포맷)
8. [변환 파이프라인](#변환-파이프라인)

---

## 개요

SPAGHETTI는 W3C Design Tokens Community Group의 표준을 따르는 디자인 토큰 시스템을 사용합니다. 이를 통해 디자인 시스템을 플랫폼 독립적으로 정의하고, 다양한 포맷(JSON, CSS, Tailwind, SCSS 등)으로 변환할 수 있습니다.

**주요 특징:**
- W3C 표준 준수
- 플랫폼 독립적
- 다중 출력 포맷 지원
- 의미론적 토큰 계층
- 자동 타입 생성

---

## W3C Design Tokens 표준

### 표준 문서
- [Design Tokens Format Module](https://design-tokens.github.io/community-group/format/)
- [DTCG Spec - JSON Schema](https://tr.designtokens.org/format/)

### 핵심 개념

#### 1. 토큰 정의 구조

```json
{
  "tokenName": {
    "$type": "color",
    "$value": "#6366f1",
    "$description": "Primary brand color"
  }
}
```

#### 2. 토큰 타입

| Type | Description | Example |
|------|-------------|---------|
| `color` | 색상 값 | `#6366f1`, `rgb(99, 102, 241)` |
| `dimension` | 크기 값 | `16px`, `1rem`, `8` |
| `fontFamily` | 폰트 패밀리 | `"Inter", sans-serif` |
| `fontWeight` | 폰트 굵기 | `400`, `700` |
| `duration` | 시간 값 | `200ms`, `0.2s` |
| `cubicBezier` | 이징 함수 | `[0.4, 0, 0.2, 1]` |
| `shadow` | 그림자 효과 | Object |
| `border` | 테두리 | Object |

---

## 토큰 구조

### 계층 구조

SPAGHETTI는 3단계 토큰 계층을 사용합니다:

```
Reference Tokens (참조 토큰)
    ↓
System Tokens (시스템 토큰)
    ↓
Component Tokens (컴포넌트 토큰)
```

#### 1. Reference Tokens (참조 토큰)

원시 디자인 값, 재사용 가능한 기본 토큰

```json
{
  "reference": {
    "color": {
      "indigo": {
        "50": { "$type": "color", "$value": "#eef2ff" },
        "100": { "$type": "color", "$value": "#e0e7ff" },
        "200": { "$type": "color", "$value": "#c7d2fe" },
        "300": { "$type": "color", "$value": "#a5b4fc" },
        "400": { "$type": "color", "$value": "#818cf8" },
        "500": { "$type": "color", "$value": "#6366f1" },
        "600": { "$type": "color", "$value": "#4f46e5" },
        "700": { "$type": "color", "$value": "#4338ca" },
        "800": { "$type": "color", "$value": "#3730a3" },
        "900": { "$type": "color", "$value": "#312e81" }
      }
    }
  }
}
```

#### 2. System Tokens (시스템 토큰)

의미론적 토큰, 디자인 의도를 표현

```json
{
  "system": {
    "color": {
      "primary": {
        "$type": "color",
        "$value": "{reference.color.indigo.500}",
        "$description": "Primary brand color"
      },
      "secondary": {
        "$type": "color",
        "$value": "{reference.color.purple.500}"
      },
      "background": {
        "default": {
          "$type": "color",
          "$value": "{reference.color.slate.900}"
        },
        "surface": {
          "$type": "color",
          "$value": "{reference.color.slate.800}"
        }
      }
    }
  }
}
```

#### 3. Component Tokens (컴포넌트 토큰)

특정 컴포넌트에 적용되는 토큰

```json
{
  "component": {
    "button": {
      "primary": {
        "background": {
          "$type": "color",
          "$value": "{system.color.primary}",
          "$description": "Primary button background"
        },
        "text": {
          "$type": "color",
          "$value": "#ffffff"
        },
        "padding": {
          "$type": "dimension",
          "$value": "{system.spacing.md}"
        }
      }
    }
  }
}
```

---

## 색상 토큰

### 색상 팔레트

Claude AI가 추출한 색상을 기반으로 자동 생성됩니다.

#### 전체 스키마

```json
{
  "color": {
    "$type": "color",
    "brand": {
      "primary": {
        "$value": "#6366f1",
        "$description": "Primary brand color - used for CTAs, links"
      },
      "secondary": {
        "$value": "#8b5cf6",
        "$description": "Secondary brand color - used for accents"
      },
      "accent": {
        "$value": "#06b6d4",
        "$description": "Accent color - used for highlights"
      }
    },
    "background": {
      "default": {
        "$value": "#0f172a",
        "$description": "Default background color"
      },
      "surface": {
        "$value": "#1e293b",
        "$description": "Surface color for cards, panels"
      },
      "overlay": {
        "$value": "rgba(15, 23, 42, 0.8)",
        "$description": "Overlay background"
      }
    },
    "text": {
      "primary": {
        "$value": "#f8fafc",
        "$description": "Primary text color"
      },
      "secondary": {
        "$value": "#cbd5e1",
        "$description": "Secondary text color"
      },
      "muted": {
        "$value": "#64748b",
        "$description": "Muted text color"
      },
      "inverse": {
        "$value": "#0f172a",
        "$description": "Inverse text color (for light backgrounds)"
      }
    },
    "border": {
      "default": {
        "$value": "#334155",
        "$description": "Default border color"
      },
      "subtle": {
        "$value": "#1e293b",
        "$description": "Subtle border color"
      },
      "strong": {
        "$value": "#475569",
        "$description": "Strong border color"
      }
    },
    "status": {
      "success": {
        "$value": "#10b981",
        "$description": "Success state color"
      },
      "warning": {
        "$value": "#f59e0b",
        "$description": "Warning state color"
      },
      "error": {
        "$value": "#ef4444",
        "$description": "Error state color"
      },
      "info": {
        "$value": "#3b82f6",
        "$description": "Info state color"
      }
    },
    "interactive": {
      "default": {
        "$value": "#6366f1",
        "$description": "Default interactive element color"
      },
      "hover": {
        "$value": "#4f46e5",
        "$description": "Hover state color"
      },
      "active": {
        "$value": "#4338ca",
        "$description": "Active state color"
      },
      "disabled": {
        "$value": "#475569",
        "$description": "Disabled state color"
      }
    }
  }
}
```

### 색상 접근성

WCAG 2.1 기준을 만족하는 대비율을 자동으로 검증합니다.

```json
{
  "color": {
    "accessibility": {
      "contrast-ratio": {
        "AA-normal": {
          "$value": 4.5,
          "$description": "WCAG AA - Normal text"
        },
        "AA-large": {
          "$value": 3.0,
          "$description": "WCAG AA - Large text"
        },
        "AAA-normal": {
          "$value": 7.0,
          "$description": "WCAG AAA - Normal text"
        },
        "AAA-large": {
          "$value": 4.5,
          "$description": "WCAG AAA - Large text"
        }
      }
    }
  }
}
```

---

## 타이포그래피 토큰

### Font Family

```json
{
  "typography": {
    "fontFamily": {
      "sans": {
        "$type": "fontFamily",
        "$value": ["Inter", "system-ui", "sans-serif"],
        "$description": "Default sans-serif font"
      },
      "serif": {
        "$type": "fontFamily",
        "$value": ["Merriweather", "Georgia", "serif"]
      },
      "mono": {
        "$type": "fontFamily",
        "$value": ["JetBrains Mono", "Monaco", "monospace"]
      }
    }
  }
}
```

### Font Size

```json
{
  "typography": {
    "fontSize": {
      "xs": {
        "$type": "dimension",
        "$value": "0.75rem",
        "$description": "12px"
      },
      "sm": {
        "$type": "dimension",
        "$value": "0.875rem",
        "$description": "14px"
      },
      "base": {
        "$type": "dimension",
        "$value": "1rem",
        "$description": "16px"
      },
      "lg": {
        "$type": "dimension",
        "$value": "1.125rem",
        "$description": "18px"
      },
      "xl": {
        "$type": "dimension",
        "$value": "1.25rem",
        "$description": "20px"
      },
      "2xl": {
        "$type": "dimension",
        "$value": "1.5rem",
        "$description": "24px"
      },
      "3xl": {
        "$type": "dimension",
        "$value": "1.875rem",
        "$description": "30px"
      },
      "4xl": {
        "$type": "dimension",
        "$value": "2.25rem",
        "$description": "36px"
      },
      "5xl": {
        "$type": "dimension",
        "$value": "3rem",
        "$description": "48px"
      }
    }
  }
}
```

### Font Weight

```json
{
  "typography": {
    "fontWeight": {
      "light": {
        "$type": "fontWeight",
        "$value": 300
      },
      "regular": {
        "$type": "fontWeight",
        "$value": 400
      },
      "medium": {
        "$type": "fontWeight",
        "$value": 500
      },
      "semibold": {
        "$type": "fontWeight",
        "$value": 600
      },
      "bold": {
        "$type": "fontWeight",
        "$value": 700
      }
    }
  }
}
```

### Line Height

```json
{
  "typography": {
    "lineHeight": {
      "tight": {
        "$type": "dimension",
        "$value": 1.25
      },
      "normal": {
        "$type": "dimension",
        "$value": 1.5
      },
      "relaxed": {
        "$type": "dimension",
        "$value": 1.75
      },
      "loose": {
        "$type": "dimension",
        "$value": 2
      }
    }
  }
}
```

### Typography Composite Tokens

```json
{
  "typography": {
    "heading": {
      "h1": {
        "fontFamily": {
          "$type": "fontFamily",
          "$value": "{typography.fontFamily.sans}"
        },
        "fontSize": {
          "$type": "dimension",
          "$value": "{typography.fontSize.5xl}"
        },
        "fontWeight": {
          "$type": "fontWeight",
          "$value": "{typography.fontWeight.bold}"
        },
        "lineHeight": {
          "$type": "dimension",
          "$value": "{typography.lineHeight.tight}"
        }
      },
      "h2": {
        "fontFamily": {
          "$type": "fontFamily",
          "$value": "{typography.fontFamily.sans}"
        },
        "fontSize": {
          "$type": "dimension",
          "$value": "{typography.fontSize.4xl}"
        },
        "fontWeight": {
          "$type": "fontWeight",
          "$value": "{typography.fontWeight.bold}"
        },
        "lineHeight": {
          "$type": "dimension",
          "$value": "{typography.lineHeight.tight}"
        }
      }
    },
    "body": {
      "default": {
        "fontFamily": {
          "$type": "fontFamily",
          "$value": "{typography.fontFamily.sans}"
        },
        "fontSize": {
          "$type": "dimension",
          "$value": "{typography.fontSize.base}"
        },
        "fontWeight": {
          "$type": "fontWeight",
          "$value": "{typography.fontWeight.regular}"
        },
        "lineHeight": {
          "$type": "dimension",
          "$value": "{typography.lineHeight.normal}"
        }
      }
    }
  }
}
```

---

## 간격 토큰

### Spacing Scale

8px 기반 간격 시스템:

```json
{
  "spacing": {
    "0": {
      "$type": "dimension",
      "$value": "0"
    },
    "1": {
      "$type": "dimension",
      "$value": "0.25rem",
      "$description": "4px"
    },
    "2": {
      "$type": "dimension",
      "$value": "0.5rem",
      "$description": "8px"
    },
    "3": {
      "$type": "dimension",
      "$value": "0.75rem",
      "$description": "12px"
    },
    "4": {
      "$type": "dimension",
      "$value": "1rem",
      "$description": "16px"
    },
    "5": {
      "$type": "dimension",
      "$value": "1.25rem",
      "$description": "20px"
    },
    "6": {
      "$type": "dimension",
      "$value": "1.5rem",
      "$description": "24px"
    },
    "8": {
      "$type": "dimension",
      "$value": "2rem",
      "$description": "32px"
    },
    "10": {
      "$type": "dimension",
      "$value": "2.5rem",
      "$description": "40px"
    },
    "12": {
      "$type": "dimension",
      "$value": "3rem",
      "$description": "48px"
    },
    "16": {
      "$type": "dimension",
      "$value": "4rem",
      "$description": "64px"
    },
    "20": {
      "$type": "dimension",
      "$value": "5rem",
      "$description": "80px"
    },
    "24": {
      "$type": "dimension",
      "$value": "6rem",
      "$description": "96px"
    }
  }
}
```

### Border Radius

```json
{
  "borderRadius": {
    "none": {
      "$type": "dimension",
      "$value": "0"
    },
    "sm": {
      "$type": "dimension",
      "$value": "0.125rem",
      "$description": "2px"
    },
    "base": {
      "$type": "dimension",
      "$value": "0.25rem",
      "$description": "4px"
    },
    "md": {
      "$type": "dimension",
      "$value": "0.375rem",
      "$description": "6px"
    },
    "lg": {
      "$type": "dimension",
      "$value": "0.5rem",
      "$description": "8px"
    },
    "xl": {
      "$type": "dimension",
      "$value": "0.75rem",
      "$description": "12px"
    },
    "2xl": {
      "$type": "dimension",
      "$value": "1rem",
      "$description": "16px"
    },
    "full": {
      "$type": "dimension",
      "$value": "9999px"
    }
  }
}
```

---

## 출력 포맷

### 1. JSON (W3C 표준)

**tokens.json:**

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#6366f1",
        "$description": "Primary brand color"
      }
    }
  }
}
```

### 2. CSS Custom Properties

**tokens.css:**

```css
:root {
  /* Colors - Brand */
  --color-brand-primary: #6366f1;
  --color-brand-secondary: #8b5cf6;
  --color-brand-accent: #06b6d4;

  /* Colors - Background */
  --color-background-default: #0f172a;
  --color-background-surface: #1e293b;

  /* Colors - Text */
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;

  /* Typography */
  --font-family-sans: Inter, system-ui, sans-serif;
  --font-size-base: 1rem;
  --font-weight-regular: 400;
  --line-height-normal: 1.5;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;

  /* Border Radius */
  --border-radius-base: 0.25rem;
  --border-radius-lg: 0.5rem;
}
```

### 3. SCSS Variables

**tokens.scss:**

```scss
// Colors - Brand
$color-brand-primary: #6366f1;
$color-brand-secondary: #8b5cf6;
$color-brand-accent: #06b6d4;

// Colors - Background
$color-background-default: #0f172a;
$color-background-surface: #1e293b;

// Colors - Text
$color-text-primary: #f8fafc;
$color-text-secondary: #cbd5e1;

// Typography
$font-family-sans: (Inter, system-ui, sans-serif);
$font-size-base: 1rem;
$font-weight-regular: 400;
$line-height-normal: 1.5;

// Spacing
$spacing-1: 0.25rem;
$spacing-2: 0.5rem;
$spacing-4: 1rem;
$spacing-8: 2rem;

// Border Radius
$border-radius-base: 0.25rem;
$border-radius-lg: 0.5rem;

// Maps
$colors: (
  'brand-primary': $color-brand-primary,
  'brand-secondary': $color-brand-secondary,
  'brand-accent': $color-brand-accent
);
```

### 4. Tailwind Config

**tailwind.config.js:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4'
        },
        background: {
          DEFAULT: '#0f172a',
          surface: '#1e293b'
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem'
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      }
    }
  }
};
```

### 5. TypeScript Types

**tokens.d.ts:**

```typescript
export interface DesignTokens {
  color: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
    };
    background: {
      default: string;
      surface: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
  typography: {
    fontFamily: {
      sans: string[];
      mono: string[];
    };
    fontSize: {
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    1: string;
    2: string;
    4: string;
    8: string;
  };
  borderRadius: {
    base: string;
    lg: string;
    full: string;
  };
}

export const tokens: DesignTokens;
```

---

## 변환 파이프라인

### Style Dictionary

SPAGHETTI는 [Style Dictionary](https://amzn.github.io/style-dictionary/)를 사용하여 토큰을 변환합니다.

**설정 파일 (style-dictionary.config.js):**

```javascript
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables'
        }
      ]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/variables'
        }
      ]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6'
        }
      ]
    },
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/tailwind/',
      files: [
        {
          destination: 'tailwind.config.js',
          format: 'tailwind/config'
        }
      ]
    }
  }
};
```

### 빌드 명령어

```bash
# 모든 플랫폼으로 변환
npm run tokens:build

# CSS만 변환
npm run tokens:build:css

# Tailwind만 변환
npm run tokens:build:tailwind
```

### 변환 흐름

```
┌─────────────────────┐
│  tokens/base.json   │
│  tokens/color.json  │
│  tokens/typo.json   │
└──────────┬──────────┘
           │
           │ Style Dictionary
           │
┌──────────▼──────────┐
│  Token Processing   │
│  - Resolve aliases  │
│  - Transform values │
│  - Format output    │
└──────────┬──────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
┌──────────▼──────────┐         ┌───────────▼────────┐
│   dist/css/         │         │  dist/tailwind/    │
│   tokens.css        │         │  tailwind.config.js│
└─────────────────────┘         └────────────────────┘
           │                                 │
┌──────────▼──────────┐         ┌───────────▼────────┐
│   dist/scss/        │         │  dist/ts/          │
│   tokens.scss       │         │  tokens.d.ts       │
└─────────────────────┘         └────────────────────┘
```

---

## 토큰 네이밍 규칙

### 케이스 규칙

```
JSON/W3C:   color.brand.primary
CSS Vars:   --color-brand-primary
SCSS:       $color-brand-primary
Tailwind:   brand-primary
JavaScript: colorBrandPrimary
```

### 계층 구조

```
[category].[concept].[variant].[state]

예시:
- color.brand.primary
- color.text.primary
- color.interactive.hover
- typography.heading.h1
- spacing.component.button.padding
```

---

## 테마 변형

### 라이트/다크 모드

```json
{
  "theme": {
    "light": {
      "color": {
        "background": {
          "default": {
            "$type": "color",
            "$value": "#ffffff"
          }
        },
        "text": {
          "primary": {
            "$type": "color",
            "$value": "#0f172a"
          }
        }
      }
    },
    "dark": {
      "color": {
        "background": {
          "default": {
            "$type": "color",
            "$value": "#0f172a"
          }
        },
        "text": {
          "primary": {
            "$type": "color",
            "$value": "#f8fafc"
          }
        }
      }
    }
  }
}
```

**CSS 출력:**

```css
/* Light Theme */
[data-theme="light"] {
  --color-background-default: #ffffff;
  --color-text-primary: #0f172a;
}

/* Dark Theme */
[data-theme="dark"] {
  --color-background-default: #0f172a;
  --color-text-primary: #f8fafc;
}
```

---

## 사용 예시

### React Component

```tsx
import { tokens } from '@spaghetti/tokens';

function Button({ children }) {
  return (
    <button
      style={{
        backgroundColor: tokens.color.brand.primary,
        color: tokens.color.text.primary,
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        borderRadius: tokens.borderRadius.lg,
        fontFamily: tokens.typography.fontFamily.sans.join(', '),
        fontSize: tokens.typography.fontSize.base,
        fontWeight: tokens.typography.fontWeight.medium
      }}
    >
      {children}
    </button>
  );
}
```

### Tailwind Classes

```jsx
<button className="bg-brand-primary text-text-primary px-4 py-2 rounded-lg font-medium">
  Click me
</button>
```

### CSS Custom Properties

```css
.button {
  background-color: var(--color-brand-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-lg);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}
```

---

## 참고 자료

- [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Design Tokens Format Module](https://tr.designtokens.org/format/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**문서 버전:** 1.0.0
**최종 업데이트:** 2025-12-24
**작성자:** SPAGHETTI Team
