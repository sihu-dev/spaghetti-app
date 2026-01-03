/**
 * Color Blindness Simulation
 * Simulates how colors appear to people with different types of color vision deficiency
 */

/**
 * Color blindness types
 */
export type ColorBlindnessType =
  | "normal"
  | "protanopia"     // Red-blind
  | "deuteranopia"   // Green-blind
  | "tritanopia"     // Blue-blind
  | "protanomaly"    // Red-weak
  | "deuteranomaly"  // Green-weak
  | "tritanomaly"    // Blue-weak
  | "achromatopsia"  // Total color blindness
  | "achromatomaly"; // Partial color blindness

export interface ColorBlindnessInfo {
  type: ColorBlindnessType;
  name: string;
  description: string;
  prevalence: string;
}

export const COLOR_BLINDNESS_TYPES: ColorBlindnessInfo[] = [
  {
    type: "normal",
    name: "정상 시각",
    description: "정상적인 색각",
    prevalence: "~92%",
  },
  {
    type: "protanopia",
    name: "적색맹 (Protanopia)",
    description: "빨간색을 인식하지 못함",
    prevalence: "~1.3%",
  },
  {
    type: "deuteranopia",
    name: "녹색맹 (Deuteranopia)",
    description: "녹색을 인식하지 못함",
    prevalence: "~1.2%",
  },
  {
    type: "tritanopia",
    name: "청색맹 (Tritanopia)",
    description: "파란색을 인식하지 못함",
    prevalence: "~0.001%",
  },
  {
    type: "protanomaly",
    name: "적색약 (Protanomaly)",
    description: "빨간색 인식 약화",
    prevalence: "~1.3%",
  },
  {
    type: "deuteranomaly",
    name: "녹색약 (Deuteranomaly)",
    description: "녹색 인식 약화 (가장 흔함)",
    prevalence: "~5%",
  },
  {
    type: "tritanomaly",
    name: "청색약 (Tritanomaly)",
    description: "파란색 인식 약화",
    prevalence: "~0.0001%",
  },
  {
    type: "achromatopsia",
    name: "전색맹 (Achromatopsia)",
    description: "모든 색을 회색조로 인식",
    prevalence: "~0.003%",
  },
  {
    type: "achromatomaly",
    name: "부분색맹 (Achromatomaly)",
    description: "색 인식이 매우 약함",
    prevalence: "~0.001%",
  },
];

// Transformation matrices for color blindness simulation
// Based on: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
const SIMULATION_MATRICES: Record<ColorBlindnessType, number[][]> = {
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875],
  ],
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858],
  ],
  tritanomaly: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
  achromatomaly: [
    [0.618, 0.320, 0.062],
    [0.163, 0.775, 0.062],
    [0.163, 0.320, 0.516],
  ],
};

/**
 * Parse HEX color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  };
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Apply color blindness simulation matrix
 */
function applyMatrix(
  r: number,
  g: number,
  b: number,
  matrix: number[][]
): { r: number; g: number; b: number } {
  return {
    r: r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2],
    g: r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2],
    b: r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2],
  };
}

/**
 * Simulate how a color appears to someone with color blindness
 * @param hex - HEX color string (e.g., "#FF0000")
 * @param type - Color blindness type
 * @returns Simulated HEX color
 */
export function simulateColorBlindness(
  hex: string,
  type: ColorBlindnessType
): string {
  if (type === "normal") return hex.toUpperCase();

  const rgb = hexToRgb(hex);
  const matrix = SIMULATION_MATRICES[type];
  const simulated = applyMatrix(rgb.r, rgb.g, rgb.b, matrix);

  return rgbToHex(simulated.r, simulated.g, simulated.b);
}

/**
 * Simulate color blindness for a full color scale
 */
export function simulateColorScale(
  scale: Record<string, string>,
  type: ColorBlindnessType
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(scale)) {
    result[key] = simulateColorBlindness(value, type);
  }
  return result;
}

/**
 * Get all simulations for a single color
 */
export function getAllSimulations(hex: string): Record<ColorBlindnessType, string> {
  const result: Record<string, string> = {};
  for (const type of Object.keys(SIMULATION_MATRICES) as ColorBlindnessType[]) {
    result[type] = simulateColorBlindness(hex, type);
  }
  return result as Record<ColorBlindnessType, string>;
}

/**
 * Check if two colors are distinguishable for a given color blindness type
 * Uses a simple Euclidean distance in RGB space
 */
export function areColorsDistinguishable(
  hex1: string,
  hex2: string,
  type: ColorBlindnessType,
  threshold = 30
): boolean {
  const sim1 = simulateColorBlindness(hex1, type);
  const sim2 = simulateColorBlindness(hex2, type);

  const rgb1 = hexToRgb(sim1);
  const rgb2 = hexToRgb(sim2);

  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  return distance >= threshold;
}

/**
 * Generate a color blindness safe palette report
 */
export function generateAccessibilityReport(
  colors: string[]
): {
  type: ColorBlindnessType;
  name: string;
  issues: { color1: string; color2: string }[];
}[] {
  const reports: {
    type: ColorBlindnessType;
    name: string;
    issues: { color1: string; color2: string }[];
  }[] = [];

  for (const info of COLOR_BLINDNESS_TYPES) {
    if (info.type === "normal") continue;

    const issues: { color1: string; color2: string }[] = [];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        if (!areColorsDistinguishable(colors[i], colors[j], info.type)) {
          issues.push({ color1: colors[i], color2: colors[j] });
        }
      }
    }

    reports.push({
      type: info.type,
      name: info.name,
      issues,
    });
  }

  return reports;
}
