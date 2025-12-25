export interface Theme {
  id?: string;
  colors: string[];
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  mood?: string;
  suggestion?: string;
  createdAt?: string;
  savedAt?: string;
}

export interface ThemeRequest {
  imageFile?: Express.Multer.File;
  imageUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  previewImage: string;
  componentType: string;
  props: Record<string, unknown>;
  createdAt: Date;
}

export type TemplateCategory = 'hero' | 'navigation' | 'card' | 'footer' | 'form' | 'layout' | 'other';

export interface Assembly {
  id: string;
  templateId: string;
  themeId: string;
  customizations?: AssemblyCustomizations;
  generatedCode: string;
  createdAt: Date;
}

export interface AssemblyCustomizations {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  [key: string]: unknown;
}

export interface AssemblyGenerationRequest {
  templateId: string;
  themeId: string;
  customizations?: AssemblyCustomizations;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
