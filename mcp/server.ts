#!/usr/bin/env node
/**
 * Spaghetti AI - MCP Server
 * Design System Generator based on Material Design 3
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import sharp from "sharp";

// Color utilities
import {
  Hct,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

// ============================================
// Types
// ============================================

interface HctColor {
  h: number;
  c: number;
  t: number;
}

interface ExtractedColor {
  hex: string;
  hct: HctColor;
  percentage: number;
}

interface ColorScale {
  "50": string;
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
  "950": string;
}

interface ThemeTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  onSurface: string;
  background: string;
  onBackground: string;
  outline: string;
  error: string;
  onError: string;
}

interface DesignSystem {
  primary: string;
  colorScale: ColorScale;
  lightTheme: ThemeTokens;
  darkTheme: ThemeTokens;
}

// ============================================
// Color Functions
// ============================================

function hexToHct(hex: string): HctColor {
  const argb = argbFromHex(hex);
  const hct = Hct.fromInt(argb);
  return { h: hct.hue, c: hct.chroma, t: hct.tone };
}

function hctToHex(h: number, c: number, t: number): string {
  const hct = Hct.from(h, c, t);
  return hexFromArgb(hct.toInt());
}

const TONE_SCALE: Record<keyof ColorScale, number> = {
  "50": 95,
  "100": 90,
  "200": 80,
  "300": 70,
  "400": 60,
  "500": 50,
  "600": 40,
  "700": 30,
  "800": 20,
  "900": 10,
  "950": 5,
};

function generateColorScale(seedHex: string): ColorScale {
  const { h, c } = hexToHct(seedHex);
  const scale: Partial<ColorScale> = {};

  for (const [key, tone] of Object.entries(TONE_SCALE)) {
    scale[key as keyof ColorScale] = hctToHex(h, c, tone);
  }

  return scale as ColorScale;
}

function generateLightTheme(seedHex: string): ThemeTokens {
  const { h, c } = hexToHct(seedHex);

  return {
    primary: hctToHex(h, c, 40),
    onPrimary: hctToHex(h, c, 100),
    primaryContainer: hctToHex(h, c, 90),
    onPrimaryContainer: hctToHex(h, c, 10),
    secondary: hctToHex(h, Math.max(c * 0.3, 8), 40),
    onSecondary: hctToHex(h, Math.max(c * 0.3, 8), 100),
    secondaryContainer: hctToHex(h, Math.max(c * 0.3, 8), 90),
    onSecondaryContainer: hctToHex(h, Math.max(c * 0.3, 8), 10),
    surface: hctToHex(h, 4, 98),
    onSurface: hctToHex(h, 4, 10),
    background: hctToHex(h, 2, 99),
    onBackground: hctToHex(h, 4, 10),
    outline: hctToHex(h, 8, 50),
    error: hctToHex(25, 84, 40),
    onError: "#FFFFFF",
  };
}

function generateDarkTheme(seedHex: string): ThemeTokens {
  const { h, c } = hexToHct(seedHex);

  return {
    primary: hctToHex(h, c, 80),
    onPrimary: hctToHex(h, c, 20),
    primaryContainer: hctToHex(h, c, 30),
    onPrimaryContainer: hctToHex(h, c, 90),
    secondary: hctToHex(h, Math.max(c * 0.3, 8), 80),
    onSecondary: hctToHex(h, Math.max(c * 0.3, 8), 20),
    secondaryContainer: hctToHex(h, Math.max(c * 0.3, 8), 30),
    onSecondaryContainer: hctToHex(h, Math.max(c * 0.3, 8), 90),
    surface: hctToHex(h, 4, 10),
    onSurface: hctToHex(h, 4, 90),
    background: hctToHex(h, 2, 6),
    onBackground: hctToHex(h, 4, 90),
    outline: hctToHex(h, 8, 60),
    error: hctToHex(25, 84, 80),
    onError: hctToHex(25, 84, 20),
  };
}

function generateDesignSystem(primaryHex: string): DesignSystem {
  return {
    primary: primaryHex,
    colorScale: generateColorScale(primaryHex),
    lightTheme: generateLightTheme(primaryHex),
    darkTheme: generateDarkTheme(primaryHex),
  };
}

// ============================================
// Export Functions
// ============================================

function exportToCss(system: DesignSystem): string {
  const lines = [
    "/* Spaghetti AI - Design System */",
    "/* Generated with Material Design 3 */",
    "",
    ":root {",
    `  /* Primary Color Scale */`,
  ];

  for (const [key, value] of Object.entries(system.colorScale)) {
    lines.push(`  --color-primary-${key}: ${value};`);
  }

  lines.push("", "  /* Light Theme */");
  for (const [key, value] of Object.entries(system.lightTheme)) {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --md-sys-color-${cssKey}: ${value};`);
  }

  lines.push("}", "", ".dark {");
  lines.push("  /* Dark Theme */");
  for (const [key, value] of Object.entries(system.darkTheme)) {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    lines.push(`  --md-sys-color-${cssKey}: ${value};`);
  }
  lines.push("}");

  return lines.join("\n");
}

function exportToTailwind(system: DesignSystem): string {
  const config = {
    theme: {
      extend: {
        colors: {
          primary: system.colorScale,
          surface: {
            light: system.lightTheme.surface,
            dark: system.darkTheme.surface,
          },
          background: {
            light: system.lightTheme.background,
            dark: system.darkTheme.background,
          },
        },
      },
    },
  };

  return `// Spaghetti AI - Tailwind Config
// Generated with Material Design 3

import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: ${JSON.stringify(config.theme.extend.colors, null, 8).replace(/"/g, "'")},
    },
  },
} satisfies Config;
`;
}

function exportToJson(system: DesignSystem): string {
  const tokens = {
    $schema:
      "https://design-tokens.github.io/community-group/format/token.json",
    color: {
      primary: {} as Record<string, { $value: string; $type: string }>,
      semantic: {
        light: {} as Record<string, { $value: string; $type: string }>,
        dark: {} as Record<string, { $value: string; $type: string }>,
      },
    },
  };

  for (const [key, value] of Object.entries(system.colorScale)) {
    tokens.color.primary[key] = { $value: value, $type: "color" };
  }

  for (const [key, value] of Object.entries(system.lightTheme)) {
    tokens.color.semantic.light[key] = { $value: value, $type: "color" };
  }

  for (const [key, value] of Object.entries(system.darkTheme)) {
    tokens.color.semantic.dark[key] = { $value: value, $type: "color" };
  }

  return JSON.stringify(tokens, null, 2);
}

function exportToFigma(system: DesignSystem): string {
  const variables = {
    name: "Spaghetti Design System",
    modes: ["Light", "Dark"],
    variables: [] as Array<{
      name: string;
      values: { Light: string; Dark: string };
    }>,
  };

  // Add color scale
  for (const [key, value] of Object.entries(system.colorScale)) {
    variables.variables.push({
      name: `primary/${key}`,
      values: { Light: value, Dark: value },
    });
  }

  // Add semantic tokens
  const lightEntries = Object.entries(system.lightTheme);
  const darkEntries = Object.entries(system.darkTheme);

  for (let i = 0; i < lightEntries.length; i++) {
    const [key, lightValue] = lightEntries[i];
    const darkValue = darkEntries[i][1];
    variables.variables.push({
      name: `semantic/${key}`,
      values: { Light: lightValue, Dark: darkValue },
    });
  }

  return JSON.stringify(variables, null, 2);
}

// ============================================
// Image Color Extraction (K-Means)
// ============================================

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(c1: RgbColor, c2: RgbColor): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function kMeansClustering(
  pixels: RgbColor[],
  k: number = 6,
  maxIterations: number = 20
): ExtractedColor[] {
  if (pixels.length === 0) return [];

  // Initialize centroids using K-Means++
  const centroids: RgbColor[] = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  while (centroids.length < k) {
    const distances = pixels.map((pixel) => {
      const minDist = Math.min(
        ...centroids.map((c) => colorDistance(pixel, c))
      );
      return minDist * minDist;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;

    for (let i = 0; i < pixels.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push(pixels[i]);
        break;
      }
    }
  }

  // K-Means iterations
  let assignments: number[] = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    const newAssignments = pixels.map((pixel) => {
      let minDist = Infinity;
      let minIdx = 0;
      centroids.forEach((centroid, idx) => {
        const dist = colorDistance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          minIdx = idx;
        }
      });
      return minIdx;
    });

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break;
    assignments = newAssignments;

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPixels = pixels.filter((_, idx) => assignments[idx] === i);
      if (clusterPixels.length > 0) {
        centroids[i] = {
          r: Math.round(
            clusterPixels.reduce((sum, p) => sum + p.r, 0) / clusterPixels.length
          ),
          g: Math.round(
            clusterPixels.reduce((sum, p) => sum + p.g, 0) / clusterPixels.length
          ),
          b: Math.round(
            clusterPixels.reduce((sum, p) => sum + p.b, 0) / clusterPixels.length
          ),
        };
      }
    }
  }

  // Calculate cluster sizes
  const clusterSizes = new Array(k).fill(0);
  assignments.forEach((a) => clusterSizes[a]++);

  // Create results
  const results: ExtractedColor[] = centroids.map((centroid, idx) => {
    const hex = rgbToHex(centroid.r, centroid.g, centroid.b);
    const hct = hexToHct(hex);
    return {
      hex,
      hct,
      percentage: Math.round((clusterSizes[idx] / pixels.length) * 100),
    };
  });

  // Sort by percentage (most dominant first)
  return results.sort((a, b) => b.percentage - a.percentage);
}

async function extractColorsFromImageUrl(
  imageUrl: string,
  colorCount: number = 6
): Promise<ExtractedColor[]> {
  // Fetch image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process with sharp
  const { data, info } = await sharp(buffer)
    .resize(100, 100, { fit: "cover" }) // Resize for performance
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Extract pixels
  const pixels: RgbColor[] = [];
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  }

  // Run K-Means clustering
  return kMeansClustering(pixels, colorCount);
}

function selectPrimaryColor(colors: ExtractedColor[]): ExtractedColor | null {
  if (colors.length === 0) return null;

  // Score each color based on chroma and percentage
  const scored = colors.map((color) => ({
    ...color,
    score: color.hct.c * 2 + color.percentage,
  }));

  // Sort by score and return best
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

// ============================================
// MCP Server
// ============================================

const server = new McpServer({
  name: "spaghetti-ai",
  version: "1.0.0",
});

// Tool: generate-design-system
server.tool(
  "generate-design-system",
  "Generate a complete Material Design 3 design system from a primary color",
  {
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .describe("Primary color in hex format (e.g., #5C6356)"),
  },
  async ({ primaryColor }) => {
    const system = generateDesignSystem(primaryColor);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(system, null, 2),
        },
      ],
    };
  }
);

// Tool: export-tokens
server.tool(
  "export-tokens",
  "Export design system tokens in various formats (css, tailwind, json, figma)",
  {
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .describe("Primary color in hex format"),
    format: z
      .enum(["css", "tailwind", "json", "figma"])
      .describe("Export format"),
  },
  async ({ primaryColor, format }) => {
    const system = generateDesignSystem(primaryColor);

    let output: string;
    switch (format) {
      case "css":
        output = exportToCss(system);
        break;
      case "tailwind":
        output = exportToTailwind(system);
        break;
      case "json":
        output = exportToJson(system);
        break;
      case "figma":
        output = exportToFigma(system);
        break;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: output,
        },
      ],
    };
  }
);

// Tool: analyze-color
server.tool(
  "analyze-color",
  "Analyze a color and get its HCT values and accessibility info",
  {
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .describe("Color in hex format"),
  },
  async ({ color }) => {
    const hct = hexToHct(color);

    // Calculate relative luminance for contrast
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance =
      0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

    const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);
    const contrastWithBlack = (luminance + 0.05) / (0 + 0.05);

    const analysis = {
      hex: color,
      hct: {
        hue: Math.round(hct.h),
        chroma: Math.round(hct.c),
        tone: Math.round(hct.t),
      },
      luminance: Math.round(luminance * 100) / 100,
      contrast: {
        withWhite: Math.round(contrastWithWhite * 100) / 100,
        withBlack: Math.round(contrastWithBlack * 100) / 100,
      },
      accessibility: {
        textOnWhite:
          contrastWithWhite >= 4.5
            ? "AA"
            : contrastWithWhite >= 3
              ? "AA-Large"
              : "Fail",
        textOnBlack:
          contrastWithBlack >= 4.5
            ? "AA"
            : contrastWithBlack >= 3
              ? "AA-Large"
              : "Fail",
      },
      recommendedTextColor: contrastWithWhite > contrastWithBlack ? "#FFFFFF" : "#000000",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }
);

// Tool: suggest-palette
server.tool(
  "suggest-palette",
  "Suggest complementary, analogous, or triadic colors based on a primary color",
  {
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .describe("Primary color in hex format"),
    harmony: z
      .enum(["complementary", "analogous", "triadic", "split-complementary"])
      .describe("Color harmony type"),
  },
  async ({ primaryColor, harmony }) => {
    const { h, c, t } = hexToHct(primaryColor);

    let colors: Array<{ name: string; hex: string; hue: number }> = [];

    switch (harmony) {
      case "complementary":
        colors = [
          { name: "primary", hex: primaryColor, hue: h },
          { name: "complementary", hex: hctToHex((h + 180) % 360, c, t), hue: (h + 180) % 360 },
        ];
        break;
      case "analogous":
        colors = [
          { name: "analogous-1", hex: hctToHex((h - 30 + 360) % 360, c, t), hue: (h - 30 + 360) % 360 },
          { name: "primary", hex: primaryColor, hue: h },
          { name: "analogous-2", hex: hctToHex((h + 30) % 360, c, t), hue: (h + 30) % 360 },
        ];
        break;
      case "triadic":
        colors = [
          { name: "primary", hex: primaryColor, hue: h },
          { name: "triadic-1", hex: hctToHex((h + 120) % 360, c, t), hue: (h + 120) % 360 },
          { name: "triadic-2", hex: hctToHex((h + 240) % 360, c, t), hue: (h + 240) % 360 },
        ];
        break;
      case "split-complementary":
        colors = [
          { name: "primary", hex: primaryColor, hue: h },
          { name: "split-1", hex: hctToHex((h + 150) % 360, c, t), hue: (h + 150) % 360 },
          { name: "split-2", hex: hctToHex((h + 210) % 360, c, t), hue: (h + 210) % 360 },
        ];
        break;
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ harmony, colors }, null, 2),
        },
      ],
    };
  }
);

// Tool: extract-colors-from-image
server.tool(
  "extract-colors-from-image",
  "Extract dominant colors from an image URL using K-Means clustering",
  {
    imageUrl: z
      .string()
      .url()
      .describe("URL of the image to extract colors from"),
    colorCount: z
      .number()
      .min(1)
      .max(12)
      .default(6)
      .describe("Number of colors to extract (1-12, default: 6)"),
  },
  async ({ imageUrl, colorCount }) => {
    try {
      const colors = await extractColorsFromImageUrl(imageUrl, colorCount);
      const primary = selectPrimaryColor(colors);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                extractedColors: colors,
                suggestedPrimary: primary,
                message: `Extracted ${colors.length} colors from image. Suggested primary: ${primary?.hex}`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Failed to extract colors",
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: create-design-system-from-image
server.tool(
  "create-design-system-from-image",
  "Extract colors from an image and generate a complete Material Design 3 design system",
  {
    imageUrl: z
      .string()
      .url()
      .describe("URL of the image to extract colors from"),
    format: z
      .enum(["json", "css", "tailwind", "figma", "all"])
      .default("json")
      .describe("Output format for the design system"),
  },
  async ({ imageUrl, format }) => {
    try {
      // Extract colors
      const colors = await extractColorsFromImageUrl(imageUrl, 6);
      const primary = selectPrimaryColor(colors);

      if (!primary) {
        throw new Error("Could not extract a suitable primary color from the image");
      }

      // Generate design system
      const system = generateDesignSystem(primary.hex);

      let output: string;
      if (format === "all") {
        output = JSON.stringify(
          {
            extractedColors: colors,
            primaryColor: primary.hex,
            designSystem: system,
            exports: {
              css: exportToCss(system),
              tailwind: exportToTailwind(system),
              json: exportToJson(system),
              figma: exportToFigma(system),
            },
          },
          null,
          2
        );
      } else {
        switch (format) {
          case "css":
            output = exportToCss(system);
            break;
          case "tailwind":
            output = exportToTailwind(system);
            break;
          case "figma":
            output = exportToFigma(system);
            break;
          default:
            output = JSON.stringify(
              {
                extractedColors: colors,
                primaryColor: primary.hex,
                designSystem: system,
              },
              null,
              2
            );
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: output,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Failed to create design system",
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Spaghetti AI MCP Server running on stdio");
}

main().catch(console.error);
