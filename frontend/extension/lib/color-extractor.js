/**
 * Color Extractor Module
 * Extracts dominant colors from images using K-means clustering
 */

import { rgbToHex, rgbToHsl, getBrightness, colorToFormats } from './color-utils.js';

/**
 * Extracts dominant colors from an image
 * @param {string|HTMLImageElement|HTMLCanvasElement} imageSource - Image URL, Image element, or Canvas element
 * @param {Object} options - Extraction options
 * @param {number} options.colorCount - Number of colors to extract (default: 6)
 * @param {number} options.quality - Sampling quality, 1-10 (default: 5)
 * @param {number} options.maxIterations - K-means max iterations (default: 20)
 * @param {boolean} options.excludeWhite - Exclude white colors (default: true)
 * @param {boolean} options.excludeBlack - Exclude black colors (default: true)
 * @returns {Promise<Array<Object>>} Array of color objects with various formats
 */
export async function extractColors(imageSource, options = {}) {
  const {
    colorCount = 6,
    quality = 5,
    maxIterations = 20,
    excludeWhite = true,
    excludeBlack = true
  } = options;

  // Validate color count
  const validatedColorCount = Math.max(5, Math.min(8, colorCount));

  // Load image and get pixels
  const pixels = await getImagePixels(imageSource, quality);

  if (pixels.length === 0) {
    throw new Error('No valid pixels found in image');
  }

  // Filter pixels if needed
  const filteredPixels = filterPixels(pixels, { excludeWhite, excludeBlack });

  // Perform K-means clustering
  const clusters = kMeansClustering(filteredPixels, validatedColorCount, maxIterations);

  // Sort by cluster size (most dominant first)
  clusters.sort((a, b) => b.count - a.count);

  // Convert to color objects with multiple formats
  return clusters.map((cluster, index) => ({
    ...colorToFormats(cluster.r, cluster.g, cluster.b),
    population: cluster.count,
    percentage: Math.round((cluster.count / filteredPixels.length) * 100),
    index: index
  }));
}

/**
 * Loads image and extracts pixel data
 * @param {string|HTMLImageElement|HTMLCanvasElement} imageSource - Image source
 * @param {number} quality - Sampling quality (1 = every pixel, 10 = every 10th pixel)
 * @returns {Promise<Array<Array<number>>>} Array of RGB pixel arrays
 */
async function getImagePixels(imageSource, quality = 5) {
  let canvas, ctx, imageElement;

  // Handle different input types
  if (typeof imageSource === 'string') {
    // Load image from URL
    imageElement = await loadImage(imageSource);
  } else if (imageSource instanceof HTMLImageElement) {
    imageElement = imageSource;
  } else if (imageSource instanceof HTMLCanvasElement) {
    canvas = imageSource;
  } else {
    throw new Error('Invalid image source type');
  }

  // Create canvas if needed
  if (!canvas) {
    canvas = document.createElement('canvas');
    const maxDimension = 400; // Limit size for performance
    let width = imageElement.naturalWidth || imageElement.width;
    let height = imageElement.naturalHeight || imageElement.height;

    // Scale down if too large
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, width, height);
  } else {
    ctx = canvas.getContext('2d');
  }

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];
  const step = Math.max(1, Math.floor(quality));

  // Sample pixels
  for (let i = 0; i < imageData.data.length; i += 4 * step) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];

    // Skip transparent pixels
    if (a < 125) continue;

    pixels.push([r, g, b]);
  }

  return pixels;
}

/**
 * Loads an image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Filters pixels based on criteria
 * @param {Array<Array<number>>} pixels - Array of RGB pixels
 * @param {Object} options - Filter options
 * @returns {Array<Array<number>>} Filtered pixels
 */
function filterPixels(pixels, options = {}) {
  const { excludeWhite = true, excludeBlack = true } = options;

  return pixels.filter(([r, g, b]) => {
    // Exclude white colors
    if (excludeWhite && r > 240 && g > 240 && b > 240) {
      return false;
    }

    // Exclude black colors
    if (excludeBlack && r < 15 && g < 15 && b < 15) {
      return false;
    }

    // Exclude very low saturation (grayscale)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (saturation < 0.1 && min > 200) {
      return false; // Very light gray
    }

    return true;
  });
}

/**
 * Performs K-means clustering on pixels
 * @param {Array<Array<number>>} pixels - Array of RGB pixels
 * @param {number} k - Number of clusters
 * @param {number} maxIterations - Maximum iterations
 * @returns {Array<Object>} Array of cluster centroids with counts
 */
