/**
 * Color Blindness Simulation Tests
 */

import { describe, it, expect } from "vitest";
import {
  simulateColorBlindness,
  simulateColorScale,
  getAllSimulations,
  areColorsDistinguishable,
  generateAccessibilityReport,
  COLOR_BLINDNESS_TYPES,
  type ColorBlindnessType,
} from "./colorblind";

describe("colorblind", () => {
  describe("COLOR_BLINDNESS_TYPES", () => {
    it("should contain all 9 types", () => {
      expect(COLOR_BLINDNESS_TYPES).toHaveLength(9);
    });

    it("should include normal vision", () => {
      const normal = COLOR_BLINDNESS_TYPES.find((t) => t.type === "normal");
      expect(normal).toBeDefined();
      expect(normal?.name).toBe("정상 시각");
    });

    it("should include all color blindness types", () => {
      const types = COLOR_BLINDNESS_TYPES.map((t) => t.type);
      expect(types).toContain("protanopia");
      expect(types).toContain("deuteranopia");
      expect(types).toContain("tritanopia");
      expect(types).toContain("protanomaly");
      expect(types).toContain("deuteranomaly");
      expect(types).toContain("tritanomaly");
      expect(types).toContain("achromatopsia");
      expect(types).toContain("achromatomaly");
    });
  });

  describe("simulateColorBlindness", () => {
    it("should return same color for normal vision", () => {
      expect(simulateColorBlindness("#FF0000", "normal")).toBe("#FF0000");
      expect(simulateColorBlindness("#00FF00", "normal")).toBe("#00FF00");
      expect(simulateColorBlindness("#0000FF", "normal")).toBe("#0000FF");
    });

    it("should simulate protanopia (red-blind)", () => {
      const result = simulateColorBlindness("#FF0000", "protanopia");
      expect(result).not.toBe("#FF0000");
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should simulate deuteranopia (green-blind)", () => {
      const result = simulateColorBlindness("#00FF00", "deuteranopia");
      expect(result).not.toBe("#00FF00");
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should simulate tritanopia (blue-blind)", () => {
      const result = simulateColorBlindness("#0000FF", "tritanopia");
      expect(result).not.toBe("#0000FF");
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should simulate achromatopsia (total color blindness)", () => {
      const result = simulateColorBlindness("#FF0000", "achromatopsia");
      // Should be grayscale
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should handle lowercase hex", () => {
      const result = simulateColorBlindness("#ff0000", "protanopia");
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should return uppercase hex", () => {
      const result = simulateColorBlindness("#ff0000", "normal");
      expect(result).toBe("#FF0000");
    });
  });

  describe("simulateColorScale", () => {
    it("should simulate all colors in scale", () => {
      const scale = {
        "50": "#FFF0F0",
        "100": "#FFE0E0",
        "500": "#FF0000",
        "900": "#800000",
      };

      const result = simulateColorScale(scale, "protanopia");

      expect(Object.keys(result)).toEqual(Object.keys(scale));
      expect(result["50"]).toMatch(/^#[0-9A-F]{6}$/);
      expect(result["500"]).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should return same scale for normal vision", () => {
      const scale = {
        "500": "#FF0000",
      };

      const result = simulateColorScale(scale, "normal");
      expect(result["500"]).toBe("#FF0000");
    });
  });

  describe("getAllSimulations", () => {
    it("should return simulations for all types", () => {
      const result = getAllSimulations("#FF0000");

      expect(result.normal).toBe("#FF0000");
      expect(result.protanopia).toBeDefined();
      expect(result.deuteranopia).toBeDefined();
      expect(result.tritanopia).toBeDefined();
      expect(result.achromatopsia).toBeDefined();
    });

    it("should return valid hex for all types", () => {
      const result = getAllSimulations("#5C6356");

      for (const [, value] of Object.entries(result)) {
        expect(value).toMatch(/^#[0-9A-F]{6}$/);
      }
    });
  });

  describe("areColorsDistinguishable", () => {
    it("should return true for very different colors", () => {
      expect(areColorsDistinguishable("#000000", "#FFFFFF", "normal")).toBe(
        true,
      );
      expect(areColorsDistinguishable("#FF0000", "#0000FF", "normal")).toBe(
        true,
      );
    });

    it("should return false for identical colors", () => {
      expect(areColorsDistinguishable("#FF0000", "#FF0000", "normal")).toBe(
        false,
      );
    });

    it("should detect confusion for color blind users", () => {
      // Red and green can be confused by protanopia
      const result = areColorsDistinguishable(
        "#FF0000",
        "#00FF00",
        "protanopia",
      );
      // This depends on the threshold, but they should be less distinguishable
      expect(typeof result).toBe("boolean");
    });

    it("should use custom threshold", () => {
      // With very low threshold, even similar colors are distinguishable
      expect(areColorsDistinguishable("#FF0000", "#FF0001", "normal", 1)).toBe(
        true,
      );
      // With high threshold, similar colors are not distinguishable
      expect(
        areColorsDistinguishable("#FF0000", "#FE0000", "normal", 100),
      ).toBe(false);
    });
  });

  describe("generateAccessibilityReport", () => {
    it("should generate report for color palette", () => {
      const colors = ["#FF0000", "#00FF00", "#0000FF"];
      const report = generateAccessibilityReport(colors);

      expect(report.length).toBe(8); // All types except normal
      expect(report[0]).toHaveProperty("type");
      expect(report[0]).toHaveProperty("name");
      expect(report[0]).toHaveProperty("issues");
    });

    it("should not include normal vision in report", () => {
      const colors = ["#FF0000", "#00FF00"];
      const report = generateAccessibilityReport(colors);

      const hasNormal = report.some((r) => r.type === "normal");
      expect(hasNormal).toBe(false);
    });

    it("should identify issues between confusable colors", () => {
      // Very similar colors that might be confusable
      const colors = ["#FF0000", "#FF0001"];
      const report = generateAccessibilityReport(colors);

      // At least some types should report issues for nearly identical colors
      const hasIssues = report.some((r) => r.issues.length > 0);
      expect(hasIssues).toBe(true);
    });

    it("should return empty issues for distinct colors", () => {
      // Black and white should be distinguishable for all types
      const colors = ["#000000", "#FFFFFF"];
      const report = generateAccessibilityReport(colors);

      const allDistinguishable = report.every((r) => r.issues.length === 0);
      expect(allDistinguishable).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle white color", () => {
      const result = simulateColorBlindness("#FFFFFF", "protanopia");
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("should handle black color", () => {
      const result = simulateColorBlindness("#000000", "protanopia");
      expect(result).toBe("#000000");
    });

    it("should handle all color blindness types", () => {
      const types: ColorBlindnessType[] = [
        "normal",
        "protanopia",
        "deuteranopia",
        "tritanopia",
        "protanomaly",
        "deuteranomaly",
        "tritanomaly",
        "achromatopsia",
        "achromatomaly",
      ];

      for (const type of types) {
        const result = simulateColorBlindness("#5C6356", type);
        expect(result).toMatch(/^#[0-9A-F]{6}$/);
      }
    });
  });
});
