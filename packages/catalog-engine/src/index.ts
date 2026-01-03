/**
 * @unilab/catalog-engine
 * AI-powered product catalog generation engine
 *
 * Features:
 * - Vision AI: Extract product specs from images (OpenAI GPT-4o)
 * - Agent: Autonomous catalog creation pipeline
 * - PDF Generation: Professional catalog templates
 * - Color Extraction: Brand color analysis (HCT algorithm)
 */

// AI Vision
export { extractProductInfo, extractBrandColors } from "./ai/vision";
export type { ProductInfo } from "./ai/vision";

// AI Agent
export { CatalogAgent } from "./ai/agent";
export type { AgentTask, AgentStep, AgentStepName } from "./ai/agent";

// PDF Generation
export { generateCatalogPDF, productInfoToCatalogData, generateMultilingualCatalogs } from "./pdf/generator";
export { CatalogDocument } from "./pdf/catalog-template";
export type { CatalogData } from "./pdf/catalog-template";

// Color Extraction
export { extractColorsFromImage } from "./color/extraction";
export { generateColorRamp } from "./color/ramp";
export { checkAccessibility, checkContrast } from "./color/accessibility";
export { generateDarkMode } from "./color/darkmode";
export type { ColorPalette, ColorToken } from "./color/types";
