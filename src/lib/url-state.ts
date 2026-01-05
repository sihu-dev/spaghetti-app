/**
 * URL State Management with nuqs
 * 색상과 설정을 URL에 동기화하여 공유 가능하게 함
 */

import {
  parseAsString,
  parseAsBoolean,
  parseAsStringLiteral,
  createSearchParamsCache,
} from "nuqs/server";

// URL 파라미터 파서 정의
export const colorParser = parseAsString.withDefault("");
export const darkModeParser = parseAsBoolean.withDefault(false);
export const tabParser = parseAsStringLiteral([
  "colors",
  "accessibility",
  "darkmode",
] as const).withDefault("colors");
export const previewParser = parseAsStringLiteral([
  "buttons",
  "forms",
  "cards",
] as const).withDefault("buttons");

// 서버 컴포넌트용 캐시
export const searchParamsCache = createSearchParamsCache({
  color: colorParser,
  dark: darkModeParser,
  tab: tabParser,
  preview: previewParser,
});

/**
 * 색상 URL 생성
 */
export function createColorShareUrl(
  baseUrl: string,
  color: string,
  options?: {
    darkMode?: boolean;
    tab?: string;
    preview?: string;
  },
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("color", color.replace("#", ""));

  if (options?.darkMode) {
    url.searchParams.set("dark", "true");
  }
  if (options?.tab) {
    url.searchParams.set("tab", options.tab);
  }
  if (options?.preview) {
    url.searchParams.set("preview", options.preview);
  }

  return url.toString();
}

/**
 * URL에서 색상 파싱
 */
export function parseColorFromUrl(colorParam: string | null): string | null {
  if (!colorParam) return null;

  // # 없으면 추가
  const color = colorParam.startsWith("#") ? colorParam : `#${colorParam}`;

  // 유효한 HEX인지 확인
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase();
  }

  // 3자리 HEX 확장
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    const expanded = color
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }

  return null;
}
