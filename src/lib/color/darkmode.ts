/**
 * Dark Mode Palette Generator
 * 라이트 팔레트에서 다크 팔레트 자동 생성
 */

import { generateColorRamp, type ColorScale } from './ramp';

export interface DarkModeConfig {
  // 배경색 톤 (0-20 권장)
  backgroundTone?: number;
  // 표면색 톤 (5-25 권장)
  surfaceTone?: number;
  // 채도 조정 (-1 to 1)
  chromaAdjust?: number;
}

export interface SemanticTokens {
  // 배경
  background: string;
  backgroundAlt: string;

  // 표면
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;

  // 테두리
  border: string;
  borderAlt: string;

  // 텍스트
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Primary 컬러
  primary: string;
  primaryHover: string;
  primaryActive: string;
  onPrimary: string;

  // 상태 컬러
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemePalette {
  light: SemanticTokens;
  dark: SemanticTokens;
  colorScale: ColorScale;
  darkColorScale: ColorScale;
}

/**
 * 다크모드 컬러 스케일 생성 (톤 반전)
 */
export function generateDarkColorScale(lightScale: ColorScale): ColorScale {
  // 다크모드에서는 톤을 반전시키되, 완전히 뒤집지는 않음
  // 50 -> 900, 100 -> 800 ... 대신 부드럽게 조정
  return {
    '50': lightScale['950'],
    '100': lightScale['900'],
    '200': lightScale['800'],
    '300': lightScale['700'],
    '400': lightScale['600'],
    '500': lightScale['500'],
    '600': lightScale['400'],
    '700': lightScale['300'],
    '800': lightScale['200'],
    '900': lightScale['100'],
    '950': lightScale['50'],
  };
}

/**
 * 라이트 테마 시맨틱 토큰 생성
 */
export function generateLightSemanticTokens(
  colorScale: ColorScale,
  primaryColor: string
): SemanticTokens {
  return {
    // 배경
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',

    // 표면
    surface: '#FFFFFF',
    surfaceAlt: colorScale['50'],
    surfaceHover: colorScale['100'],

    // 테두리
    border: '#E5E5E5',
    borderAlt: colorScale['200'],

    // 텍스트
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    textInverse: '#FFFFFF',

    // Primary
    primary: colorScale['500'],
    primaryHover: colorScale['600'],
    primaryActive: colorScale['700'],
    onPrimary: '#FFFFFF',

    // 상태
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };
}

/**
 * 다크 테마 시맨틱 토큰 생성
 */
export function generateDarkSemanticTokens(
  colorScale: ColorScale,
  darkColorScale: ColorScale
): SemanticTokens {
  return {
    // 배경 (진한 회색)
    background: '#0A0A0A',
    backgroundAlt: '#111111',

    // 표면 (약간 밝은 회색)
    surface: '#1A1A1A',
    surfaceAlt: '#222222',
    surfaceHover: '#2A2A2A',

    // 테두리
    border: '#333333',
    borderAlt: '#444444',

    // 텍스트
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',
    textInverse: '#1A1A1A',

    // Primary (다크모드에서는 밝은 톤 사용)
    primary: darkColorScale['400'],
    primaryHover: darkColorScale['300'],
    primaryActive: darkColorScale['200'],
    onPrimary: '#1A1A1A',

    // 상태 (다크모드용 밝은 버전)
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  };
}

/**
 * 전체 테마 팔레트 생성
 */
export function generateThemePalette(primaryColor: string): ThemePalette {
  const colorScale = generateColorRamp(primaryColor);
  const darkColorScale = generateDarkColorScale(colorScale);

  return {
    light: generateLightSemanticTokens(colorScale, primaryColor),
    dark: generateDarkSemanticTokens(colorScale, darkColorScale),
    colorScale,
    darkColorScale,
  };
}

/**
 * CSS 변수로 내보내기
 */
export function exportThemeAsCSS(palette: ThemePalette): string {
  const lightVars = Object.entries(palette.light)
    .map(([key, value]) => `  --${camelToKebab(key)}: ${value};`)
    .join('\n');

  const darkVars = Object.entries(palette.dark)
    .map(([key, value]) => `  --${camelToKebab(key)}: ${value};`)
    .join('\n');

  const scaleVars = Object.entries(palette.colorScale)
    .map(([key, value]) => `  --color-primary-${key}: ${value};`)
    .join('\n');

  const darkScaleVars = Object.entries(palette.darkColorScale)
    .map(([key, value]) => `  --color-primary-${key}: ${value};`)
    .join('\n');

  return `/* Light Theme */
:root {
${lightVars}

  /* Color Scale */
${scaleVars}
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root {
${darkVars}

    /* Dark Color Scale */
${darkScaleVars}
  }
}

/* Manual Dark Mode Class */
.dark {
${darkVars}

  /* Dark Color Scale */
${darkScaleVars}
}
`;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Tailwind 설정으로 내보내기
 */
export function exportThemeAsTailwind(palette: ThemePalette): object {
  return {
    colors: {
      background: 'var(--background)',
      'background-alt': 'var(--background-alt)',
      surface: 'var(--surface)',
      'surface-alt': 'var(--surface-alt)',
      border: 'var(--border)',
      primary: {
        DEFAULT: 'var(--primary)',
        hover: 'var(--primary-hover)',
        active: 'var(--primary-active)',
      },
      text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
    },
  };
}
