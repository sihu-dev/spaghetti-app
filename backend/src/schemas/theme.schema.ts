import { z } from 'zod';

// Hex color validation
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

// Theme extraction request schema
export const themeExtractRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
}).refine(
  (data) => data.imageUrl !== undefined,
  { message: 'Either image file or imageUrl is required' }
);

// Theme response schema
export const themeSchema = z.object({
  id: z.string().optional(),
  colors: z.array(hexColor).min(1).max(20),
  primary: hexColor.optional(),
  secondary: hexColor.optional(),
  accent: hexColor.optional(),
  background: hexColor.optional(),
  surface: hexColor.optional(),
  text: hexColor.optional(),
  mood: z.string().max(500).optional(),
  suggestion: z.string().max(1000).optional(),
  createdAt: z.string().datetime().optional(),
});

export type ThemeExtractRequest = z.infer<typeof themeExtractRequestSchema>;
export type Theme = z.infer<typeof themeSchema>;

// Claude AI response parsing schema (more lenient)
export const claudeThemeResponseSchema = z.object({
  colors: z.array(z.string()).min(1).max(20),
  primary: z.string().optional(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
  surface: z.string().optional(),
  text: z.string().optional(),
  mood: z.string().optional(),
  suggestion: z.string().optional(),
});

export type ClaudeThemeResponse = z.infer<typeof claudeThemeResponseSchema>;
