/**
 * Export Utilities Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateCssVariables,
  generateTailwindConfig,
  generateJsonTokens,
  type ExportData,
} from "./index";

describe("Export Utilities", () => {
  const mockExportData: ExportData = {
    primaryColor: "#5C6356",
    colorRamp: {
      50: "#f6f7f5",
      100: "#e8eae5",
      200: "#d1d5cc",
      300: "#b3baa8",
      400: "#939c84",
      500: "#5C6356",
      600: "#4a5045",
      700: "#3d4239",
      800: "#33372f",
      900: "#2b2e27",
      950: "#171915",
    },
    extractedColors: [
      {
        hex: "#5C6356",
        rgb: { r: 92, g: 99, b: 86 },
        hct: { h: 100, c: 10, t: 40 },
        percentage: 30,
      },
      {
        hex: "#9D7B5B",
        rgb: { r: 157, g: 123, b: 91 },
        hct: { h: 40, c: 25, t: 55 },
        percentage: 20,
      },
    ],
    projectName: "Test Design System",
  };

  describe("generateCssVariables", () => {
    it("should generate valid CSS with :root selector", () => {
      const css = generateCssVariables(mockExportData);

      expect(css).toContain(":root {");
      expect(css).toContain("}");
    });

    it("should include primary color", () => {
      const css = generateCssVariables(mockExportData);

      expect(css).toContain("--color-primary: #5C6356");
    });

    it("should include color ramp variables", () => {
      const css = generateCssVariables(mockExportData);

      expect(css).toContain("--color-primary-50:");
      expect(css).toContain("--color-primary-500:");
      expect(css).toContain("--color-primary-900:");
      expect(css).toContain("--color-primary-950:");
    });

    it("should include extracted colors", () => {
      const css = generateCssVariables(mockExportData);

      expect(css).toContain("--color-extracted-1:");
      expect(css).toContain("--color-extracted-2:");
    });

    it("should handle empty extracted colors", () => {
      const dataWithNoExtracted = { ...mockExportData, extractedColors: [] };
      const css = generateCssVariables(dataWithNoExtracted);

      expect(css).not.toContain("--color-extracted-");
    });
  });

  describe("generateTailwindConfig", () => {
    it("should generate valid JavaScript module", () => {
      const config = generateTailwindConfig(mockExportData);

      expect(config).toContain("module.exports");
      expect(config).toContain("@type {import('tailwindcss').Config}");
    });

    it("should include primary color scale", () => {
      const config = generateTailwindConfig(mockExportData);

      expect(config).toContain('"primary"');
      expect(config).toContain('"500"');
      expect(config).toContain("#5C6356");
    });

    it("should include DEFAULT for primary", () => {
      const config = generateTailwindConfig(mockExportData);

      expect(config).toContain('"DEFAULT"');
    });

    it("should include extracted colors", () => {
      const config = generateTailwindConfig(mockExportData);

      expect(config).toContain('"extracted"');
    });

    it("should extend theme", () => {
      const config = generateTailwindConfig(mockExportData);

      expect(config).toContain('"extend"');
      expect(config).toContain('"colors"');
    });
  });

  describe("generateJsonTokens", () => {
    it("should generate valid JSON", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed).toBeDefined();
    });

    it("should include schema reference", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.$schema).toBeDefined();
    });

    it("should include version and project name", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe("1.0.0");
      expect(parsed.project).toBe("Test Design System");
    });

    it("should include primary color with type", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.colors.primary.value).toBe("#5C6356");
      expect(parsed.colors.primary.type).toBe("color");
    });

    it("should include primary scale", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.colors.primaryScale).toBeDefined();
      expect(parsed.colors.primaryScale["500"].value).toBe("#5C6356");
    });

    it("should include extracted colors with HCT values", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.colors.extracted).toHaveLength(2);
      expect(parsed.colors.extracted[0].hct).toBeDefined();
      expect(parsed.colors.extracted[0].percentage).toBeDefined();
    });

    it("should include metadata with generator", () => {
      const json = generateJsonTokens(mockExportData);
      const parsed = JSON.parse(json);

      expect(parsed.metadata.generator).toBe("Spaghetti AI");
      expect(parsed.metadata.generatedAt).toBeDefined();
    });

    it("should use default project name when not provided", () => {
      const dataWithoutName = { ...mockExportData, projectName: undefined };
      const json = generateJsonTokens(dataWithoutName);
      const parsed = JSON.parse(json);

      expect(parsed.project).toBe("Spaghetti Design System");
    });
  });
});
