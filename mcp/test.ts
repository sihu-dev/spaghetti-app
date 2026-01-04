/**
 * MCP Server Test Script
 * Run with: npx tsx test.ts
 */

import { Hct, argbFromHex, hexFromArgb } from "@material/material-color-utilities";

// Test HCT conversion
function testHct() {
  const testColor = "#5C6356";
  const argb = argbFromHex(testColor);
  const hct = Hct.fromInt(argb);

  console.warn("=== HCT Conversion Test ===");
  console.warn(`Input: ${testColor}`);
  console.warn(`HCT: H=${Math.round(hct.hue)}, C=${Math.round(hct.chroma)}, T=${Math.round(hct.tone)}`);

  // Convert back
  const backToHex = hexFromArgb(Hct.from(hct.hue, hct.chroma, hct.tone).toInt());
  console.warn(`Back to Hex: ${backToHex}`);
  console.warn(`Match: ${testColor.toLowerCase() === backToHex.toLowerCase() ? '✅' : '❌'}`);
  console.warn("");
}

// Test Color Scale Generation
function testColorScale() {
  const seedHex = "#5C6356";
  const { h, c } = (() => {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    return { h: hct.hue, c: hct.chroma };
  })();

  const tones = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
  const labels = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

  console.warn("=== Color Scale Test ===");
  console.warn(`Seed: ${seedHex}`);
  console.warn("");

  tones.forEach((tone, i) => {
    const hex = hexFromArgb(Hct.from(h, c, tone).toInt());
    console.warn(`  ${labels[i].padStart(3)}: ${hex}`);
  });
  console.warn("");
}

// Test Theme Generation
function testTheme() {
  const seedHex = "#5C6356";
  const { h, c } = (() => {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    return { h: hct.hue, c: hct.chroma };
  })();

  console.warn("=== Theme Generation Test ===");
  console.warn(`Seed: ${seedHex}`);
  console.warn("");

  // Light Theme
  console.warn("Light Theme:");
  console.warn(`  primary:          ${hexFromArgb(Hct.from(h, c, 40).toInt())}`);
  console.warn(`  onPrimary:        ${hexFromArgb(Hct.from(h, c, 100).toInt())}`);
  console.warn(`  primaryContainer: ${hexFromArgb(Hct.from(h, c, 90).toInt())}`);
  console.warn(`  surface:          ${hexFromArgb(Hct.from(h, 4, 98).toInt())}`);
  console.warn("");

  // Dark Theme
  console.warn("Dark Theme:");
  console.warn(`  primary:          ${hexFromArgb(Hct.from(h, c, 80).toInt())}`);
  console.warn(`  onPrimary:        ${hexFromArgb(Hct.from(h, c, 20).toInt())}`);
  console.warn(`  primaryContainer: ${hexFromArgb(Hct.from(h, c, 30).toInt())}`);
  console.warn(`  surface:          ${hexFromArgb(Hct.from(h, 4, 10).toInt())}`);
  console.warn("");
}

// Test Palette Suggestions
function testPalette() {
  const seedHex = "#5C6356";
  const { h, c, t } = (() => {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    return { h: hct.hue, c: hct.chroma, t: hct.tone };
  })();

  console.warn("=== Palette Suggestions Test ===");
  console.warn(`Seed: ${seedHex} (H=${Math.round(h)})`);
  console.warn("");

  console.warn("Complementary:");
  console.warn(`  Primary:       ${seedHex}`);
  console.warn(`  Complementary: ${hexFromArgb(Hct.from((h + 180) % 360, c, t).toInt())}`);
  console.warn("");

  console.warn("Triadic:");
  console.warn(`  Primary:   ${seedHex}`);
  console.warn(`  Triadic 1: ${hexFromArgb(Hct.from((h + 120) % 360, c, t).toInt())}`);
  console.warn(`  Triadic 2: ${hexFromArgb(Hct.from((h + 240) % 360, c, t).toInt())}`);
  console.warn("");
}

// Run all tests
console.warn("🍝 Spaghetti AI - MCP Server Tests\n");
console.warn("================================\n");

testHct();
testColorScale();
testTheme();
testPalette();

console.warn("================================");
console.warn("✅ All tests completed!");
