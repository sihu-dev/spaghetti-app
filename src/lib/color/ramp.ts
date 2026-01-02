/**
 * Color Ramp 생성 유틸리티
 * Material Design 3 스타일의 100-900 색상 스케일 생성
 */

import { hexToHct, hctToHex } from "./hct";

/**
 * 색상 스케일 타입 (100-900)
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * ColorScale 키 배열
 */
const SCALE_KEYS: Array<keyof ColorScale> = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * M3 Tone 매핑 테이블
 * 스케일 번호 → HCT Tone 값
 */
const TONE_MAP: Record<keyof ColorScale, number> = {
  50: 98,
  100: 95,
  200: 90,
  300: 80,
  400: 70,
  500: 60,
  600: 50,
  700: 40,
  800: 30,
  900: 20,
  950: 10,
};

/**
 * 시드 색상에서 전체 색상 램프 생성
 */
export function generateColorRamp(seedColor: string): ColorScale {
  const hct = hexToHct(seedColor);

  const scale: ColorScale = {
    50: "",
    100: "",
    200: "",
    300: "",
    400: "",
    500: "",
    600: "",
    700: "",
    800: "",
    900: "",
    950: "",
  };

  SCALE_KEYS.forEach((key) => {
    scale[key] = hctToHex({
      h: hct.h,
      c: hct.c,
      t: TONE_MAP[key],
    });
  });

  return scale;
}

/**
 * 채도를 유지하면서 색상 램프 생성 (브랜드 컬러용)
 * 밝은 톤에서 채도 감소를 최소화
 */
export function generateBrandColorRamp(seedColor: string): ColorScale {
  const hct = hexToHct(seedColor);
  const scale: ColorScale = {
    50: "",
    100: "",
    200: "",
    300: "",
    400: "",
    500: "",
    600: "",
    700: "",
    800: "",
    900: "",
    950: "",
  };

  // 브랜드 보존 모드: 높은 Tone에서도 채도 유지
  const chromaAdjustment: Record<keyof ColorScale, number> = {
    50: 0.3,   // 매우 밝은 톤은 채도 감소
    100: 0.5,
    200: 0.7,
    300: 0.85,
    400: 0.95,
    500: 1.0,  // 원본 채도 유지
    600: 1.0,
    700: 0.95,
    800: 0.9,
    900: 0.85,
    950: 0.8,
  };

  SCALE_KEYS.forEach((key) => {
    const chromaMultiplier = chromaAdjustment[key];
    scale[key] = hctToHex({
      h: hct.h,
      c: hct.c * chromaMultiplier,
      t: TONE_MAP[key],
    });
  });

  return scale;
}

/**
 * Neutral (회색) 색상 램프 생성
 * Hue를 유지하면서 매우 낮은 Chroma로 회색조 생성
 */
export function generateNeutralRamp(seedColor: string): ColorScale {
  const hct = hexToHct(seedColor);
  const scale: ColorScale = {
    50: "",
    100: "",
    200: "",
    300: "",
    400: "",
    500: "",
    600: "",
    700: "",
    800: "",
    900: "",
    950: "",
  };

  // Neutral은 시드 색상의 Hue를 아주 살짝 유지 (따뜻한/차가운 회색)
  const neutralChroma = Math.min(hct.c * 0.05, 6); // 최대 Chroma 6

  SCALE_KEYS.forEach((key) => {
    scale[key] = hctToHex({
      h: hct.h,
      c: neutralChroma,
      t: TONE_MAP[key],
    });
  });

  return scale;
}

/**
 * Error 색상 램프 생성 (붉은 계열)
 */
export function generateErrorRamp(): ColorScale {
  return generateColorRamp("#DC2626"); // 기본 에러 색상 (빨강)
}

/**
 * Warning 색상 램프 생성 (주황/노랑 계열)
 */
export function generateWarningRamp(): ColorScale {
  return generateColorRamp("#F59E0B"); // 기본 경고 색상 (주황)
}

/**
 * Success 색상 램프 생성 (초록 계열)
 */
export function generateSuccessRamp(): ColorScale {
  return generateColorRamp("#10B981"); // 기본 성공 색상 (초록)
}

/**
 * 전체 컬러 팔레트 생성
 */
export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  tertiary: ColorScale;
  neutral: ColorScale;
  error: ColorScale;
  warning: ColorScale;
  success: ColorScale;
}

export function generateColorPalette(
  primarySeed: string,
  secondarySeed?: string,
  tertiarySeed?: string
): ColorPalette {
  const primaryHct = hexToHct(primarySeed);

  // Secondary가 없으면 Primary의 보색 계열로 생성
  const defaultSecondary = hctToHex({
    h: (primaryHct.h + 120) % 360,
    c: primaryHct.c * 0.8,
    t: primaryHct.t,
  });

  // Tertiary가 없으면 Primary의 반대 보색 계열로 생성
  const defaultTertiary = hctToHex({
    h: (primaryHct.h + 240) % 360,
    c: primaryHct.c * 0.6,
    t: primaryHct.t,
  });

  return {
    primary: generateBrandColorRamp(primarySeed),
    secondary: generateColorRamp(secondarySeed ?? defaultSecondary),
    tertiary: generateColorRamp(tertiarySeed ?? defaultTertiary),
    neutral: generateNeutralRamp(primarySeed),
    error: generateErrorRamp(),
    warning: generateWarningRamp(),
    success: generateSuccessRamp(),
  };
}

/**
 * 단일 색상에서 Surface 색상들 생성 (M3 스타일)
 */
export interface SurfaceColors {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

export function generateSurfaceColors(
  neutralRamp: ColorScale,
  isDark: boolean = false
): SurfaceColors {
  if (isDark) {
    return {
      surface: neutralRamp[950],
      surfaceDim: neutralRamp[950],
      surfaceBright: neutralRamp[800],
      surfaceContainerLowest: neutralRamp[950],
      surfaceContainerLow: neutralRamp[900],
      surfaceContainer: neutralRamp[900],
      surfaceContainerHigh: neutralRamp[800],
      surfaceContainerHighest: neutralRamp[700],
    };
  }

  return {
    surface: neutralRamp[50],
    surfaceDim: neutralRamp[100],
    surfaceBright: neutralRamp[50],
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: neutralRamp[50],
    surfaceContainer: neutralRamp[100],
    surfaceContainerHigh: neutralRamp[200],
    surfaceContainerHighest: neutralRamp[300],
  };
}
