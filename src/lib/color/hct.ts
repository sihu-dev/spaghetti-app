/**
 * HCT (Hue-Chroma-Tone) 색공간 유틸리티
 * Material Design 3 색상 시스템의 핵심
 *
 * @material/material-color-utilities 사용
 */

import {
  Hct,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

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
  const argb = argbFromHex(hex);
  const hct = Hct.fromInt(argb);
  return {
    h: hct.hue,
    c: hct.chroma,
    t: hct.tone,
  };
}

/**
 * HCT 색상을 HEX로 변환
 */
export function hctToHex(hct: HctColor): string {
  const hctColor = Hct.from(hct.h, hct.c, hct.t);
  return hexFromArgb(hctColor.toInt());
}

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): RgbColor {
  const argb = argbFromHex(hex);
  return {
    r: (argb >> 16) & 0xff,
    g: (argb >> 8) & 0xff,
    b: argb & 0xff,
  };
}

/**
 * RGB 색상을 HEX로 변환
 */
export function rgbToHex(rgb: RgbColor): string {
  const argb = (255 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b;
  return hexFromArgb(argb);
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
  if (!hex || typeof hex !== "string") return false;
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
  return /^[0-9A-Fa-f]{6}$/.test(cleanHex) || /^[0-9A-Fa-f]{3}$/.test(cleanHex);
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
