/**
 * @fileoverview Spaghetti AI - Color Engine
 * @description HCT 색공간 기반 색상 처리 시스템
 *
 * @module @/lib/color
 *
 * @example
 * ```typescript
 * import {
 *   extractColorsFromImage,
 *   generateColorRamp,
 *   getContrastRatio,
 *   generateThemePalette
 * } from '@/lib/color';
 *
 * // Extract colors from image
 * const colors = await extractColorsFromImage(imageUrl);
 *
 * // Generate color ramp
 * const ramp = generateColorRamp('#5C6356');
 *
 * // Check accessibility
 * const ratio = getContrastRatio('#5C6356', '#FFFFFF');
 *
 * // Generate theme with dark mode
 * const theme = generateThemePalette('#5C6356');
 * ```
 */

export * from "./extraction";
export * from "./hct";
export * from "./ramp";
export * from "./accessibility";
export * from "./darkmode";
