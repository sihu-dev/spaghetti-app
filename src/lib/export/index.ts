/**
 * Design Token Export Utilities
 * CSS Variables, Tailwind Config, JSON Tokens 생성
 */

import type { ColorScale } from "@/lib/color/ramp";
import type { ExtractedColor } from "@/lib/color/extraction";

export interface ExportData {
  primaryColor: string;
  colorRamp: ColorScale;
  extractedColors: ExtractedColor[];
  projectName?: string;
}

/**
 * CSS Variables 생성
 */
export function generateCssVariables(data: ExportData): string {
  const lines: string[] = [":root {"];

  // Primary color
  lines.push(`  /* Primary Color */`);
  lines.push(`  --color-primary: ${data.primaryColor};`);
  lines.push("");

  // Color ramp
  lines.push(`  /* Primary Color Ramp */`);
  Object.entries(data.colorRamp).forEach(([key, value]) => {
    lines.push(`  --color-primary-${key}: ${value};`);
  });
  lines.push("");

  // Extracted colors
  if (data.extractedColors.length > 0) {
    lines.push(`  /* Extracted Colors */`);
    data.extractedColors.forEach((color, index) => {
      lines.push(`  --color-extracted-${index + 1}: ${color.hex};`);
    });
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Tailwind Config 생성
 */
export function generateTailwindConfig(data: ExportData): string {
  const colors: Record<string, Record<string, string>> = {
    primary: {},
    extracted: {},
  };

  // Color ramp
  Object.entries(data.colorRamp).forEach(([key, value]) => {
    colors.primary[key] = value;
  });
  colors.primary.DEFAULT = data.primaryColor;

  // Extracted colors
  data.extractedColors.forEach((color, index) => {
    colors.extracted[`${index + 1}`] = color.hex;
  });

  const config = {
    theme: {
      extend: {
        colors,
      },
    },
  };

  return `// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)};`;
}

/**
 * JSON Tokens 생성
 */
export function generateJsonTokens(data: ExportData): string {
  const tokens = {
    $schema: "https://design-tokens.github.io/schema",
    version: "1.0.0",
    project: data.projectName || "Spaghetti Design System",
    colors: {
      primary: {
        value: data.primaryColor,
        type: "color",
        description: "Primary brand color",
      },
      primaryScale: Object.entries(data.colorRamp).reduce(
        (acc, [key, value]) => {
          acc[key] = {
            value,
            type: "color",
            description: `Primary color at ${key} tone`,
          };
          return acc;
        },
        {} as Record<string, { value: string; type: string; description: string }>
      ),
      extracted: data.extractedColors.map((color, index) => ({
        name: `color-${index + 1}`,
        value: color.hex,
        type: "color",
        hct: {
          hue: Math.round(color.hct.h),
          chroma: Math.round(color.hct.c),
          tone: Math.round(color.hct.t),
        },
        percentage: Math.round(color.percentage * 100) / 100,
      })),
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: "Spaghetti AI",
    },
  };

  return JSON.stringify(tokens, null, 2);
}

/**
 * 파일 다운로드 유틸리티
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * CSS Variables 다운로드
 */
export function downloadCssVariables(data: ExportData): void {
  const content = generateCssVariables(data);
  downloadFile(content, "design-tokens.css", "text/css");
}

/**
 * Tailwind Config 다운로드
 */
export function downloadTailwindConfig(data: ExportData): void {
  const content = generateTailwindConfig(data);
  downloadFile(content, "tailwind.colors.js", "application/javascript");
}

/**
 * JSON Tokens 다운로드
 */
export function downloadJsonTokens(data: ExportData): void {
  const content = generateJsonTokens(data);
  downloadFile(content, "design-tokens.json", "application/json");
}
