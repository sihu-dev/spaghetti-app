/**
 * Figma Plugin Types
 * Figma 플러그인과 웹앱 간 데이터 교환 타입
 */

/**
 * Figma에서 받아오는 색상 정보
 */
export interface FigmaColor {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a?: number; // 0-1, optional alpha
}

/**
 * Figma 스타일 정보
 */
export interface FigmaColorStyle {
  id: string;
  name: string;
  color: FigmaColor;
  description?: string;
}

/**
 * Figma로 내보낼 디자인 토큰
 */
export interface FigmaExportPayload {
  projectName: string;
  primaryColor: string;
  colorScale: Record<string, string>;
  semanticColors?: Record<string, string>;
  timestamp: string;
}

/**
 * Figma에서 가져올 데이터
 */
export interface FigmaImportPayload {
  styles: FigmaColorStyle[];
  selection?: {
    type: string;
    fills: FigmaColor[];
  };
}

/**
 * API 응답 타입
 */
export interface FigmaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Figma RGB를 HEX로 변환
 */
export function figmaColorToHex(color: FigmaColor): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

/**
 * HEX를 Figma RGB로 변환
 */
export function hexToFigmaColor(hex: string): FigmaColor {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  return { r, g, b };
}