function kMeansClustering(pixels, k, maxIterations = 20) {
  if (pixels.length === 0) {
    return [];
  }

  if (pixels.length < k) {
    k = pixels.length;
  }

  // Initialize centroids using K-means++
  let centroids = initializeCentroidsKMeansPlusPlus(pixels, k);
  let assignments = new Array(pixels.length);
  let iteration = 0;
  let hasChanged = true;

  while (hasChanged && iteration < maxIterations) {
    hasChanged = false;
    iteration++;

    // Assignment step: assign each pixel to nearest centroid
    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      let minDistance = Infinity;
      let closestCentroid = 0;

      for (let j = 0; j < centroids.length; j++) {
        const distance = colorDistance(pixel, centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }

      if (assignments[i] !== closestCentroid) {
        hasChanged = true;
        assignments[i] = closestCentroid;
      }
    }

    // Update step: recalculate centroids
    const newCentroids = new Array(k);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < k; i++) {
      newCentroids[i] = [0, 0, 0];
    }

    for (let i = 0; i < pixels.length; i++) {
      const cluster = assignments[i];
      const pixel = pixels[i];
      newCentroids[cluster][0] += pixel[0];
      newCentroids[cluster][1] += pixel[1];
      newCentroids[cluster][2] += pixel[2];
      counts[cluster]++;
    }

    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        newCentroids[i][0] = Math.round(newCentroids[i][0] / counts[i]);
        newCentroids[i][1] = Math.round(newCentroids[i][1] / counts[i]);
        newCentroids[i][2] = Math.round(newCentroids[i][2] / counts[i]);
      } else {
        // If cluster is empty, reinitialize with a random pixel
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        newCentroids[i] = [...randomPixel];
      }
    }

    centroids = newCentroids;
  }

  // Count pixels in each cluster
  const counts = new Array(k).fill(0);
  for (let i = 0; i < assignments.length; i++) {
    counts[assignments[i]]++;
  }

  // Return centroids with counts
  return centroids
    .map((centroid, i) => ({
      r: centroid[0],
      g: centroid[1],
      b: centroid[2],
      count: counts[i]
    }))
    .filter(cluster => cluster.count > 0);
}

/**
 * Initializes centroids using K-means++ algorithm
 * @param {Array<Array<number>>} pixels - Array of RGB pixels
 * @param {number} k - Number of centroids
 * @returns {Array<Array<number>>} Initial centroids
 */
function initializeCentroidsKMeansPlusPlus(pixels, k) {
  const centroids = [];

  // Choose first centroid randomly
  const firstIndex = Math.floor(Math.random() * pixels.length);
  centroids.push([...pixels[firstIndex]]);

  // Choose remaining centroids
  for (let i = 1; i < k; i++) {
    const distances = pixels.map(pixel => {
      // Find minimum distance to existing centroids
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = colorDistance(pixel, centroid);
        minDist = Math.min(minDist, dist);
      }
      return minDist;
    });

    // Choose next centroid with probability proportional to distance squared
    const totalDistance = distances.reduce((sum, d) => sum + d * d, 0);
    let random = Math.random() * totalDistance;

    for (let j = 0; j < pixels.length; j++) {
      random -= distances[j] * distances[j];
      if (random <= 0) {
        centroids.push([...pixels[j]]);
        break;
      }
    }
  }

  return centroids;
}

/**
 * Calculates Euclidean distance between two colors in RGB space
 * @param {Array<number>} color1 - First RGB color
 * @param {Array<number>} color2 - Second RGB color
 * @returns {number} Distance value
 */
function colorDistance(color1, color2) {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];

  // Weighted Euclidean distance (accounts for human perception)
  return Math.sqrt(
    2 * rDiff * rDiff +
    4 * gDiff * gDiff +
    3 * bDiff * bDiff
  );
}

/**
 * Extracts colors from a canvas element directly
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Extraction options
 * @returns {Promise<Array<Object>>} Array of color objects
 */
export function extractColorsFromCanvas(canvas, options = {}) {
  return extractColors(canvas, options);
}

/**
 * Extracts colors from an image URL
 * @param {string} imageUrl - Image URL
 * @param {Object} options - Extraction options
 * @returns {Promise<Array<Object>>} Array of color objects
 */
export function extractColorsFromUrl(imageUrl, options = {}) {
  return extractColors(imageUrl, options);
}

/**
 * Extracts colors from an image element
 * @param {HTMLImageElement} imageElement - Image element
 * @param {Object} options - Extraction options
 * @returns {Promise<Array<Object>>} Array of color objects
 */
export function extractColorsFromImage(imageElement, options = {}) {
  return extractColors(imageElement, options);
}

export default {
  extractColors,
  extractColorsFromCanvas,
  extractColorsFromUrl,
  extractColorsFromImage
};
