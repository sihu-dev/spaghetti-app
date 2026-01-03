/**
 * HCT 색공간 유틸리티 테스트
 */

import { describe, it, expect } from "vitest";
import {
  hexToHct,
  hctToHex,
  hexToRgb,
  rgbToHex,
  rgbToHct,
  normalizeHex,
  adjustTone,
  adjustChroma,
  isValidHex,
  getLuminance,
  isLightColor,
} from "./hct";

describe("HCT Utilities", () => {
  describe("normalizeHex", () => {
    it("should normalize 3-digit hex to 6-digit", () => {
      expect(normalizeHex("#FFF")).toBe("#FFFFFF");
      expect(normalizeHex("ABC")).toBe("#AABBCC");
    });

    it("should normalize 6-digit hex", () => {
      expect(normalizeHex("#5C6356")).toBe("#5C6356");
      expect(normalizeHex("5c6356")).toBe("#5C6356");
    });

    it("should throw error for invalid hex", () => {
      expect(() => normalizeHex("")).toThrow();
      expect(() => normalizeHex("GGG")).toThrow();
      expect(() => normalizeHex("#12345")).toThrow();
    });
  });

  describe("hexToHct", () => {
    it("should convert hex to HCT", () => {
      const result = hexToHct("#5C6356");
      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.h).toBeLessThanOrEqual(360);
      expect(result.c).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeLessThanOrEqual(100);
    });

    it("should handle white color", () => {
      const result = hexToHct("#FFFFFF");
      expect(result.t).toBeCloseTo(100, 0);
    });

    it("should handle black color", () => {
      const result = hexToHct("#000000");
      expect(result.t).toBeCloseTo(0, 0);
    });
  });

  describe("hctToHex", () => {
    it("should convert HCT back to hex", () => {
      const original = hexToHct("#5C6356");
      const result = hctToHex(original);
      // 변환 후 다시 HCT로 변환하면 비슷한 값이어야 함
      const converted = hexToHct(result);
      expect(converted.h).toBeCloseTo(original.h, 0);
      expect(converted.c).toBeCloseTo(original.c, 0);
      expect(converted.t).toBeCloseTo(original.t, 0);
    });
  });

  describe("hexToRgb", () => {
    it("should convert hex to RGB", () => {
      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
    });

    it("should handle olive color", () => {
      const result = hexToRgb("#5C6356");
      expect(result.r).toBe(92);
      expect(result.g).toBe(99);
      expect(result.b).toBe(86);
    });
  });

  describe("rgbToHex", () => {
    it("should convert RGB to hex", () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 }).toUpperCase()).toBe("#FF0000");
      expect(rgbToHex({ r: 92, g: 99, b: 86 }).toUpperCase()).toBe("#5C6356");
    });
  });

  describe("rgbToHct", () => {
    it("should convert RGB to HCT", () => {
      const result = rgbToHct({ r: 92, g: 99, b: 86 });
      expect(result.h).toBeGreaterThanOrEqual(0);
      expect(result.c).toBeGreaterThanOrEqual(0);
      expect(result.t).toBeGreaterThanOrEqual(0);
    });
  });

  describe("adjustTone", () => {
    it("should adjust tone to target value", () => {
      const result = adjustTone("#5C6356", 70);
      const hct = hexToHct(result);
      expect(hct.t).toBeCloseTo(70, 0);
    });

    it("should clamp tone to 0-100", () => {
      const result = adjustTone("#5C6356", 150);
      const hct = hexToHct(result);
      expect(hct.t).toBeLessThanOrEqual(100);
    });
  });

  describe("adjustChroma", () => {
    it("should adjust chroma to target value", () => {
      const result = adjustChroma("#5C6356", 30);
      const hct = hexToHct(result);
      expect(hct.c).toBeCloseTo(30, 0);
    });
  });

  describe("isValidHex", () => {
    it("should validate correct hex colors", () => {
      expect(isValidHex("#5C6356")).toBe(true);
      expect(isValidHex("#FFF")).toBe(true);
      expect(isValidHex("5C6356")).toBe(true);
    });

    it("should reject invalid hex colors", () => {
      expect(isValidHex("")).toBe(false);
      expect(isValidHex("#GGG")).toBe(false);
      expect(isValidHex("#12345")).toBe(false);
      expect(isValidHex(null as unknown as string)).toBe(false);
    });
  });

  describe("getLuminance", () => {
    it("should return high luminance for white", () => {
      expect(getLuminance("#FFFFFF")).toBeCloseTo(1, 1);
    });

    it("should return low luminance for black", () => {
      expect(getLuminance("#000000")).toBeCloseTo(0, 1);
    });
  });

  describe("isLightColor", () => {
    it("should identify light colors", () => {
      expect(isLightColor("#FFFFFF")).toBe(true);
      expect(isLightColor("#F5F5F5")).toBe(true);
    });

    it("should identify dark colors", () => {
      expect(isLightColor("#000000")).toBe(false);
      expect(isLightColor("#1A1A1A")).toBe(false);
    });
  });
});
