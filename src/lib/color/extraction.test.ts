/**
 * Color Extraction 테스트
 * K-Means 클러스터링 및 HCT 변환 검증
 */

import { describe, it, expect } from 'vitest';
import {
  kMeansClustering,
  selectPrimaryColor,
  filterExtractedColors,
  type ExtractedColor
} from './extraction';

describe('Color Extraction', () => {
  describe('kMeansClustering', () => {
    it('should return empty array for empty pixels', () => {
      const result = kMeansClustering([], 6);
      expect(result).toEqual([]);
    });

    it('should cluster similar colors together', () => {
      // 빨간색 계열 픽셀들
      const redPixels = Array(100).fill({ r: 255, g: 0, b: 0 });
      // 파란색 계열 픽셀들
      const bluePixels = Array(100).fill({ r: 0, g: 0, b: 255 });

      const pixels = [...redPixels, ...bluePixels];
      const result = kMeansClustering(pixels, 2);

      expect(result.length).toBe(2);
      expect(result[0].percentage).toBeCloseTo(50, 0);
      expect(result[1].percentage).toBeCloseTo(50, 0);
    });

    it('should extract correct hex colors', () => {
      const pixels = Array(100).fill({ r: 92, g: 99, b: 86 }); // Olive color
      const result = kMeansClustering(pixels, 1);

      expect(result.length).toBe(1);
      expect(result[0].hex.toUpperCase()).toBe('#5C6356');
    });

    it('should include HCT color values', () => {
      const pixels = Array(100).fill({ r: 92, g: 99, b: 86 });
      const result = kMeansClustering(pixels, 1);

      expect(result[0].hct).toBeDefined();
      expect(result[0].hct.h).toBeGreaterThanOrEqual(0);
      expect(result[0].hct.h).toBeLessThanOrEqual(360);
      expect(result[0].hct.c).toBeGreaterThanOrEqual(0);
      expect(result[0].hct.t).toBeGreaterThanOrEqual(0);
      expect(result[0].hct.t).toBeLessThanOrEqual(100);
    });
  });

  describe('selectPrimaryColor', () => {
    it('should return null for empty array', () => {
      const result = selectPrimaryColor([]);
      expect(result).toBeNull();
    });

    it('should prioritize high chroma colors', () => {
      const colors: ExtractedColor[] = [
        { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, hct: { h: 0, c: 0, t: 50 }, percentage: 50 },
        { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, hct: { h: 27, c: 113, t: 53 }, percentage: 30 },
      ];

      const result = selectPrimaryColor(colors);
      expect(result?.hex).toBe('#FF0000');
    });
  });

  describe('filterExtractedColors', () => {
    it('should filter out too dark colors', () => {
      const colors: ExtractedColor[] = [
        { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hct: { h: 0, c: 0, t: 0 }, percentage: 50 },
        { hex: '#5C6356', rgb: { r: 92, g: 99, b: 86 }, hct: { h: 120, c: 10, t: 40 }, percentage: 50 },
      ];

      const result = filterExtractedColors(colors, { minTone: 10 });
      expect(result.length).toBe(1);
      expect(result[0].hex).toBe('#5C6356');
    });

    it('should filter out too bright colors', () => {
      const colors: ExtractedColor[] = [
        { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hct: { h: 0, c: 0, t: 100 }, percentage: 50 },
        { hex: '#5C6356', rgb: { r: 92, g: 99, b: 86 }, hct: { h: 120, c: 10, t: 40 }, percentage: 50 },
      ];

      const result = filterExtractedColors(colors, { maxTone: 90 });
      expect(result.length).toBe(1);
      expect(result[0].hex).toBe('#5C6356');
    });

    it('should filter out low chroma colors', () => {
      const colors: ExtractedColor[] = [
        { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, hct: { h: 0, c: 0, t: 50 }, percentage: 50 },
        { hex: '#5C6356', rgb: { r: 92, g: 99, b: 86 }, hct: { h: 120, c: 15, t: 40 }, percentage: 50 },
      ];

      const result = filterExtractedColors(colors, { minChroma: 10 });
      expect(result.length).toBe(1);
      expect(result[0].hex).toBe('#5C6356');
    });
  });
});
