/**
 * Accessibility 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import {
  getRelativeLuminance,
  getContrastRatio,
  getWCAGLevel,
  getAccessibilityReport,
  generateAccessibilityMatrix,
  getAutoTextColor,
  findAccessibleShade,
} from "./accessibility";
import { generateColorRamp } from "./ramp";

describe("Accessibility", () => {
  describe("getRelativeLuminance", () => {
    it("should return 1 for white", () => {
      expect(getRelativeLuminance("#FFFFFF")).toBeCloseTo(1, 2);
    });

    it("should return 0 for black", () => {
      expect(getRelativeLuminance("#000000")).toBeCloseTo(0, 2);
    });

    it("should return intermediate value for gray", () => {
      const luminance = getRelativeLuminance("#808080");
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe("getContrastRatio", () => {
    it("should return 21:1 for black on white", () => {
      const ratio = getContrastRatio("#000000", "#FFFFFF");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should return 1:1 for same colors", () => {
      const ratio = getContrastRatio("#5C6356", "#5C6356");
      expect(ratio).toBeCloseTo(1, 2);
    });

    it("should be symmetric", () => {
      const ratio1 = getContrastRatio("#5C6356", "#FFFFFF");
      const ratio2 = getContrastRatio("#FFFFFF", "#5C6356");
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe("getWCAGLevel", () => {
    it("should return AAA for high contrast", () => {
      const result = getWCAGLevel(10);
      expect(result.level).toBe("AAA");
      expect(result.passAAA).toBe(true);
      expect(result.passAA).toBe(true);
    });

    it("should return AA for medium contrast", () => {
      const result = getWCAGLevel(5);
      expect(result.level).toBe("AA");
      expect(result.passAA).toBe(true);
      expect(result.passAAA).toBe(false);
    });

    it("should return AA-Large for lower contrast", () => {
      const result = getWCAGLevel(3.5);
      expect(result.level).toBe("AA-Large");
      expect(result.passAALarge).toBe(true);
      expect(result.passAA).toBe(false);
    });

    it("should return Fail for insufficient contrast", () => {
      const result = getWCAGLevel(2);
      expect(result.level).toBe("Fail");
      expect(result.passAALarge).toBe(false);
    });
  });

  describe("getAccessibilityReport", () => {
    it("should generate report with suggestions for low contrast", () => {
      const report = getAccessibilityReport("#888888", "#999999");
      expect(report.suggestions.length).toBeGreaterThan(0);
    });

    it("should generate report without suggestions for high contrast", () => {
      const report = getAccessibilityReport("#000000", "#FFFFFF");
      expect(report.contrast.passAAA).toBe(true);
    });
  });

  describe("generateAccessibilityMatrix", () => {
    it("should generate matrix for color scale", () => {
      const colorScale = {
        "100": "#E5E5E5",
        "500": "#5C6356",
        "900": "#1A1A1A",
      };

      const matrix = generateAccessibilityMatrix(colorScale);

      expect(matrix["100"]).toBeDefined();
      expect(matrix["100"]["500"]).toBeDefined();
      expect(matrix["100"]["500"].ratio).toBeGreaterThan(0);
    });
  });

  describe("getAutoTextColor", () => {
    it("should recommend white text on dark background", () => {
      const result = getAutoTextColor("#1A1A1A");
      expect(result.recommended).toBe("#FFFFFF");
    });

    it("should recommend black text on light background", () => {
      const result = getAutoTextColor("#F5F5F5");
      expect(result.recommended).toBe("#000000");
    });
  });

  describe("findAccessibleShade", () => {
    it("should find accessible shade for AA", () => {
      const colorScale = generateColorRamp("#5C6356");
      const scaleRecord: Record<string, string> = {};
      Object.entries(colorScale).forEach(([key, value]) => {
        scaleRecord[key] = value;
      });

      const result = findAccessibleShade(scaleRecord, "#FFFFFF", "AA");

      if (result) {
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("should return null if no accessible shade exists", () => {
      const colorScale = { "100": "#F5F5F5", "200": "#EEEEEE" };
      const result = findAccessibleShade(colorScale, "#FFFFFF", "AAA");

      expect(result).toBeNull();
    });
  });
});
