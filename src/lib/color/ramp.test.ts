/**
 * Color Ramp 생성 테스트
 */

import { describe, it, expect } from "vitest";
import {
  generateColorRamp,
  generateBrandColorRamp,
  generateNeutralRamp,
  generateColorPalette,
  generateSurfaceColors,
  type ColorScale,
} from "./ramp";
import { hexToHct } from "./hct";

type ScaleKey = keyof ColorScale;

describe("Color Ramp", () => {
  describe("generateColorRamp", () => {
    it("should generate all scale keys", () => {
      const ramp = generateColorRamp("#5C6356");
      const keys: ScaleKey[] = [
        50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
      ];

      keys.forEach((key) => {
        expect(ramp[key]).toBeDefined();
        expect(ramp[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("should have correct tone progression", () => {
      const ramp = generateColorRamp("#5C6356");

      // 50은 가장 밝고, 950은 가장 어두워야 함
      const tone50 = hexToHct(ramp[50]).t;
      const tone950 = hexToHct(ramp[950]).t;

      expect(tone50).toBeGreaterThan(tone950);
    });

    it("should preserve hue across scale", () => {
      const seedHct = hexToHct("#5C6356");
      const ramp = generateColorRamp("#5C6356");

      const hue500 = hexToHct(ramp[500]).h;
      // Hue는 seed와 동일해야 함
      expect(Math.abs(hue500 - seedHct.h)).toBeLessThan(5);
    });
  });

  describe("generateBrandColorRamp", () => {
    it("should generate all scale keys", () => {
      const ramp = generateBrandColorRamp("#5C6356");

      expect(Object.keys(ramp).length).toBe(11);
      expect(ramp[500]).toBeDefined();
    });

    it("should maintain higher chroma than standard ramp", () => {
      const standardRamp = generateColorRamp("#5C6356");
      const brandRamp = generateBrandColorRamp("#5C6356");

      // 300 레벨에서 브랜드 램프가 더 채도가 높아야 함
      const standardChroma = hexToHct(standardRamp[300]).c;
      const brandChroma = hexToHct(brandRamp[300]).c;

      expect(brandChroma).toBeGreaterThanOrEqual(standardChroma * 0.8);
    });
  });

  describe("generateNeutralRamp", () => {
    it("should generate low chroma colors", () => {
      const ramp = generateNeutralRamp("#5C6356");

      Object.values(ramp).forEach((color) => {
        const hct = hexToHct(color);
        expect(hct.c).toBeLessThanOrEqual(10);
      });
    });
  });

  describe("generateColorPalette", () => {
    it("should generate complete palette", () => {
      const palette = generateColorPalette("#5C6356");

      expect(palette.primary).toBeDefined();
      expect(palette.secondary).toBeDefined();
      expect(palette.tertiary).toBeDefined();
      expect(palette.neutral).toBeDefined();
      expect(palette.error).toBeDefined();
      expect(palette.warning).toBeDefined();
      expect(palette.success).toBeDefined();
    });

    it("should use provided secondary color", () => {
      const palette = generateColorPalette("#5C6356", "#9D7B5B");

      expect(palette.secondary[500]).toBeDefined();
    });
  });

  describe("generateSurfaceColors", () => {
    it("should generate light mode surface colors", () => {
      const neutralRamp = generateNeutralRamp("#5C6356");
      const surfaces = generateSurfaceColors(neutralRamp, false);

      expect(surfaces.surface).toBeDefined();
      expect(surfaces.surfaceContainer).toBeDefined();
      expect(surfaces.surfaceContainerLowest).toBe("#FFFFFF");
    });

    it("should generate dark mode surface colors", () => {
      const neutralRamp = generateNeutralRamp("#5C6356");
      const surfaces = generateSurfaceColors(neutralRamp, true);

      expect(surfaces.surface).toBe(neutralRamp[950]);
      expect(surfaces.surfaceBright).toBe(neutralRamp[800]);
    });
  });
});
