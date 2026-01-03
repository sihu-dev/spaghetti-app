/**
 * Dark Mode 생성 테스트
 */

import { describe, it, expect } from "vitest";
import {
  generateDarkColorScale,
  generateLightSemanticTokens,
  generateDarkSemanticTokens,
  generateThemePalette,
  exportThemeAsCSS,
} from "./darkmode";
import { generateColorRamp } from "./ramp";

describe("Dark Mode", () => {
  describe("generateDarkColorScale", () => {
    it("should invert tone mapping", () => {
      const lightScale = generateColorRamp("#5C6356");
      const darkScale = generateDarkColorScale(lightScale);

      // 50 (dark) = 950 (light)
      expect(darkScale[50]).toBe(lightScale[950]);
      // 950 (dark) = 50 (light)
      expect(darkScale[950]).toBe(lightScale[50]);
    });

    it("should maintain 500 unchanged", () => {
      const lightScale = generateColorRamp("#5C6356");
      const darkScale = generateDarkColorScale(lightScale);

      expect(darkScale[500]).toBe(lightScale[500]);
    });
  });

  describe("generateLightSemanticTokens", () => {
    it("should generate all semantic tokens", () => {
      const colorScale = generateColorRamp("#5C6356");
      const tokens = generateLightSemanticTokens(colorScale, "#5C6356");

      expect(tokens.background).toBe("#FFFFFF");
      expect(tokens.textPrimary).toBe("#1A1A1A");
      expect(tokens.primary).toBe(colorScale[500]);
    });

    it("should have correct surface colors", () => {
      const colorScale = generateColorRamp("#5C6356");
      const tokens = generateLightSemanticTokens(colorScale, "#5C6356");

      expect(tokens.surfaceAlt).toBe(colorScale[50]);
      expect(tokens.surfaceHover).toBe(colorScale[100]);
    });
  });

  describe("generateDarkSemanticTokens", () => {
    it("should generate dark theme tokens", () => {
      const colorScale = generateColorRamp("#5C6356");
      const darkScale = generateDarkColorScale(colorScale);
      const tokens = generateDarkSemanticTokens(colorScale, darkScale);

      expect(tokens.background).toBe("#0A0A0A");
      expect(tokens.textPrimary).toBe("#FFFFFF");
      expect(tokens.primary).toBe(darkScale[400]);
    });

    it("should have lighter primary for dark mode", () => {
      const colorScale = generateColorRamp("#5C6356");
      const darkScale = generateDarkColorScale(colorScale);
      const tokens = generateDarkSemanticTokens(colorScale, darkScale);

      // Dark mode uses lighter shade (400)
      expect(tokens.primary).toBe(darkScale[400]);
      expect(tokens.primaryHover).toBe(darkScale[300]);
    });
  });

  describe("generateThemePalette", () => {
    it("should generate complete theme palette", () => {
      const palette = generateThemePalette("#5C6356");

      expect(palette.light).toBeDefined();
      expect(palette.dark).toBeDefined();
      expect(palette.colorScale).toBeDefined();
      expect(palette.darkColorScale).toBeDefined();
    });

    it("should have contrasting light and dark backgrounds", () => {
      const palette = generateThemePalette("#5C6356");

      expect(palette.light.background).toBe("#FFFFFF");
      expect(palette.dark.background).toBe("#0A0A0A");
    });
  });

  describe("exportThemeAsCSS", () => {
    it("should export valid CSS", () => {
      const palette = generateThemePalette("#5C6356");
      const css = exportThemeAsCSS(palette);

      expect(css).toContain(":root {");
      expect(css).toContain("--background:");
      expect(css).toContain("@media (prefers-color-scheme: dark)");
      expect(css).toContain(".dark {");
    });

    it("should include color scale variables", () => {
      const palette = generateThemePalette("#5C6356");
      const css = exportThemeAsCSS(palette);

      expect(css).toContain("--color-primary-500:");
      expect(css).toContain("--color-primary-100:");
    });
  });
});
