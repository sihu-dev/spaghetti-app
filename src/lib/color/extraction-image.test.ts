/**
 * 실제 이미지 데이터로 Color Extraction 테스트
 */

import { describe, it, expect } from "vitest";
import { getPixelsFromImageData, kMeansClustering } from "./extraction";

describe("Color Extraction with ImageData", () => {
  it("should extract colors from simulated ImageData", () => {
    // 10x10 빨간색 이미지 시뮬레이션
    const width = 10;
    const height = 10;
    const imageData = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      imageData[i * 4] = 200; // R
      imageData[i * 4 + 1] = 50; // G
      imageData[i * 4 + 2] = 50; // B
      imageData[i * 4 + 3] = 255; // A
    }

    const mockImageData = {
      data: imageData,
      width,
      height,
    } as ImageData;

    const pixels = getPixelsFromImageData(mockImageData, 100);
    expect(pixels.length).toBeLessThanOrEqual(100);
    expect(pixels[0].r).toBe(200);
    expect(pixels[0].g).toBe(50);
    expect(pixels[0].b).toBe(50);
  });

  it("should extract dominant color from multi-color ImageData", () => {
    // 20x20 이미지: 상단 10줄 초록색, 하단 10줄 파란색
    const width = 20;
    const height = 20;
    const imageData = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (y < 10) {
          // 초록색
          imageData[i] = 50;
          imageData[i + 1] = 180;
          imageData[i + 2] = 50;
        } else {
          // 파란색
          imageData[i] = 50;
          imageData[i + 1] = 50;
          imageData[i + 2] = 180;
        }
        imageData[i + 3] = 255;
      }
    }

    const mockImageData = {
      data: imageData,
      width,
      height,
    } as ImageData;

    const pixels = getPixelsFromImageData(mockImageData, 400);
    const colors = kMeansClustering(pixels, 2);

    expect(colors.length).toBe(2);

    // 두 색상 모두 약 50% 비율
    colors.forEach((color) => {
      expect(color.percentage).toBeGreaterThan(40);
      expect(color.percentage).toBeLessThan(60);
    });

    // HCT 값 확인
    colors.forEach((color) => {
      expect(color.hct.h).toBeGreaterThanOrEqual(0);
      expect(color.hct.c).toBeGreaterThan(0); // 채도가 있어야 함
    });
  });
});
