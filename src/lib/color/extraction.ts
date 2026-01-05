/**
 * 이미지 색상 추출 유틸리티
 * K-Means 클러스터링을 통한 우세 색상 추출
 */

import { hexToHct, rgbToHex, type HctColor, type RgbColor } from "./hct";

/**
 * 추출된 색상 정보
 */
export interface ExtractedColor {
  hex: string;
  rgb: RgbColor;
  hct: HctColor;
  percentage: number; // 이미지 내 점유율 (0-100)
  name?: string; // 색상 이름 (선택)
}

/**
 * 이미지 데이터에서 픽셀 배열 추출
 * @param imageData - 이미지 데이터 객체
 * @param maxPixels - 최대 샘플링할 픽셀 수 (선택, 성능 최적화용)
 */
export function getPixelsFromImageData(
  imageData: ImageData,
  maxPixels?: number,
): RgbColor[] {
  const pixels: RgbColor[] = [];
  const data = imageData.data;
  const totalPixels = data.length / 4;

  // 샘플링 간격 계산 (maxPixels가 지정된 경우)
  const step =
    maxPixels && maxPixels < totalPixels
      ? Math.ceil(totalPixels / maxPixels)
      : 1;

  for (let i = 0; i < data.length; i += 4 * step) {
    // 투명한 픽셀 건너뛰기
    if (data[i + 3] < 128) continue;

    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });

    // maxPixels 제한 확인
    if (maxPixels && pixels.length >= maxPixels) break;
  }

  return pixels;
}

/**
 * K-Means 클러스터링으로 우세 색상 추출
 */
export function kMeansClustering(
  pixels: RgbColor[],
  k: number = 6,
  maxIterations: number = 20,
): ExtractedColor[] {
  if (pixels.length === 0) return [];
  if (pixels.length < k) k = pixels.length;

  // 초기 중심점 선택 (K-Means++ 방식)
  let centroids = initializeCentroids(pixels, k);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // 각 픽셀을 가장 가까운 중심점에 할당
    const clusters: RgbColor[][] = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      const nearestIndex = findNearestCentroid(pixel, centroids);
      clusters[nearestIndex].push(pixel);
    }

    // 새로운 중심점 계산
    const newCentroids: RgbColor[] = [];
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        newCentroids.push(calculateCentroid(clusters[i]));
      } else {
        newCentroids.push(centroids[i]);
      }
    }

    // 수렴 확인
    if (hasConverged(centroids, newCentroids)) {
      centroids = newCentroids;
      break;
    }

    centroids = newCentroids;
  }

  // 결과 생성
  const totalPixels = pixels.length;
  const clusters: RgbColor[][] = Array.from({ length: k }, () => []);

  for (const pixel of pixels) {
    const nearestIndex = findNearestCentroid(pixel, centroids);
    clusters[nearestIndex].push(pixel);
  }

  return centroids
    .map((centroid, index) => {
      const hex = rgbToHex(centroid);
      return {
        hex,
        rgb: centroid,
        hct: hexToHct(hex),
        percentage: (clusters[index].length / totalPixels) * 100,
      };
    })
    .filter((color) => color.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * K-Means++ 초기화
 */
function initializeCentroids(pixels: RgbColor[], k: number): RgbColor[] {
  const centroids: RgbColor[] = [];

  // 첫 번째 중심점은 랜덤
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  // 나머지 중심점은 거리 기반 확률로 선택
  for (let i = 1; i < k; i++) {
    const distances = pixels.map((pixel) => {
      const minDist = Math.min(
        ...centroids.map((c) => colorDistance(pixel, c)),
      );
      return minDist * minDist;
    });

    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;

    for (let j = 0; j < pixels.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        centroids.push(pixels[j]);
        break;
      }
    }
  }

  return centroids;
}

/**
 * RGB 색상 거리 계산 (유클리드)
 */
function colorDistance(c1: RgbColor, c2: RgbColor): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2),
  );
}

/**
 * 가장 가까운 중심점 인덱스 찾기
 */
function findNearestCentroid(pixel: RgbColor, centroids: RgbColor[]): number {
  let minDist = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < centroids.length; i++) {
    const dist = colorDistance(pixel, centroids[i]);
    if (dist < minDist) {
      minDist = dist;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

/**
 * 클러스터의 중심점 계산
 */
function calculateCentroid(cluster: RgbColor[]): RgbColor {
  const sum = cluster.reduce(
    (acc, pixel) => ({
      r: acc.r + pixel.r,
      g: acc.g + pixel.g,
      b: acc.b + pixel.b,
    }),
    { r: 0, g: 0, b: 0 },
  );

  return {
    r: Math.round(sum.r / cluster.length),
    g: Math.round(sum.g / cluster.length),
    b: Math.round(sum.b / cluster.length),
  };
}

/**
 * 중심점 수렴 확인
 */
function hasConverged(
  oldCentroids: RgbColor[],
  newCentroids: RgbColor[],
  threshold: number = 1,
): boolean {
  for (let i = 0; i < oldCentroids.length; i++) {
    if (colorDistance(oldCentroids[i], newCentroids[i]) > threshold) {
      return false;
    }
  }
  return true;
}

/**
 * Canvas에서 이미지 데이터 추출
 */
export async function extractColorsFromImage(
  imageSource: string | File,
  options: {
    sampleSize?: number; // 샘플링 크기 (성능 최적화)
    colorCount?: number; // 추출할 색상 수
  } = {},
): Promise<ExtractedColor[]> {
  const { sampleSize = 200, colorCount = 6 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    // blob: URL에는 crossOrigin 설정하지 않음
    const isDataOrBlob =
      typeof imageSource === "string" &&
      (imageSource.startsWith("blob:") || imageSource.startsWith("data:"));
    if (!isDataOrBlob && typeof imageSource === "string") {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // 성능을 위해 이미지 리사이징
      const scale = Math.min(
        sampleSize / img.width,
        sampleSize / img.height,
        1,
      );
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = getPixelsFromImageData(imageData);
      const colors = kMeansClustering(pixels, colorCount);

      resolve(colors);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

/**
 * 추출된 색상 중 Primary 후보 선택
 * (채도가 높고 점유율이 높은 색상)
 */
export function selectPrimaryColor(
  colors: ExtractedColor[],
): ExtractedColor | null {
  if (colors.length === 0) return null;

  // 채도(Chroma)와 점유율을 고려한 점수 계산
  const scored = colors.map((color) => ({
    color,
    score: color.hct.c * 0.7 + color.percentage * 0.3,
  }));

  // 가장 높은 점수의 색상 반환
  scored.sort((a, b) => b.score - a.score);
  return scored[0].color;
}

/**
 * 추출된 색상 필터링 (너무 어둡거나 밝은 색상 제외)
 */
export function filterExtractedColors(
  colors: ExtractedColor[],
  options: {
    minTone?: number;
    maxTone?: number;
    minChroma?: number;
  } = {},
): ExtractedColor[] {
  const { minTone = 10, maxTone = 90, minChroma = 10 } = options;

  return colors.filter(
    (color) =>
      color.hct.t >= minTone &&
      color.hct.t <= maxTone &&
      color.hct.c >= minChroma,
  );
}
