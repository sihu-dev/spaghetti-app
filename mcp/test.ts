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

  console.log("=== HCT Conversion Test ===");
  console.log(`Input: ${testColor}`);
  console.log(`HCT: H=${Math.round(hct.hue)}, C=${Math.round(hct.chroma)}, T=${Math.round(hct.tone)}`);

  // Convert back
  const backToHex = hexFromArgb(Hct.from(hct.hue, hct.chroma, hct.tone).toInt());
  console.log(`Back to Hex: ${backToHex}`);
  console.log(`Match: ${testColor.toLowerCase() === backToHex.toLowerCase() ? '✅' : '❌'}`);
  console.log("");
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

  console.log("=== Color Scale Test ===");
  console.log(`Seed: ${seedHex}`);
  console.log("");

  tones.forEach((tone, i) => {
    const hex = hexFromArgb(Hct.from(h, c, tone).toInt());
    console.log(`  ${labels[i].padStart(3)}: ${hex}`);
  });
  console.log("");
}

// Test Theme Generation
function testTheme() {
  const seedHex = "#5C6356";
  const { h, c } = (() => {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    return { h: hct.hue, c: hct.chroma };
  })();

  console.log("=== Theme Generation Test ===");
  console.log(`Seed: ${seedHex}`);
  console.log("");

  // Light Theme
  console.log("Light Theme:");
  console.log(`  primary:          ${hexFromArgb(Hct.from(h, c, 40).toInt())}`);
  console.log(`  onPrimary:        ${hexFromArgb(Hct.from(h, c, 100).toInt())}`);
  console.log(`  primaryContainer: ${hexFromArgb(Hct.from(h, c, 90).toInt())}`);
  console.log(`  surface:          ${hexFromArgb(Hct.from(h, 4, 98).toInt())}`);
  console.log("");

  // Dark Theme
  console.log("Dark Theme:");
  console.log(`  primary:          ${hexFromArgb(Hct.from(h, c, 80).toInt())}`);
  console.log(`  onPrimary:        ${hexFromArgb(Hct.from(h, c, 20).toInt())}`);
  console.log(`  primaryContainer: ${hexFromArgb(Hct.from(h, c, 30).toInt())}`);
  console.log(`  surface:          ${hexFromArgb(Hct.from(h, 4, 10).toInt())}`);
  console.log("");
}

// Test Palette Suggestions
function testPalette() {
  const seedHex = "#5C6356";
  const { h, c, t } = (() => {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    return { h: hct.hue, c: hct.chroma, t: hct.tone };
  })();

  console.log("=== Palette Suggestions Test ===");
  console.log(`Seed: ${seedHex} (H=${Math.round(h)})`);
  console.log("");

  console.log("Complementary:");
  console.log(`  Primary:       ${seedHex}`);
  console.log(`  Complementary: ${hexFromArgb(Hct.from((h + 180) % 360, c, t).toInt())}`);
  console.log("");

  console.log("Triadic:");
  console.log(`  Primary:   ${seedHex}`);
  console.log(`  Triadic 1: ${hexFromArgb(Hct.from((h + 120) % 360, c, t).toInt())}`);
  console.log(`  Triadic 2: ${hexFromArgb(Hct.from((h + 240) % 360, c, t).toInt())}`);
  console.log("");
}

// Run all tests
console.log("🍝 Spaghetti AI - MCP Server Tests\n");
console.log("================================\n");

testHct();
testColorScale();
testTheme();
testPalette();

console.log("================================");
console.log("✅ All tests completed!");
