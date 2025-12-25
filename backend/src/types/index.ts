import { ErrorCode } from '../utils/errors';

// Re-export schema types
export type { Theme, ThemeExtractRequest } from '../schemas/theme.schema';
export type { Assembly, AssemblyGenerateRequest } from '../schemas/assembly.schema';

// Alias for backwards compatibility
export type AssemblyGenerationRequest = import('../schemas/assembly.schema').AssemblyGenerateRequest;

// Template type
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  previewImage: string;
  componentType: string;
  props: Record<string, unknown>;
  createdAt: Date;
}

// Legacy ThemeRequest (for backwards compatibility)
export interface ThemeRequest {
  imageFile?: Express.Multer.File;
  imageUrl?: string;
}

// Standard API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
  timestamp: string;
}

// Success Response Helper
export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Error Response Helper
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
