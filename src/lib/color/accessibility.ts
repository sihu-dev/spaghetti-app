/**
 * WCAG Accessibility - 대비비 계산 및 접근성 검사
 * WCAG 2.1 기준: AA (4.5:1 일반, 3:1 대형), AAA (7:1 일반, 4.5:1 대형)
 */

import { hexToRgb } from "./hct";

export interface ContrastResult {
  ratio: number;
  ratioText: string;
  level: "AAA" | "AA" | "AA-Large" | "Fail";
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
  passAAALarge: boolean;
}

export interface AccessibilityReport {
  foreground: string;
  background: string;
  contrast: ContrastResult;
  suggestions: string[];
}

/**
 * 상대 휘도(Relative Luminance) 계산 - WCAG 2.1 공식
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 대비비 계산 - WCAG 2.1 공식
 */
export function getContrastRatio(
  foreground: string,
  background: string,
): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 레벨 판정
 */
export function getWCAGLevel(ratio: number): ContrastResult {
  return {
    ratio,
    ratioText: `${ratio.toFixed(2)}:1`,
    level:
      ratio >= 7
        ? "AAA"
        : ratio >= 4.5
          ? "AA"
          : ratio >= 3
            ? "AA-Large"
            : "Fail",
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
    passAALarge: ratio >= 3,
    passAAALarge: ratio >= 4.5,
  };
}

/**
 * 접근성 리포트 생성
 */
export function getAccessibilityReport(
  foreground: string,
  background: string,
): AccessibilityReport {
  const ratio = getContrastRatio(foreground, background);
  const contrast = getWCAGLevel(ratio);

  const suggestions: string[] = [];

  if (!contrast.passAA) {
    if (contrast.passAALarge) {
      suggestions.push("대형 텍스트(18pt+ 또는 14pt bold)에서만 사용 가능");
    } else {
      suggestions.push(
        "대비비가 너무 낮습니다. 더 어둡거나 밝은 색상을 선택하세요",
      );
    }
  }

  if (contrast.passAA && !contrast.passAAA) {
    suggestions.push("AAA 등급을 위해 대비비를 7:1 이상으로 높이세요");
  }

  return { foreground, background, contrast, suggestions };
}

/**
 * 컬러 스케일의 접근성 매트릭스 생성
 */
export function generateAccessibilityMatrix(
  colorScale: Record<string, string>,
): Record<string, Record<string, ContrastResult>> {
  const matrix: Record<string, Record<string, ContrastResult>> = {};
  const keys = Object.keys(colorScale);

  for (const fg of keys) {
    matrix[fg] = {};
    for (const bg of keys) {
      const ratio = getContrastRatio(colorScale[fg], colorScale[bg]);
      matrix[fg][bg] = getWCAGLevel(ratio);
    }
  }

  return matrix;
}

/**
 * 텍스트 색상 자동 추천 (배경색 기준)
 */
export function getAutoTextColor(backgroundColor: string): {
  recommended: string;
  ratio: number;
  level: string;
} {
  const white = "#FFFFFF";
  const black = "#000000";

  const whiteRatio = getContrastRatio(white, backgroundColor);
  const blackRatio = getContrastRatio(black, backgroundColor);

  if (whiteRatio > blackRatio) {
    return {
      recommended: white,
      ratio: whiteRatio,
      level: getWCAGLevel(whiteRatio).level,
    };
  } else {
    return {
      recommended: black,
      ratio: blackRatio,
      level: getWCAGLevel(blackRatio).level,
    };
  }
}

/**
 * 접근성을 통과하는 가장 가까운 명도 찾기
 */
export function findAccessibleShade(
  colorScale: Record<string, string>,
  backgroundColor: string,
  targetLevel: "AA" | "AAA" = "AA",
): { shade: string; color: string; ratio: number } | null {
  const minRatio = targetLevel === "AAA" ? 7 : 4.5;

  const results = Object.entries(colorScale)
    .map(([shade, color]) => ({
      shade,
      color,
      ratio: getContrastRatio(color, backgroundColor),
    }))
    .filter((r) => r.ratio >= minRatio)
    .sort((a, b) => a.ratio - b.ratio);

  return results[0] || null;
}
