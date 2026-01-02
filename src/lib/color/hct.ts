/**
 * HCT (Hue-Chroma-Tone) 색공간 유틸리티
 * Material Design 3 색상 시스템의 핵심
 */

import {
  converter,
  formatHex,
  parse,
  type Hct,
  type Rgb
} from "culori";

// HCT 변환기
const toHct = converter("hct");
const toRgb = converter("rgb");

export interface HctColor {
  h: number;  // Hue (0-360)
  c: number;  // Chroma (0-150+)
  t: number;  // Tone (0-100)
}

export interface RgbColor {
  r: number;  // Red (0-255)
  g: number;  // Green (0-255)
  b: number;  // Blue (0-255)
}

/**
 * HEX 색상을 HCT로 변환
 */
export function hexToHct(hex: string): HctColor {
  const color = toHct(hex);
  if (!color) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    h: color.h ?? 0,
    c: color.c ?? 0,
    t: color.t ?? 0,
  };
}

/**
 * HCT 색상을 HEX로 변환
 */
export function hctToHex(hct: HctColor): string {
  const color: Hct = {
    mode: "hct",
    h: hct.h,
    c: hct.c,
    t: hct.t,
  };
  const hex = formatHex(color);
  return hex ?? "#000000";
}

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): RgbColor {
  const color = toRgb(hex);
  if (!color) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: Math.round((color.r ?? 0) * 255),
    g: Math.round((color.g ?? 0) * 255),
    b: Math.round((color.b ?? 0) * 255),
  };
}

/**
 * RGB 색상을 HEX로 변환
 */
export function rgbToHex(rgb: RgbColor): string {
  const color: Rgb = {
    mode: "rgb",
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  };
  return formatHex(color) ?? "#000000";
}

/**
 * RGB 색상을 HCT로 변환
 */
export function rgbToHct(rgb: RgbColor): HctColor {
  const hex = rgbToHex(rgb);
  return hexToHct(hex);
}

/**
 * HCT의 Tone 값 조정
 */
export function adjustTone(hex: string, targetTone: number): string {
  const hct = hexToHct(hex);
  return hctToHex({
    ...hct,
    t: Math.max(0, Math.min(100, targetTone)),
  });
}

/**
 * HCT의 Chroma 값 조정
 */
export function adjustChroma(hex: string, targetChroma: number): string {
  const hct = hexToHct(hex);
  return hctToHex({
    ...hct,
    c: Math.max(0, targetChroma),
  });
}

/**
 * 색상이 유효한 HEX인지 확인
 */
export function isValidHex(hex: string): boolean {
  const parsed = parse(hex);
  return parsed !== undefined;
}

/**
 * 색상 밝기 계산 (0-1)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 색상이 밝은지 어두운지 판단
 */
export function isLightColor(hex: string): boolean {
  const hct = hexToHct(hex);
  return hct.t > 50;
}
