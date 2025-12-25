import { z } from 'zod';

// Assembly generation request schema
export const assemblyGenerateRequestSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  themeId: z.string().min(1, 'Theme ID is required'),
  customizations: z.record(z.unknown()).optional(),
});

// Assembly response schema
export const assemblySchema = z.object({
  id: z.string(),
  templateId: z.string(),
  themeId: z.string(),
  customizations: z.record(z.unknown()).optional(),
  generatedCode: z.string(),
  createdAt: z.string().datetime(),
});

export type AssemblyGenerateRequest = z.infer<typeof assemblyGenerateRequestSchema>;
export type Assembly = z.infer<typeof assemblySchema>;
